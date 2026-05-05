import { useState } from "react";
import Navbar from "./components/Navbar";
import Loading from "./components/Loading";
import Dashboard from "./components/Dashboard";
import CompetitorDashboard from "./components/CompetitorDashboard";

const VIEW_TYPES = {
  INPUT: "input",
  LOADING: "loading",
  DASHBOARD: "dashboard",
  COMPETITOR: "competitor"
};

export default function App() {
  const [view, setView] = useState(VIEW_TYPES.INPUT);
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState(null);
  const [compData, setCompData] = useState(null);
  const [mode, setMode] = useState("url");
  const [loadingMsg, setLoadingMsg] = useState("Analyzing...");
  const [error, setError] = useState(null);

  // ── Single product URL analyze ──
  // handleAnalyze — URL mode, use /analyze endpoint not /analyze-category
async function handleAnalyze() {
  if (!url.trim()) return;
  try {
    setError(null);
    setLoadingMsg("Scraping reviews from Amazon...");
    setView(VIEW_TYPES.LOADING);
    const res = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }), // ✅ just send url, nothing else
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setResult(data);
    setView(VIEW_TYPES.DASHBOARD);
  } catch (err: any) {
    console.error("API ERROR:", err);
    setError(err.message || "Something went wrong. Please try again.");
    setView(VIEW_TYPES.INPUT);
  }
}
  // ── Keyword → discover 9 competitors ──
  async function handleDiscover() {
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    try {
      setError(null);
      setLoadingMsg("Discovering competitors & scraping reviews... (this takes ~2 min)");
      setView(VIEW_TYPES.LOADING);

      const res = await fetch("http://localhost:5000/analyze-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to discover competitors");
      }

      setCompData(data);
      setView(VIEW_TYPES.COMPETITOR);
    } catch (err) {
      console.error("DISCOVER ERROR:", err);
      setError(err.message || "An error occurred. Please try again.");
      setView(VIEW_TYPES.INPUT);
    }
  }

  const handleReset = () => {
    setView(VIEW_TYPES.INPUT);
    setUrl("");
    setKeyword("");
    setResult(null);
    setCompData(null);
    setError(null);
    setMode("url");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onReset={handleReset} />

      {view === VIEW_TYPES.INPUT && (
        <div className="max-w-3xl mx-auto mt-24 px-6">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            Amazon Competitive<br />
            <span className="text-indigo-400">Intelligence</span>
          </h1>
          <p className="text-zinc-400 mb-10 text-lg">
            Paste a product URL for single analysis, or enter a keyword to
            discover &amp; analyze 9 top competitors automatically.
          </p>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode("url");
                setError(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === "url"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Single Product URL
            </button>
            <button
              onClick={() => {
                setMode("keyword");
                setError(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === "keyword"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              🔍 Keyword → 9 Competitors
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {mode === "url" ? (
            <>
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center gap-3 px-4 py-3">
                <input
                  className="flex-1 bg-transparent outline-none text-base text-zinc-200 placeholder:text-zinc-600"
                  placeholder="https://www.amazon.in/dp/..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!url.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl font-medium text-sm transition-colors"
                >
                  Analyze →
                </button>
              </div>
              <p className="text-zinc-600 text-xs mt-3">Works with any Amazon product URL · Results in ~30 seconds</p>
            </>
          ) : (
            <>
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center gap-3 px-4 py-3">
                <input
                  className="flex-1 bg-transparent outline-none text-base text-zinc-200 placeholder:text-zinc-600"
                  placeholder='e.g. "fish oil capsules" or "curtain rods"'
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
                />
                <button
                  onClick={handleDiscover}
                  disabled={!keyword.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl font-medium text-sm transition-colors"
                >
                  Discover →
                </button>
              </div>
              <p className="text-zinc-600 text-xs mt-3">
                Finds top 9 Amazon listings · Scrapes reviews · AI analysis for each · ~2 minutes
              </p>
            </>
          )}
        </div>
      )}

      {view === VIEW_TYPES.LOADING && (
        <div className="flex flex-col items-center justify-center mt-40 gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">{loadingMsg}</p>
        </div>
      )}

      {view === VIEW_TYPES.DASHBOARD && <Dashboard data={result} onReset={handleReset} />}
      {view === VIEW_TYPES.COMPETITOR && <CompetitorDashboard data={compData} onReset={handleReset} />}
    </div>
  );
}