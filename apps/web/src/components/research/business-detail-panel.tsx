import {
  ArrowUpRight,
  Crosshair,
  Database,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";
import type { ReactNode } from "react";

import { toSafeExternalUrl } from "@/lib/external-url";

interface BusinessDetail {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  emails: string[] | null;
  socialLinks: Record<string, string> | null;
  sourceUrl: string | null;
}

export function BusinessDetailPanel({ place }: { place: BusinessDetail | null }) {
  if (!place) {
    return (
      <section className="flex min-h-80 flex-col justify-between rounded-xl border border-dashed border-[var(--rule-strong)] bg-[var(--paper-subtle)] p-6">
        <span className="grid size-11 place-items-center rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]">
          <Crosshair aria-hidden="true" size={21} />
        </span>
        <div>
          <p className="eyebrow">Business inspector</p>
          <h2 className="type-display mt-3 text-4xl leading-[0.95] tracking-[-0.05em] text-[var(--ink)]">Choose a point on the map.</h2>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
            Select a marker to inspect the address, phone, website, email, social profiles, and original source record.
          </p>
        </div>
      </section>
    );
  }

  const socialLinks = Object.entries(place.socialLinks ?? {}).flatMap(
    ([network, href]) => {
      const safeHref = toSafeExternalUrl(href);
      return safeHref ? [[network, safeHref] as const] : [];
    },
  );
  const website = toSafeExternalUrl(place.website);
  const sourceUrl = toSafeExternalUrl(place.sourceUrl);
  const email = place.emails?.[0] ?? null;

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-soft)]" id={`business-${place.id}`}>
      <div className="bg-[var(--graphite)] p-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[0.64rem] font-bold tracking-[0.12em] text-[#93a9da] uppercase">Selected business</p>
          <span className="size-2 rounded-full bg-[#6f8fff] shadow-[0_0_0_4px_rgb(49_94_245/0.18)]" />
        </div>
        <h2 className="type-display mt-6 text-4xl leading-[0.92] tracking-[-0.05em] text-white">{place.name}</h2>
        <p className="mt-3 text-sm text-[#afbdd2]">{place.category ?? "Uncategorized business"}</p>
      </div>

      <dl className="divide-y divide-[var(--rule)]">
        <Detail icon={<MapPin aria-hidden="true" size={16} />} label="Address" value={place.address} />
        <Detail
          href={place.phone ? `tel:${place.phone.replaceAll(/[^+\d]/g, "")}` : null}
          icon={<Phone aria-hidden="true" size={16} />}
          label="Phone"
          value={place.phone}
        />
        <Detail
          href={email ? `mailto:${encodeURIComponent(email)}` : null}
          icon={<Mail aria-hidden="true" size={16} />}
          label="Email"
          value={email}
        />
        <Detail href={website} icon={<Globe2 aria-hidden="true" size={16} />} label="Website" value={website ? new URL(website).hostname.replace("www.", "") : null} />
        <Detail href={sourceUrl} icon={<Database aria-hidden="true" size={16} />} label="Source" value={sourceUrl ? "Open original record" : null} />
      </dl>

      <div className="border-t border-[var(--rule)] bg-[var(--paper-subtle)] p-5">
        <p className="flex items-center gap-2 font-mono text-[0.62rem] font-bold tracking-[0.1em] text-[var(--ink-faint)] uppercase">
          <Share2 aria-hidden="true" size={14} />Provider social profiles
        </p>
        {socialLinks.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {socialLinks.map(([network, href]) => (
              <a className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--rule-strong)] bg-white px-3 text-xs font-bold capitalize text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]" href={href} key={network} rel="noreferrer" target="_blank">
                {network}<ArrowUpRight aria-hidden="true" size={13} />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs leading-5 text-[var(--ink-faint)]">No social profile was supplied by this provider.</p>
        )}
      </div>
    </section>
  );
}

function Detail({
  href,
  icon,
  label,
  value,
}: {
  href?: string | null;
  icon: ReactNode;
  label: string;
  value: string | null;
}) {
  const external = Boolean(href?.startsWith("http"));
  return (
    <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 px-5 py-4">
      <span className="mt-0.5 text-[var(--accent)]">{icon}</span>
      <div>
        <dt className="font-mono text-[0.59rem] font-bold tracking-[0.09em] text-[var(--ink-faint)] uppercase">{label}</dt>
        <dd className="mt-1 break-words text-sm leading-5 text-[var(--ink-soft)]">
          {value ? (
            href ? (
              <a className="text-link inline-flex items-start gap-1.5 font-semibold" href={href} rel={external ? "noreferrer" : undefined} target={external ? "_blank" : undefined}>
                {value}{external ? <ArrowUpRight aria-hidden="true" className="mt-0.5 shrink-0" size={12} /> : null}
              </a>
            ) : value
          ) : (
            <span className="text-[var(--ink-faint)]">Not available from this source</span>
          )}
        </dd>
      </div>
    </div>
  );
}
