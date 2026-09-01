interface BusinessDetail {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  sourceUrl: string | null;
}

export function BusinessDetailPanel({
  place,
}: {
  place: BusinessDetail | null;
}) {
  if (!place)
    return (
      <section className="paper-panel p-5">
        <p className="eyebrow">Business detail</p>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          Select a business from the map, ranking, or table to inspect the
          contact information collected from its source.
        </p>
      </section>
    );

  const links = Object.entries(place.socialLinks ?? {});
  return (
    <section className="paper-panel p-5" id={`business-${place.id}`}>
      <div className="border-b border-[var(--rule)] pb-4">
        <p className="eyebrow">Business detail</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
          {place.name}
        </h2>
        {place.category ? (
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {place.category}
          </p>
        ) : null}
      </div>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <Detail label="Address" value={place.address} />
        <Detail
          label="Phone"
          value={place.phone}
          href={
            place.phone ? `tel:${place.phone.replaceAll(/[^+\d]/g, "")}` : null
          }
        />
        <Detail label="Website" value={place.website} href={place.website} />
        <Detail
          label="Source record"
          value={place.sourceUrl ? "Open source record" : null}
          href={place.sourceUrl}
        />
      </dl>
      {links.length > 0 ? (
        <div className="mt-5 border-t border-[var(--rule)] pt-4">
          <p className="data-label">Social links supplied by the provider</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map(([network, href]) => (
              <a
                className="inline-flex min-h-10 items-center border border-[var(--rule-strong)] px-3 text-sm font-semibold capitalize text-[var(--ink)] transition-colors hover:bg-[var(--accent-wash)]"
                href={href}
                key={network}
                rel="noreferrer"
                target="_blank"
              >
                {network}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Detail({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null;
  href?: string | null;
}) {
  return (
    <div>
      <dt className="data-label">{label}</dt>
      <dd className="mt-1 break-words text-[var(--ink-soft)]">
        {value ? (
          href ? (
            <a
              className="text-[var(--accent)] underline underline-offset-3"
              href={href}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              target={href.startsWith("http") ? "_blank" : undefined}
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          "Not available from this source"
        )}
      </dd>
    </div>
  );
}
