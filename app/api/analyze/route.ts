import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { ProfileInputSchema } from "@/lib/grading";
import { analyzeProfile, MissingApiKeyError } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = ProfileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid profile input." },
      { status: 400 },
    );
  }

  try {
    const analysis = await analyzeProfile(parsed.data);
    return NextResponse.json(analysis);
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json(
        { error: "The server is not configured with an Anthropic API key." },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "The server's Anthropic API key is missing or invalid." },
        { status: 502 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The AI service is rate limited right now. Try again in a minute." },
        { status: 502 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `The AI service returned an error (${error.status ?? "unknown"}).` },
        { status: 502 },
      );
    }

    console.error("[/api/analyze] unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong while analyzing the profile." },
      { status: 500 },
    );
  }
}
