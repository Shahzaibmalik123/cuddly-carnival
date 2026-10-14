import Anthropic from "@anthropic-ai/sdk";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { extractText } from "@/lib/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 4 * 1024 * 1024; // keep under Vercel's request body limit
const MAX_CHARS = 150_000;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set on the server." }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const question = String(form.get("question") || "Summarize this file.");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 4 MB)." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  try {
    text = await extractText(file.name, buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read the file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "No readable text found in the file." }, { status: 422 });
  }

  // Optional: keep a copy in Vercel Blob when a token is configured.
  let fileUrl: string | undefined;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`uploads/${file.name}`, buffer, { access: "public", addRandomSuffix: true });
      fileUrl = blob.url;
    } catch {
      // Storage is optional; ignore failures.
    }
  }

  const client = new Anthropic();
  const message = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 2048,
    system:
      "You are a file analysis assistant. Answer using only the provided file content. " +
      "If the answer is not in the file, say so. Reply in the same language as the user's question.",
    messages: [
      {
        role: "user",
        content: `File name: ${file.name}\n\n<file_content>\n${text.slice(0, MAX_CHARS)}\n</file_content>\n\nQuestion: ${question}`,
      },
    ],
  });

  const answer = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  return NextResponse.json({ answer, fileUrl });
}
