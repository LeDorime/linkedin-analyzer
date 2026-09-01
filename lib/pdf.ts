import "server-only";

/**
 * pdf.js (bundled by `unpdf`) calls `Promise.withResolvers()`, a standard
 * ES2024 API that is missing on Node < 22. Vercel runs Node 22+, but local
 * dev may be on Node 20 — install a tiny shim before `unpdf` loads.
 */
function ensurePromiseWithResolvers(): void {
  const P = Promise as unknown as { withResolvers?: unknown };
  if (typeof P.withResolvers === "function") return;
  P.withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export type PrefillFields = {
  headline: string;
  about: string;
  experience: string;
  skills: string;
};

export type ParsedPdf = {
  /** The full extracted text, so the user can copy anything the split missed. */
  text: string;
  fields: PrefillFields;
};

/** Section titles LinkedIn uses as headings in its "Save to PDF" export. */
const SECTION_HEADERS = [
  "Contact",
  "Top Skills",
  "Skills",
  "Languages",
  "Certifications",
  "Licenses & Certifications",
  "Honors-Awards",
  "Honors & Awards",
  "Summary",
  "Experience",
  "Education",
  "Projects",
  "Publications",
  "Volunteer Experience",
  "Recommendations",
  "Interests",
];

function isHeader(line: string): boolean {
  const value = line.trim().toLowerCase();
  return SECTION_HEADERS.some((h) => h.toLowerCase() === value);
}

/** Text between the `start` heading and the next section heading. */
function sliceSection(lines: string[], start: string): string {
  const startIdx = lines.findIndex(
    (line) => line.trim().toLowerCase() === start.toLowerCase(),
  );
  if (startIdx === -1) return "";

  const out: string[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (isHeader(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join("\n").trim();
}

/**
 * LinkedIn's PDF opens with the person's name, then their headline, then
 * location / "Contact". Take the second non-empty line before the first
 * recognised section heading as a best-guess headline.
 */
function guessHeadline(lines: string[]): string {
  const firstHeaderIdx = lines.findIndex(isHeader);
  const head = (firstHeaderIdx === -1 ? lines : lines.slice(0, firstHeaderIdx))
    .map((line) => line.trim())
    .filter(Boolean);
  return head[1] ?? "";
}

export async function parseLinkedInPdf(data: ArrayBuffer): Promise<ParsedPdf> {
  ensurePromiseWithResolvers();
  const { extractText, getDocumentProxy } = await import("unpdf");

  const pdf = await getDocumentProxy(new Uint8Array(data));
  const { text } = await extractText(pdf, { mergePages: true });
  const full = (Array.isArray(text) ? text.join("\n") : text).trim();
  const lines = full.split(/\r?\n/);

  return {
    text: full,
    fields: {
      headline: guessHeadline(lines),
      about: sliceSection(lines, "Summary"),
      experience: sliceSection(lines, "Experience"),
      skills: sliceSection(lines, "Top Skills") || sliceSection(lines, "Skills"),
    },
  };
}
