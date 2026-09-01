import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import {
  AnalysisSchema,
  GOALS,
  type Analysis,
  type ProfileInput,
} from "@/lib/grading";

const MODEL = "claude-sonnet-5";

/** Thrown when the server has no API key configured, so the route can 500 cleanly. */
export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set");
    this.name = "MissingApiKeyError";
  }
}

let cached: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();
  cached ??= new Anthropic({ apiKey });
  return cached;
}

const SYSTEM_PROMPT = [
  "You are an expert LinkedIn profile reviewer and career coach.",
  "You evaluate a profile against the goal the person states, then return a grade and concrete, section-by-section advice.",
  "",
  "Grading scale:",
  "- A: strong and well-aligned with the goal; only minor polish left.",
  "- B: solid foundation with a few clear gaps.",
  "- C: noticeable weaknesses that are likely holding the person back.",
  "- D: major gaps; the profile needs substantial work to serve the goal.",
  "",
  "Rules:",
  "- Judge everything through the lens of the stated goal.",
  "- Base your review only on the text provided. If a section is missing or thin, treat that as a finding rather than inventing content.",
  "- 'strengths' are specific things already working well (not generic praise).",
  "- 'improvements' are concrete actions. Each has a 'section' label (e.g. Headline, About, Experience, Skills, Overall) and a 'suggestion' the person can act on immediately. Where useful, show a short rewritten example.",
  "- 'summary' is 2-3 sentences explaining the grade.",
  "- Keep the tone direct, professional, and encouraging.",
].join("\n");

function goalLabel(goal: ProfileInput["goal"]): string {
  return GOALS.find((g) => g.value === goal)?.label ?? goal;
}

function section(title: string, body: string): string {
  const trimmed = body.trim();
  return `## ${title}\n${trimmed.length > 0 ? trimmed : "(not provided)"}`;
}

function buildUserPrompt(input: ProfileInput): string {
  return [
    `The person's goal for this profile is: ${goalLabel(input.goal)}.`,
    "",
    "Here is their profile content:",
    "",
    section("Headline", input.headline),
    "",
    section("About / summary", input.about),
    "",
    section("Experience", input.experience),
    "",
    section("Skills", input.skills),
    "",
    "Analyze this profile against the goal and return the structured result.",
  ].join("\n");
}

export async function analyzeProfile(input: ProfileInput): Promise<Analysis> {
  const message = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
    output_config: { format: zodOutputFormat(AnalysisSchema) },
  });

  if (!message.parsed_output) {
    throw new Error("The AI response did not match the expected format.");
  }

  return message.parsed_output;
}
