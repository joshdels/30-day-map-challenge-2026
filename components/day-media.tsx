import type { DayMedia, DataCredit } from "@/lib/days";

function Credit({ credit }: { credit: DataCredit }) {
  return (
    <dl className="data-credit">
      <div>
        <dt>Source</dt>
        <dd>
          {credit.url ? (
            <a href={credit.url} target="_blank" rel="noreferrer">
              {credit.source}
            </a>
          ) : (
            credit.source
          )}
        </dd>
      </div>
      <div>
        <dt>License</dt>
        <dd>{credit.license}</dd>
      </div>
      <div>
        <dt>Retrieved</dt>
        <dd>{credit.retrieved}</dd>
      </div>
      <div>
        <dt>Coverage</dt>
        <dd>{credit.coverage}</dd>
      </div>
      {credit.fields && (
        <div>
          <dt>Fields</dt>
          <dd>{credit.fields}</dd>
        </div>
      )}
      {credit.transformations && (
        <div>
          <dt>Transformations</dt>
          <dd>{credit.transformations}</dd>
        </div>
      )}
    </dl>
  );
}

/** YouTube/Vimeo links become an iframe; everything else is a <video>. */
function VideoMedia({ src, poster, embed }: { src: string; poster?: string; embed?: boolean }) {
  const isEmbed = embed ?? /youtube\.com|youtu\.be|vimeo\.com/.test(src);
  if (isEmbed) {
    return (
      <iframe
        className="day-media-frame"
        src={src}
        title="Map video"
        loading="lazy"
        allow="fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <video className="day-media-video" controls preload="metadata" poster={poster}>
      <source src={src} />
      Your browser cannot play this video.
    </video>
  );
}

export function DayMediaFigure({
  media,
  figLabel,
  caption,
  day,
}: {
  media: DayMedia;
  figLabel: string;
  caption: string;
  day: number;
}) {
  const credit = "credit" in media ? media.credit : undefined;
  const illustrative = "illustrative" in media ? media.illustrative : false;

  return (
    <section className="map-stage" aria-label={`Day ${day} map: ${caption}`}>
      <div className="map-meta">
        <span>122&deg; E</span>
        <span>PH / {String(day).padStart(2, "0")}</span>
        <span>6&deg; N</span>
      </div>

      <div className="map-media">
        {media.kind === "custom" && media.render()}

        {media.kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="day-media-img"
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading="lazy"
          />
        )}

        {media.kind === "video" && (
          <VideoMedia src={media.src} poster={media.poster} embed={media.embed} />
        )}

        {media.kind === "webgis" && (
          <iframe
            className="day-media-frame"
            src={media.embedUrl}
            title={media.title}
            loading="lazy"
            allow="fullscreen"
            allowFullScreen
          />
        )}
      </div>

      <div className="map-caption">
        <span>{figLabel}</span>
        <p>{caption}</p>
        {illustrative && (
          <p className="illustrative-tag">
            Illustrative graphic — synthetic geometry, not measured data.
          </p>
        )}
        {credit && <Credit credit={credit} />}
      </div>
    </section>
  );
}
