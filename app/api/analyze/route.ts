import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();
 
    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume text and job description are required." },
        { status: 400 }
      );
    }
 
    const prompt = `
You are an expert career coach and technical recruiter specializing in internship placements.
 
Analyze the following resume against the internship job description.
 
RESUME:
${resumeText}
 
JOB DESCRIPTION:
${jobDescription}
 
Return ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "matchScore": <number 0-100>,
  "scoreLabel": "<Poor Match | Fair Match | Good Match | Strong Match | Excellent Match>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "resumeImprovements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "coverLetter": "<a complete, tailored cover letter for this specific role, 3-4 paragraphs>",
  "interviewQuestions": [
    { "question": "<likely interview question>", "tip": "<how to answer it>" },
    { "question": "<likely interview question>", "tip": "<how to answer it>" },
    { "question": "<likely interview question>", "tip": "<how to answer it>" },
    { "question": "<likely interview question>", "tip": "<how to answer it>" },
    { "question": "<likely interview question>", "tip": "<how to answer it>" }
  ],
  "actionPlan": ["<action step 1>", "<action step 2>", "<action step 3>", "<action step 4>"]
}
`;
 
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });
 
    const raw = completion.choices[0].message.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);
 
    return NextResponse.json(result);
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}