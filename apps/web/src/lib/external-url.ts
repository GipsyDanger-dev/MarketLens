/**
 * URLs from place-data providers are untrusted input. Only allow normal web
 * links before they are persisted or rendered as anchors in the application.
 */
export function toSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function sanitizeExternalLinks(
  links: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!links) return {};

  return Object.fromEntries(
    Object.entries(links).flatMap(([network, value]) => {
      const url = toSafeExternalUrl(value);
      return url ? [[network, url]] : [];
    }),
  );
}
