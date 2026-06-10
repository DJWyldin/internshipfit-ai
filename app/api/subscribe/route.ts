import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "InternshipFit AI <onboarding@resend.dev>",
      to: "dylanroys99@gmail.com",
      subject: "New InternshipFit AI Signup!",
      html: `<p>New user signed up: <strong>${email}</strong></p>`,
    });

    await resend.emails.send({
      from: "InternshipFit AI <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to InternshipFit AI!",
      html: `
        <h2>You're on the list! 🎉</h2>
        <p>Thanks for signing up for InternshipFit AI.</p>
        <p>We'll notify you when new features launch — including AI internship search, application tracking, and more.</p>
        <p>In the meantime, keep using the tool at <a href="https://internshipfit-ai.vercel.app">internshipfit-ai.vercel.app</a></p>
        <br/>
        <p>— Dylan, Founder of InternshipFit AI</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}