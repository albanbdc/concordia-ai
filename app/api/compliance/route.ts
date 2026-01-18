// app/api/compliance/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // 🔁 temporaire : on redirige /api/compliance vers /api/compliance/overview
  return NextResponse.redirect(new URL("/api/compliance/overview", "http://localhost:3000"), 307);
}
