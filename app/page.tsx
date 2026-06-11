"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

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
  if (score >= 80) return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
  if (score >= 60) return "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800";
  if (score >= 40) return "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800";
  return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
}

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
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400 mb-4">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Tag({ label, variant }: { label: string; variant: "blue" | "red" }) {
  const cls =
    variant === "blue"
      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
      : "bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-800";
  return (
    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

// ── Email Capture ─────────────────────────────────────────────────────────────

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">🎉</div>
        <p className="text-green-700 dark:text-green-300 font-semibold text-sm">You're on the list!</p>
        <p className="text-green-600 dark:text-green-400 text-xs mt-1">We'll notify you when new features launch.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">Stay in the loop 📬</h3>
      <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">
        Get notified when we launch AI internship search, application tracking, and more.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="your@email.com"
          className="flex-1 border border-blue-200 dark:border-blue-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          {status === "loading" ? "..." : "Notify me"}
        </button>
      </div>
      {errorMsg && <p className="text-red-500 text-xs mt-2">{errorMsg}</p>}
    </div>
  );
}

// ── Dark Mode Toggle ──────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-xl"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "resume" | "cover" | "interview" | "plan"
  >("overview");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const [analysisCount, setAnalysisCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/counter")
      .then((r) => r.json())
      .then((d) => setAnalysisCount(d.count))
      .catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    setFileName(file.name);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to read file."); setFileName(""); }
      else setResumeText(data.text);
    } catch {
      setError("Failed to read file. Try pasting your resume text instead.");
      setFileName("");
    } finally {
      setFileLoading(false);
    }
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

      // Increment counter
      fetch("/api/counter", { method: "POST" })
        .then((r) => r.json())
        .then((d) => setAnalysisCount(d.count))
        .catch(() => {});

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
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            IF
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">InternshipFit</span>
            <span className="font-bold text-blue-600 text-lg"> AI</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 dark:text-slate-400 px-2 py-1 rounded-full">
              Beta
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {!result && (
          <div className="text-center space-y-3 pb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Get the internship you deserve.
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-base max-w-md mx-auto">
              Paste your resume and a job description. Get a match score,
              targeted improvements, a cover letter, and interview prep — in seconds.
            </p>
            {analysisCount !== null && analysisCount > 0 && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                🎓 {analysisCount.toLocaleString()} resume{analysisCount === 1 ? "" : "s"} analyzed so far
              </p>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Your Resume
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium w-fit">
                <span className="bg-blue-50 dark:bg-blue-900 border border-blue-100 dark:border-blue-800 rounded-lg px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                  {fileLoading ? "Reading file..." : fileName ? `✓ ${fileName}` : "📄 Upload PDF, DOCX, or TXT"}
                </span>
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={fileLoading}
                />
              </label>
              {!fileName && (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="…or paste your resume text here"
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-xl p-3 h-40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-slate-200 placeholder-gray-300 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
                />
              )}
              {fileName && resumeText && (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-800 rounded-xl px-4 py-3">
                  <span className="text-sm text-green-700 dark:text-green-300">
                    ✓ Resume loaded — {resumeText.split(" ").length} words extracted
                  </span>
                  <button
                    onClick={() => { setFileName(""); setResumeText(""); }}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Internship Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full internship job description here…"
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl p-3 h-40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-slate-200 placeholder-gray-300 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || fileLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors text-base"
          >
            {loading ? "Analyzing…" : "Analyze My Application →"}
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              Reviewing your resume against the role…
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className={`rounded-2xl border-2 p-6 text-center ${scoreBg(result.matchScore)}`}>
              <div className="text-6xl font-black mb-1" style={{ color: scoreColor(result.matchScore) }}>
                {result.matchScore}<span className="text-3xl">%</span>
              </div>
              <div className="text-lg font-bold mb-3" style={{ color: scoreColor(result.matchScore) }}>
                {result.scoreLabel}
              </div>
              <p className="text-gray-600 dark:text-slate-300 text-sm max-w-lg mx-auto">
                {result.summary}
              </p>
            </div>

            <EmailCapture />

            <div className="flex overflow-x-auto gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-fit text-xs font-semibold py-2 px-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-4">
                <Section title="Strengths" icon="✅">
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-slate-300">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">▸</span>{s}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section title="Weaknesses" icon="⚠️">
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-slate-300">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span>{w}
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

            {activeTab === "resume" && (
              <Section title="Resume Improvements" icon="📝">
                <ol className="space-y-3">
                  {result.resumeImprovements.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-slate-300">
                      <span className="text-blue-500 font-bold flex-shrink-0">{i + 1}.</span>{tip}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {activeTab === "cover" && (
              <Section title="Tailored Cover Letter" icon="✉️">
                <div className="space-y-3">
                  <button
                    onClick={handleCopy}
                    className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900 border border-blue-100 dark:border-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                  >
                    {copied ? "✓ Copied!" : "Copy to clipboard"}
                  </button>
                  <div className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600 p-5">
                    {result.coverLetter}
                  </div>
                </div>
              </Section>
            )}

            {activeTab === "interview" && (
              <Section title="Likely Interview Questions" icon="🎤">
                <div className="space-y-4">
                  {result.interviewQuestions.map((iq, i) => (
                    <div key={i} className="border border-gray-100 dark:border-slate-600 rounded-xl p-4 space-y-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">Q{i + 1}: {iq.question}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">💡 {iq.tip}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {activeTab === "plan" && (
              <Section title="Your Action Plan" icon="🚀">
                <ol className="space-y-4">
                  {result.actionPlan.map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            <button
              onClick={() => { setResult(null); setError(""); }}
              className="w-full text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 py-2 transition-colors"
            >
              ← Analyze a different application
            </button>
          </div>
        )}

        <footer className="text-center text-xs text-gray-300 dark:text-slate-600 pt-4 pb-8">
          InternshipFit AI · Built for college students · Beta
        </footer>
      </div>
    </main>
  );
}
