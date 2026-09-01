"use client";

import { useState, type ChangeEvent } from "react";

import { cn } from "@/lib/utils";
import { GOALS, type ProfileInput } from "@/lib/grading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: ProfileInput;
  onChange: (next: ProfileInput) => void;
  onSubmit: () => void;
  loading: boolean;
};

type PdfStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

export function ProfileForm({ value, onChange, onSubmit, loading }: Props) {
  const [pdf, setPdf] = useState<PdfStatus>({ kind: "idle" });

  function set<K extends keyof ProfileInput>(key: K, next: ProfileInput[K]) {
    onChange({ ...value, [key]: next });
  }

  const canSubmit =
    Boolean(value.headline.trim() && value.about.trim()) && !loading;

  async function handlePdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPdf({ kind: "loading" });
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/parse-pdf", { method: "POST", body });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Couldn't read that PDF.";
        throw new Error(message);
      }

      const fields = (data as { fields?: Partial<ProfileInput> }).fields ?? {};
      onChange({
        ...value,
        headline: fields.headline?.trim() || value.headline,
        about: fields.about?.trim() || value.about,
        experience: fields.experience?.trim() || value.experience,
        skills: fields.skills?.trim() || value.skills,
      });
      setPdf({
        kind: "done",
        message: "Filled from your PDF — review and edit the fields below.",
      });
    } catch (error) {
      setPdf({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Couldn't read that PDF.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your LinkedIn profile</CardTitle>
        <CardDescription>
          Paste each section, or start from your LinkedIn PDF export. Headline
          and About are required; the more you add, the sharper the feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="pdf">Start from your LinkedIn PDF (optional)</Label>
            <Input
              id="pdf"
              type="file"
              accept="application/pdf"
              onChange={handlePdf}
              disabled={loading || pdf.kind === "loading"}
            />
            <p
              className={cn(
                "text-xs",
                pdf.kind === "error"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {pdf.kind === "loading"
                ? "Reading your PDF…"
                : pdf.kind === "idle"
                  ? "On LinkedIn: More → Save to PDF. The file is parsed in memory, not stored."
                  : pdf.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">What is this profile for?</Label>
            <Select
              value={value.goal}
              onValueChange={(next) =>
                set("goal", next as ProfileInput["goal"])
              }
              items={GOALS as unknown as { value: string; label: string }[]}
            >
              <SelectTrigger id="goal" className="w-full">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              placeholder="e.g. Senior Product Designer building tools for developers"
              value={value.headline}
              onChange={(event) => set("headline", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">About / summary</Label>
            <Textarea
              id="about"
              rows={6}
              placeholder="Paste your About section here."
              value={value.about}
              onChange={(event) => set("about", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              rows={8}
              placeholder="Paste your roles and the bullet points under each one."
              value={value.experience}
              onChange={(event) => set("experience", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              rows={3}
              placeholder="Comma-separated, or one per line."
              value={value.skills}
              onChange={(event) => set("skills", event.target.value)}
            />
          </div>

          <Button type="submit" size="lg" disabled={!canSubmit}>
            {loading ? "Analyzing…" : "Analyze my profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
