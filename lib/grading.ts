import { z } from "zod";

/**
 * Shared shapes for the profile → analysis flow. Both the API route and the UI
 * import from here so the request contract and the result contract never drift.
 */

export const GOALS = [
  { value: "job-search", label: "Job search" },
  { value: "personal-brand", label: "Building a personal brand" },
  { value: "sales-networking", label: "Sales / networking" },
  { value: "recruiting", label: "Recruiting / hiring" },
] as const;

export type GoalValue = (typeof GOALS)[number]["value"];

const GOAL_VALUES = GOALS.map((g) => g.value) as [GoalValue, ...GoalValue[]];

/** What the client sends to POST /api/analyze. */
export const ProfileInputSchema = z.object({
  goal: z.enum(GOAL_VALUES),
  headline: z.string().trim().min(1, "Add your headline before analyzing.").max(400),
  about: z
    .string()
    .trim()
    .min(1, "Add your About / summary before analyzing.")
    .max(8000),
  experience: z.string().trim().max(15000).default(""),
  skills: z.string().trim().max(4000).default(""),
});

export type ProfileInput = z.infer<typeof ProfileInputSchema>;

/** What Claude must return, and what the results UI renders. */
export const AnalysisSchema = z.object({
  grade: z.enum(["A", "B", "C", "D"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(
    z.object({
      section: z.string(),
      suggestion: z.string(),
    }),
  ),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type Grade = Analysis["grade"];
export type Improvement = Analysis["improvements"][number];

export const GRADES = ["A", "B", "C", "D"] as const satisfies readonly Grade[];
