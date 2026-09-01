"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ProfileForm } from "@/components/ProfileForm";
import { GradeBadge } from "@/components/GradeBadge";
import { FeedbackSection } from "@/components/FeedbackSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Analysis, ProfileInput } from "@/lib/grading";

const EMPTY_FORM: ProfileInput = {
  goal: "job-search",
  headline: "",
  about: "",
  experience: "",
  skills: "",
};

export default function Home() {
  const [form, setForm] = useState<ProfileInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Analysis failed. Please try again.";
        throw new Error(message);
      }
      setResult(data as Analysis);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Analysis failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          LinkedIn Profile Analyzer
        </h1>
        <p className="text-muted-foreground">
          Paste your profile, choose what you want it to do for you, and get an
          honest grade with section-by-section fixes.
        </p>
      </header>

      <ProfileForm
        value={form}
        onChange={setForm}
        onSubmit={handleAnalyze}
        loading={loading}
      />

      <section className="mt-8">
        {loading ? (
          <ResultsSkeleton />
        ) : result ? (
          <Results analysis={result} />
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}

function Results({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <GradeBadge grade={analysis.grade} />
          <p className="text-sm leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      <FeedbackSection
        title="What's working"
        description="Strengths already in your profile."
        items={analysis.strengths}
        emptyText="No clear strengths stood out yet."
      />

      <FeedbackSection
        title="What to improve"
        description="Concrete changes, section by section."
        items={analysis.improvements.map((improvement) => (
          <span key={`${improvement.section}-${improvement.suggestion}`}>
            <span className="font-semibold">{improvement.section}:</span>{" "}
            {improvement.suggestion}
          </span>
        ))}
        emptyText="No improvements suggested."
      />
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        Your grade and suggestions will appear here after you analyze a profile.
      </CardContent>
    </Card>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 py-6">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    </div>
  );
}
