import { NextResponse } from "next/server";

import { parseLinkedInPdf } from "@/lib/pdf";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected a file upload." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  const looksLikePdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!looksLikePdf) {
    return NextResponse.json(
      { error: "Upload a PDF (LinkedIn: More → Save to PDF)." },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That PDF is larger than 10 MB." },
      { status: 400 },
    );
  }

  try {
    const result = await parseLinkedInPdf(await file.arrayBuffer());
    if (!result.text.trim()) {
      return NextResponse.json(
        {
          error:
            "Couldn't read any text from that PDF — it may be scanned images. Paste your profile instead.",
        },
        { status: 422 },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/parse-pdf] unexpected error:", error);
    return NextResponse.json(
      { error: "Couldn't parse that PDF. Try pasting your profile instead." },
      { status: 500 },
    );
  }
}
