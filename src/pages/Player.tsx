import { useState, useEffect, Fragment } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams, useSearchParams } from "react-router-dom"

import conf from "../config";

export default function Player() {
  const { id } = useParams();
  const [s] = useSearchParams();

  const [loaded, setLoaded] = useState<boolean>(false);

  const [type, setType] = useState<"tv" | "movie">();

  const [season, setSeason] = useState<number>();
  const [episode, setEpisode] = useState<number>();

  const [maxSeasons, setMaxSeasons] = useState<number>();
  const [maxEpisodes, setMaxEpisodes] = useState<number>();

  const [source, setSource] = useState(1); // default source is 1

  function showNext() {
    if (!season || !episode || !maxSeasons || !maxEpisodes) {
      return false;
    }

    if (season < maxSeasons || episode < maxEpisodes) {
      return true;
    }

    return false;
  }

  function getNext() {
    if (!season || !episode || !maxSeasons || !maxEpisodes) {
      return "";
    }

    if (episode < maxEpisodes) {
      return `?s=${season}&e=${episode + 1}&ms=${maxSeasons}&me=${maxEpisodes}`;
    }

    if (season < maxSeasons) {
      return `?s=${season + 1}&e=1&ms=${maxSeasons}&me=${maxEpisodes}`;
    }

    return "";
  }

  function onNextClick() {
    setType(undefined);
    setSource(1); // reset source to default when changing episodes
  }

  useEffect(() => {
    setLoaded(false);

    if (s.has("s") && s.has("e")) {
      let nSeason = parseInt(s.get("s")!);
      let nEpisode = parseInt(s.get("e")!);

      if (!nSeason || !nEpisode) {
        return;
      }

      if (nSeason < 1) nSeason = 1;
      if (nEpisode < 1) nEpisode = 1;

      setType("tv");
      setSeason(nSeason);
      setEpisode(nEpisode);

      if (s.has("ms") && s.has("me")) {
        let mSeasons = parseInt(s.get("ms")!);
        let mEpisodes = parseInt(s.get("me")!);

        if (!mSeasons || !mEpisodes) {
          return;
        }

        if (mSeasons < 1) mSeasons = 1;
        if (mEpisodes < 1) mEpisodes = 1;

        setMaxSeasons(mSeasons);
        setMaxEpisodes(mEpisodes);
      }
    }
    else {
      setType("movie");
    }
  }, [id, s]);

  let srcUrl = "";
  if (source === 1) {
    srcUrl = `https://vidsrc.xyz/embed/${id}${season ? "/" + season : ""}${episode ? "-" + episode : ""}`;
  } else if (source === 2) {
    srcUrl = `https://upgrade.wtf/stream4/?id=${id}${season ? "&s=" + season : ""}${episode ? "&e=" + episode : ""}`;
  } else if (source === 3) {
    srcUrl = `https://embed.smashystream.com/playere.php?tmdb=${id}${season ? "&season=" + season : ""}${episode ? "&episode=" + episode : ""}`;
  }

  return (
    <Fragment>
      <Helmet>
        <title>Player - {conf.SITE_TITLE}</title>
      </Helmet>

      {
        !loaded &&
        <div className="loading">
          <div className="spinner">
            <i className="fa-solid fa-spinner-third"></i>
          </div>
        </div>
      }

      <div className="player">
        {
          typeof type !== "undefined" &&
          <div style={{ width: '100%', height: '100%' }}>
            <iframe allowFullScreen onLoad={() => setLoaded(true)} src={srcUrl}></iframe>
            <script src="https://filters.adtidy.org/extension/firefox/filters.js"></script>
            <script src="https://filters.adtidy.org/extension/chromium/filters.js"></script>
          </div>
        }

        {
          loaded &&
          <div className="overlay">
            <Link to="/">
              <i className="fa-solid fa-home"></i>
            </Link>

            {type && type === "tv" && showNext() && (
              <Link to={getNext()} onClick={() => onNextClick()}>
                <i className="fa-solid fa-forward-step"></i>
              </Link>
            )}

            <button onClick={() => setSource(1)} style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', padding: '5px', color: 'white' }}>
              <i className="fa-solid fa-video"></i> Source 1
            </button>

            <button onClick={() => setSource(2)} style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', padding: '5px', color: 'white' }}>
              <i className="fa-solid fa-video"></i> Source 2
            </button>

            <button onClick={() => setSource(3)} style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', padding: '5px', color: 'white' }}>
            <i className="fa-solid fa-video"></i> Source 3
          </button>

            <Link to={`/${type}/${id}`}>
              <i className="fa-solid fa-close"></i>
            </Link>

          </div>

        }
      </div>
    </Fragment>
  )
}