/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Movie from '@/types/Movie';
import Series from '@/types/Series';
import MediaType from '@/types/MediaType';
import MediaShort from '@/types/MediaShort';

const API_BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Watch() {
  const nav = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const [type, setType] = useState<MediaType>('movie');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [maxEpisodes, setMaxEpisodes] = useState(1);
  const [data, setData] = useState<Movie | Series | null>(null);
  const [seasonId, setSeasonId] = useState('');
  const [episodeId, setEpisodeId] = useState('');

  function addViewed(newData: MediaShort) {
    let viewed: MediaShort[] = JSON.parse(localStorage.getItem('viewed') || '[]');
    const existingIndex = viewed.findIndex(v => v.id === newData.id);
    if (existingIndex !== -1) {
      viewed.splice(existingIndex, 1);
    }
    viewed.unshift(newData);
    viewed = viewed.slice(0, 15);
    localStorage.setItem('viewed', JSON.stringify(viewed));
  }

  async function fetchData(endpoint: string) {
    const apiKey = '9ef876e181780c5fa05b91d3706ab166';
    const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&append_to_response=external_ids`);
    return response.json();
  }

  async function getData(_type: MediaType) {
    try {
      const endpoint = _type === 'movie' ? `movie/${id}` : `tv/${id}`;
      const data = await fetchData(endpoint);
      if (!data) {
        console.error('Failed to fetch data');
        return;
      }

      setData(data);

      if (_type === 'series') {
        const seasonData = data.seasons.find((s: any) => s.season_number === season);
        if (seasonData) {
          setSeasonId(seasonData.id);
          console.log(`Set season ID: ${seasonData.id} for season ${season}`);
          
          const fullSeasonData = await fetchData(`tv/${id}/season/${season}`);
          if (fullSeasonData && fullSeasonData.episodes) {
            const episodeData = fullSeasonData.episodes.find((e: any) => e.episode_number === episode);
            if (episodeData) {
              setEpisodeId(episodeData.id.toString());
              console.log(`Set episode ID: ${episodeData.id} for S${season}E${episode}`);
            } else {
              console.error(`Episode ${episode} not found in season ${season}`);
            }
            setMaxEpisodes(fullSeasonData.episodes.length);
          } else {
            console.error(`Failed to fetch full season data for season ${season}`);
          }
        } else {
          console.error(`Season ${season} not found`);
        }
      }

      addViewed({
        id: data.id,
        poster: data.poster_path ? `${API_BASE_IMAGE_URL}${data.poster_path}` : '',
        title: data.name || data.title,
        type: _type,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    const s = search.get('s');
    const e = search.get('e');
    console.log(`URL params - s: ${s}, e: ${e}`);
    if (s && e) {
      const seasonNum = parseInt(s);
      const episodeNum = parseInt(e);
      setSeason(seasonNum);
      setEpisode(episodeNum);
      setType('series');
    } else {
      setType('movie');
    }

    localStorage.setItem(
      'continue_' + id,
      JSON.stringify({
        season: parseInt(s || '1'),
        episode: parseInt(e || '1'),
      })
    );
  }, [id, search]);

  useEffect(() => {
    getData(type);
  }, [id, type, season, episode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  function getSource() {
    if (!data) return '';
    
    let url = `https://watchondemand.buzz/media/tmdb-`;
    if (type === 'series') {
      url += `tv-${id}`;
      if (seasonId && episodeId) {
        url += `/${seasonId}/${episodeId}`;
      }
    } else {
      url += `movie-${id}`;
    }
    console.log(`Generated source URL: ${url}`);
    return url;
  }

  function getTitle() {
    let title = data ? ('name' in data ? data.name : 'title' in data ? data.title : 'Watch') : 'Watch';
    if (type === 'series') title += ` S${season} E${episode}`;
    return title;
  }

  return (
    <>
      <Helmet>
        <title>
          {getTitle()} - {import.meta.env.VITE_APP_NAME}
        </title>
      </Helmet>

      <div className="player">
        <div className="player-controls">
          <i className="fa-regular fa-arrow-left" onClick={() => nav(`/${type}/${id}`)}></i>
          {type === 'series' && episode < maxEpisodes && (
            <i
              className="fa-regular fa-forward-step right"
              onClick={() => nav(`/watch/${id}?s=${season}&e=${episode + 1}`)}
            ></i>
          )}
        </div>

        <h2 className="player-title">{getTitle()}</h2>
        <iframe allowFullScreen referrerPolicy="origin" title={getTitle()} src={getSource()}></iframe>
      </div>
    </>
  );
}