import "server-only";

import { timingSafeEqual } from "node:crypto";

import { parseServerEnvironment } from "./environment";

export const MARKETLENS_ACCESS_COOKIE = "marketlens_access";

export const marketLensAccessCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

export function isAccessControlEnabled(
  environment: Record<string, string | undefined> = process.env,
): boolean {
  return parseServerEnvironment(environment).ENABLE_AUTH;
}

export function isValidAccessToken(
  token: string | null | undefined,
  environment: Record<string, string | undefined> = process.env,
): boolean {
  const configuration = parseServerEnvironment(environment);
  if (!configuration.ENABLE_AUTH) return true;

  const expected = configuration.MARKETLENS_ACCESS_TOKEN;
  if (!token || !expected) return false;

  const actualBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function requestHasAccess(
  request: Request,
  environment: Record<string, string | undefined> = process.env,
): boolean {
  return isValidAccessToken(
    getRequestCookie(request, MARKETLENS_ACCESS_COOKIE),
    environment,
  );
}

function getRequestCookie(request: Request, name: string): string | undefined {
  const cookies = request.headers.get("cookie");
  if (!cookies) return undefined;

  const value = cookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);

  try {
    return value ? decodeURIComponent(value) : undefined;
  } catch {
    return undefined;
  }
}
