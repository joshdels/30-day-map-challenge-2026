import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { DayMediaFigure } from "@/components/day-media";
import { dayPath, getPrompt, getPromptDescription } from "@/lib/challenge";
import { getDay, isPublished } from "@/lib/days";

export default async function DayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day: dayParam } = await params;
  const day = Number(dayParam);
  const prompt = getPrompt(day);
  const description = getPromptDescription(day);
  const content = getDay(day);
  if (!prompt || !/^\d{2}$/.test(dayParam)) notFound();

  // Unpublished day → intentional "coming soon" route.
  if (!content)
    return (
      <main className="coming-page">
        <SiteHeader />
        <section className="coming-content">
          <p className="eyebrow">
            <span /> DAY {dayParam} / NOVEMBER {day}
          </p>
          <span className="giant-number" aria-hidden="true">{dayParam}</span>
          <h1>{prompt}</h1>
          <p className="theme-description">{description}</p>
          <p className="coming-note">
            Joshua&rsquo;s map for this theme is coming soon.
          </p>
          <Link className="text-link" href="/#gallery">
            <ArrowLeft size={18} /> Exit to the gallery
          </Link>
        </section>
      </main>
    );

  const next = Array.from({ length: 30 - day }, (_, i) => day + 1 + i).find(
    isPublished,
  );
  const figLabel = content.figLabel ?? `FIG. ${String(day).padStart(3, "0")}`;

  return (
    <main className="day-page">
      <SiteHeader />
      <section className="day-intro">
        <div>
          <p className="eyebrow">
            <span /> DAY {dayParam} / NOVEMBER {day}
          </p>
          <h1>{prompt}</h1>
          <p className="dek">{content.dek}</p>
        </div>
        {content.note && <p className="day-intro-note">{content.note}</p>}
        <span className="giant-number" aria-hidden="true">{dayParam}</span>
      </section>

      <DayMediaFigure
        media={content.media}
        figLabel={figLabel}
        caption={content.caption}
        day={day}
        bleed={
          "bleed" in content.media
            ? content.media.bleed
            : content.media.kind !== "custom"
        }
      />

      <section className="essay">
        <p className="eyebrow">
          <span /> FIELD NOTE {String(day).padStart(3, "0")}
        </p>
        <div>
          {content.essay.map((block, i) => (
            <div key={i} className="essay-block">
              {block.heading && <h2>{block.heading}</h2>}
              <p>{block.body}</p>
            </div>
          ))}
        </div>
      </section>

      <nav className="day-nav">
        <Link href="/#gallery">
          <ArrowLeft size={17} /> All maps
        </Link>
        {next && (
          <Link href={dayPath(next)}>
            Next: {getPrompt(next)} <ArrowRight size={17} />
          </Link>
        )}
      </nav>
    </main>
  );
}

export function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: String(i + 1).padStart(2, "0"),
  }));
}
