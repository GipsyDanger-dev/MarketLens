import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type HostResolver = (hostname: string) => Promise<string[]>;

const resolveHost: HostResolver = async (hostname) =>
  (await lookup(hostname, { all: true, verbatim: true })).map(
    ({ address }) => address,
  );

/**
 * Checks whether a URL is safe for the server-side browser used for optional
 * email extraction. DNS is checked as well as literal IPs so local network and
 * cloud metadata endpoints cannot be fetched through an untrusted listing.
 */
export async function isSafeExternalNavigationUrl(
  value: string,
  resolver: HostResolver = resolveHost,
): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const hostname = url.hostname.toLowerCase().replace(/\.$/u, "");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    return false;
  }

  if (isIP(hostname)) return isPublicIpAddress(hostname);

  try {
    const addresses = await resolver(hostname);
    return (
      addresses.length > 0 && addresses.every((address) => isPublicIpAddress(address))
    );
  } catch {
    return false;
  }
}

export function isPublicIpAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    const octets = address.split(".").map(Number);
    const [first, second] = octets;
    if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) {
      return false;
    }
    return !(
      first === 0 ||
      first === 10 ||
      first === 127 ||
      first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 &&
        (second === 0 || second === 168 || second === 18 || second === 19)) ||
      (first === 198 && (second === 18 || second === 19 || second === 51)) ||
      (first === 203 && second === 0)
    );
  }

  if (family !== 6) return false;
  const normalized = address.toLowerCase();
  if (normalized === "::" || normalized === "::1") return false;
  if (normalized.startsWith("::ffff:")) {
    return isPublicIpAddress(normalized.slice("::ffff:".length));
  }
  return !(
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff")
  );
}
