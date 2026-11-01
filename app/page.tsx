import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { dayPath, prompts } from "@/lib/challenge";
import { isPublished } from "@/lib/days";

export default function Home() {
  return (
    <main className="home-page">
      <SiteHeader />
      <section className="about-challenge" aria-labelledby="about-title">
        <div className="about-kicker">
          <p className="eyebrow">
            <span /> THE CHALLENGE
          </p>
          <span className="about-count" aria-hidden="true">
            <i>#</i>30
            <br />
            Day Map
            <br />
            Challenge
          </span>
        </div>
        <div className="about-copy">
          <h2 id="about-title">
            Daily social mapping,
            <br />
            <em>every November.</em>
          </h2>
          <div className="about-body">
            <p>
              The official home of <strong>#30DayMapChallenge</strong> is a
              daily mapping challenge open to everyone. Participants create one
              map a day for 30 days each based on a different theme and share it
              on social media.
            </p>
            <p>
              The 2026 challenge runs from 1 to 30 November. This gallery
              answers every theme through Philippine places, stories, and data.
            </p>
            <p className="sponsor-note">
              2026 challenge sponsored by <strong>Mapbox</strong>. Any tools and
              data are welcome.
            </p>
          </div>
        </div>
        <ol className="challenge-steps">
          <li>
            <span>01</span>
            <strong>Read the theme</strong>
            <p>A new cartographic prompt for every day of November.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Make a map</strong>
            <p>Any tool, any data, any style. Exploration comes first.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Share it</strong>
            <p>Publish with #30DayMapChallenge and join the global atlas.</p>
          </li>
        </ol>
      </section>
      <section className="index-section" id="gallery">
        <div className="section-heading index-title">
          <div>
            <p className="eyebrow">
              <span /> THE 2026 GALLERY
            </p>
            <h2>November, mapped daily.</h2>
          </div>
        </div>

        <div className="prompt-grid">
          {prompts.map((prompt, index) => {
            const day = index + 1;
            const live = isPublished(day);
            return (
              <Link
                key={day}
                href={dayPath(day)}
                className={live ? "prompt-card live" : "prompt-card"}
              >
                <div className="prompt-top">
                  <span className="prompt-day">
                    {String(day).padStart(2, "0")}
                  </span>
                  <span className="prompt-number">
                    NOV {String(day).padStart(2, "0")} · 2026
                  </span>
                </div>
                <strong>{prompt}</strong>
                <span className="prompt-state">
                  {live ? (
                    <>
                      <i /> View map →
                    </>
                  ) : (
                    "Coming soon"
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <footer>
        <p>
          Mapped from the Philippines <span>✦</span> Made for #30DayMapChallenge
          2026
        </p>
        <p>Follow the journey →</p>
      </footer>
    </main>
  );
}
