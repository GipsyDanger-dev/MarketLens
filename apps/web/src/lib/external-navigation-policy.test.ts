import { describe, expect, it } from "vitest";

import {
  isPublicIpAddress,
  isSafeExternalNavigationUrl,
} from "./external-navigation-policy";

describe("external navigation policy", () => {
  it("accepts HTTP(S) hosts that resolve only to public addresses", async () => {
    await expect(
      isSafeExternalNavigationUrl("https://example.com/contact", async () => [
        "93.184.216.34",
        "2606:2800:220:1:248:1893:25c8:1946",
      ]),
    ).resolves.toBe(true);
  });

  it("blocks unsafe protocols, local hosts, and private DNS results", async () => {
    const privateResolver = async () => ["10.0.0.5"];
    await expect(
      isSafeExternalNavigationUrl("javascript:alert(1)", privateResolver),
    ).resolves.toBe(false);
    await expect(
      isSafeExternalNavigationUrl("http://localhost", privateResolver),
    ).resolves.toBe(false);
    await expect(
      isSafeExternalNavigationUrl("https://example.com", privateResolver),
    ).resolves.toBe(false);
  });

  it("recognizes non-public IPv4 and IPv6 ranges", () => {
    expect(isPublicIpAddress("8.8.8.8")).toBe(true);
    expect(isPublicIpAddress("127.0.0.1")).toBe(false);
    expect(isPublicIpAddress("169.254.169.254")).toBe(false);
    expect(isPublicIpAddress("::1")).toBe(false);
    expect(isPublicIpAddress("fc00::1")).toBe(false);
  });
});
