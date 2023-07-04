import conf from "../../config";

export default function Footer(){
  return (
    <footer>
      <img src="/assets/logo.png" alt="Logo" />

      <div className="links">
        {
          conf.SITE_DISCORD &&
          <a href={conf.SITE_DISCORD} target="_blank">Discord</a>
        }

        {
          conf.SITE_CREDITS &&
          <a href="https://ripper.lol" target="_blank">🎨 by ripper.lol</a>
        }
      </div>

      <p className="disclaimer">&copy; {conf.SITE_TITLE}. We do not store any media.</p>
    </footer>
  )
}