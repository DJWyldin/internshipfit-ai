import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".txt")) {
      text = await file.text();
    } else if (fileName.endsWith(".pdf")) {
      const { extractText } = await import("unpdf");
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const { text: extracted } = await extractText(uint8, { mergePages: true });
      text = extracted;
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from this file. Try copying and pasting your resume instead." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    console.error("Parse resume error:", err);
    return NextResponse.json(
      { error: "Failed to read file. Try copying and pasting your resume instead." },
      { status: 500 }
    );
  }
}