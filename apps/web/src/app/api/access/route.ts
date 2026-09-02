import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isAccessControlEnabled,
  isValidAccessToken,
  MARKETLENS_ACCESS_COOKIE,
  marketLensAccessCookieOptions,
} from "@/lib/access-control";

const accessRequestSchema = z.object({
  token: z.string().trim().min(1).max(512),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAccessControlEnabled()) {
    return NextResponse.json({ error: "Access control is disabled." }, { status: 404 });
  }

  const input = accessRequestSchema.safeParse(await request.json());
  if (!input.success) {
    return NextResponse.json({ error: "A valid access token is required." }, { status: 400 });
  }
  if (!isValidAccessToken(input.data.token)) {
    return NextResponse.json({ error: "Invalid access token." }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set({
    ...marketLensAccessCookieOptions,
    name: MARKETLENS_ACCESS_COOKIE,
    value: input.data.token,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({
    ...marketLensAccessCookieOptions,
    maxAge: 0,
    name: MARKETLENS_ACCESS_COOKIE,
    value: "",
  });
  return response;
}
