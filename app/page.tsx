"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface InterviewQuestion {
  question: string;
  tip: string;
}

interface AnalysisResult {
  matchScore: number;
  scoreLabel: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  resumeImprovements: string[];
  coverLetter: string;
  interviewQuestions: InterviewQuestion[];
  actionPlan: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  if (score >= 40) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Tag({ label, variant }: { label: string; variant: "blue" | "red" }) {
  const cls =
    variant === "blue"
      ? "bg-blue-50 text-blue-700 border border-blue-100"
      : "bg-red-50 text-red-600 border border-red-100";
  return (
    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "resume" | "cover" | "interview" | "plan"
  >("overview");
  const [copied, setCopied] = useState(false);

  // Read uploaded .txt / .pdf (text-based) file as plain text
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setResumeText(text);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and a job description.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
      setActiveTab("overview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.coverLetter) {
      navigator.clipboard.writeText(result.coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "resume", label: "Resume Tips" },
    { id: "cover", label: "Cover Letter" },
    { id: "interview", label: "Interview Prep" },
    { id: "plan", label: "Action Plan" },
  ] as const;

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            IF
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg">InternshipFit</span>
            <span className="font-bold text-blue-600 text-lg"> AI</span>
          </div>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            Beta
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* ── Hero ── */}
        {!result && (
          <div className="text-center space-y-2 pb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Get the internship you deserve.
            </h1>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              Paste your resume and a job description. Get a match score,
              targeted improvements, a cover letter, and interview prep — in
              seconds.
            </p>
          </div>
        )}

        {/* ── Input Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Resume
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium w-fit">
                <span className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors">
                  📄 Upload file (.txt, .pdf)
                </span>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="…or paste your resume text here"
                className="w-full border border-gray-200 rounded-xl p-3 h-40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Internship Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full internship job description here…"
              className="w-full border border-gray-200 rounded-xl p-3 h-40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-300"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors text-base"
          >
            {loading ? "Analyzing…" : "Analyze My Application →"}
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="text-center py-12 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm">
              Reviewing your resume against the role…
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="space-y-6">
            {/* Score Hero */}
            <div
              className={`rounded-2xl border-2 p-6 text-center ${scoreBg(result.matchScore)}`}
            >
              <div
                className="text-6xl font-black mb-1"
                style={{ color: scoreColor(result.matchScore) }}
              >
                {result.matchScore}
                <span className="text-3xl">%</span>
              </div>
              <div
                className="text-lg font-bold mb-3"
                style={{ color: scoreColor(result.matchScore) }}
              >
                {result.scoreLabel}
              </div>
              <p className="text-gray-600 text-sm max-w-lg mx-auto">
                {result.summary}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-1 bg-gray-100 p-1 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-fit text-xs font-semibold py-2 px-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <Section title="Strengths" icon="✅">
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">▸</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Weaknesses" icon="⚠️">
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Missing Keywords" icon="🔍">
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, i) => (
                      <Tag key={i} label={kw} variant="red" />
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* ── Tab: Resume Tips ── */}
            {activeTab === "resume" && (
              <Section title="Resume Improvements" icon="📝">
                <ol className="space-y-3">
                  {result.resumeImprovements.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="text-blue-500 font-bold flex-shrink-0">
                        {i + 1}.
                      </span>
                      {tip}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* ── Tab: Cover Letter ── */}
            {activeTab === "cover" && (
              <Section title="Tailored Cover Letter" icon="✉️">
                <div className="space-y-3">
                  <button
                    onClick={handleCopy}
                    className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {copied ? "✓ Copied!" : "Copy to clipboard"}
                  </button>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl border border-gray-100 p-5">
                    {result.coverLetter}
                  </div>
                </div>
              </Section>
            )}

            {/* ── Tab: Interview Prep ── */}
            {activeTab === "interview" && (
              <Section title="Likely Interview Questions" icon="🎤">
                <div className="space-y-4">
                  {result.interviewQuestions.map((iq, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-1">
                      <p className="text-sm font-semibold text-gray-800">
                        Q{i + 1}: {iq.question}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        💡 {iq.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Tab: Action Plan ── */}
            {activeTab === "plan" && (
              <Section title="Your Action Plan" icon="🚀">
                <ol className="space-y-4">
                  {result.actionPlan.map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Re-analyze */}
            <button
              onClick={() => {
                setResult(null);
                setError("");
              }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              ← Analyze a different application
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-gray-300 pt-4 pb-8">
          InternshipFit AI · Built for college students · Beta
        </footer>
      </div>
    </main>
  );
}
