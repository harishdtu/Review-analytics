import { useEffect, useRef } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default function Dashboard({ data, onReset }: { data: any; onReset: () => void }) {
  const chartRef  = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<Chart | null>(null);

  if (!data) return <div style={{ padding: 32, color: "#fff" }}>No data</div>;

  /* parse AI JSON */
  let parsed: any = null;
  try {
    const raw = typeof data.insights === "string" ? data.insights : JSON.stringify(data.insights);
    parsed = JSON.parse(raw);
  } catch { parsed = null; }

  const productName =
  data.productName ||
  data.name ||
  parsed?.productName ||
  "Your Product";
  const rating       = data.avgRating   || parsed?.rating      || 0;
  const reviewCount  = data.reviewsCount ?? 0;

  /* sentiment — prefer real data from scraper, fallback to AI */
  const sentiment = data.sentiment || {};
  const positive  = sentiment.positive ?? parsed?.sentimentScore?.positive ?? 70;
  const neutral   = sentiment.neutral  ?? parsed?.sentimentScore?.neutral  ?? 20;
  const negative  = sentiment.negative ?? parsed?.sentimentScore?.negative ?? 10;

  const buyReasons:   string[] = parsed?.buyReasons   ?? [];
  const complaints:   string[] = parsed?.complaints   ?? [];
  const improvements: string[] = parsed?.improvements ?? [];

  /* build brand list — YOU + mock competitors for comparison context */
  const youRow = {
    rank: 1, isYou: true,
    name: productName, rating, revenue: "—",
    positive, neutral, negative,
    pro: buyReasons[0]  || "—",
    con: complaints[0]  || "—",
  };

  /* chart */
  useEffect(() => {
    if (!chartRef.current) return;
    chartInst.current?.destroy();
    chartInst.current = new Chart(chartRef.current, {
      type: "doughnut",
      data: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [{
          data: [positive, neutral, negative],
          backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
          borderWidth: 0,
        }],
      },
      options: {
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        cutout: "70%",
      },
    });
    return () => chartInst.current?.destroy();
  }, [positive, neutral, negative]);

  const card = { background: "#161616", border: "1px solid #222", borderRadius: 16 } as const;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <button
    onClick={onReset}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "transparent",
      border: "none",
      color: "#aaa",
      cursor: "pointer",
      fontSize: 13,
      marginBottom: 16,
    }}
  >
    ← Back to Search
  </button>

        {/* PRODUCT HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{productName}</h2>
          <p style={{ color: "#555", fontSize: 13, marginTop: 4 }}>ASIN: {data.asin || "—"} · Single product analysis</p>
        </div>

        {/* METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Reviews Analyzed", value: reviewCount,        color: "#fff"    },
            { label: "Avg Rating",        value: `⭐ ${rating}`,   color: "#facc15" },
            { label: "Positive Sentiment",value: `${positive}%`,   color: "#22c55e" },
            { label: "Negative Sentiment",value: `${negative}%`,   color: "#ef4444" },
          ].map((m) => (
            <div key={m.label} style={{ ...card, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* SENTIMENT CHART + BARS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ ...card, padding: 24 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>SENTIMENT OVERVIEW</div>
            <canvas ref={chartRef} style={{ maxHeight: 200 }} />
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Positive", pct: positive, color: "#22c55e" },
                { label: "Neutral",  pct: neutral,  color: "#eab308" },
                { label: "Negative", pct: negative, color: "#ef4444" },
              ].map((b) => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 6, background: "#222", borderRadius: 3 }}>
                    <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#888", width: 36, textAlign: "right" }}>{b.pct}%</span>
                  <span style={{ fontSize: 12, color: "#555", width: 56 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KEY STATS */}
          <div style={{ ...card, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, fontWeight: 600 }}>PRODUCT SCORECARD</div>
            {[
              { label: "Product Name",   value: productName },
              { label: "ASIN",           value: data.asin || "—" },
              { label: "Reviews Scraped",value: reviewCount },
              { label: "Avg Rating",     value: `${rating} / 5.0` },
              { label: "+ve Sentiment",  value: `${positive}%` },
              { label: "Top Buy Reason", value: buyReasons[0] || "—" },
              { label: "Top Complaint",  value: complaints[0] || "—" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #1e1e1e", paddingBottom: 8 }}>
                <span style={{ color: "#666" }}>{row.label}</span>
                <span style={{ color: "#fff", fontWeight: 500, maxWidth: 200, textAlign: "right" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI INSIGHTS */}
        
        {(buyReasons.length > 0 || complaints.length > 0 || improvements.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <InsightBox title="🔥 Why Customers Buy" color="#22c55e" items={buyReasons} />
            <InsightBox title="❌ Complaints"         color="#ef4444" items={complaints} />
            <InsightBox title="🚀 Improvements"       color="#6c5ce7" items={improvements} />
          </div>
        )}
      </div>
    </div>
  );
}

function InsightBox({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 12 }}>{title}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 13, color: "#bbb", paddingBottom: 8, marginBottom: 8, lineHeight: 1.4, borderBottom: i < items.length - 1 ? "1px solid #1e1e1e" : "none" }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}