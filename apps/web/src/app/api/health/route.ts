import { NextResponse } from "next/server";

import { createServiceHealth } from "@/lib/health";

export function GET() {
  return NextResponse.json(createServiceHealth());
}
