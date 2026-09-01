import { cn } from "@/lib/utils";
import type { Grade } from "@/lib/grading";

const TILE: Record<Grade, string> = {
  A: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-400/20",
  B: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-400/20",
  C: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-400/20",
  D: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-400/20",
};

const CAPTION: Record<Grade, string> = {
  A: "Strong and well-aligned",
  B: "Solid, with a few gaps",
  C: "Needs work",
  D: "Major gaps",
};

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "flex size-20 shrink-0 items-center justify-center rounded-2xl text-5xl font-bold ring-1",
          TILE[grade],
        )}
      >
        {grade}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Overall grade</p>
        <p className="text-lg font-semibold">{CAPTION[grade]}</p>
      </div>
    </div>
  );
}
