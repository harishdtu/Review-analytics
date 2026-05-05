const COLORS = [
  "#7c6fcd",
  "#9b8fe0",
  "#6254b8",
  "#4f43a0",
  "#e84a8a",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ec4899",
];

interface Competitor {
  asin?: string;
  name?: string;
  rank?: number;
  rating?: number;
  reviewCount?: number;
  price?: number;
  revenue?: string;
  sentiment?: {
    positive?: number;
    neutral?: number;
    negative?: number;
  };
}

interface CompetitorDashboardProps {
  data: {
    keyword?: string;
    competitors?: Competitor[];
    totalReviewsScraped?: number;
    insights?: string | Record<string, any>;
    marketRevenue?: string;
  } | null;
  onReset?: () => void;
}

export default function CompetitorDashboard({
  data,
  onReset,
}: CompetitorDashboardProps) {
  if (!data) {
    return <div style={{ padding: 32, color: "#fff" }}>No data available</div>;
  }

  /* Parse insights */
  let parsed: Record<string, any> | null = null;
  try {
    const raw =
      typeof data.insights === "string"
        ? data.insights
        : JSON.stringify(data.insights || {});
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to parse insights:", err);
    parsed = null;
  }

  const competitors = Array.isArray(data.competitors) ? data.competitors : [];
  const buyReasons = Array.isArray(parsed?.buyReasons) ? parsed.buyReasons : [];
  const complaints = Array.isArray(parsed?.complaints) ? parsed.complaints : [];
  const improvements = Array.isArray(parsed?.improvements)
    ? parsed.improvements
    : [];
  const totalReviews = data.totalReviewsScraped || 0;
  const marketRevenue = data.marketRevenue || "N/A";

  /* Calculate average market rating */
  const avgMarketRating = competitors.length
    ? (
        competitors
          .filter((c) => c.rating && c.rating > 0)
          .reduce((s, c) => s + (c.rating || 0), 0) /
          (competitors.filter((c) => c.rating && c.rating > 0).length || 1)
      ).toFixed(1)
    : "—";

  const card = {
    background: "#161616",
    border: "1px solid #222",
    borderRadius: 16,
  } as const;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
              🔍 Market:{" "}
              <span style={{ color: "#a29bfe" }}>"{data.keyword || "Unknown"}"</span>
            </h2>
            <p style={{ color: "#555", fontSize: 13, marginTop: 6 }}>
              {competitors.length} competitors scraped · {totalReviews} real
              reviews analyzed · Revenue estimated from BSR
            </p>
          </div>
          {onReset && (
            <button
              onClick={onReset}
              style={{
                padding: "10px 16px",
                background: "#444",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#444")}
            >
              ← Back
            </button>
          )}
        </div>

        {/* Top Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Est. Market Revenue",
              value: marketRevenue,
              color: "#a29bfe",
            },
            { label: "Competitors Found", value: competitors.length, color: "#fff" },
            { label: "Reviews Scraped", value: totalReviews, color: "#22c55e" },
            {
              label: "Avg Market Rating",
              value: `⭐ ${avgMarketRating}`,
              color: "#facc15",
            },
          ].map((m) => (
            <div key={m.label} style={{ ...card, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: m.color }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Competitor Rankings Table */}
        {competitors.length > 0 ? (
          <div style={{ ...card, overflow: "hidden", marginBottom: 24 }}>
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #222",
                fontSize: 11,
                color: "#555",
                letterSpacing: 1,
                fontWeight: 600,
              }}
            >
              COMPETITOR RANKINGS (REAL DATA)
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
                  {["#", "PRODUCT", "ASIN", "RATING", "REVIEWS", "PRICE", "EST. REVENUE"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          color: "#555",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {competitors.map((c, i) => (
                  <tr
                    key={c.asin || i}
                    style={{
                      borderBottom:
                        i < competitors.length - 1 ? "1px solid #1a1a1a" : "none",
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: COLORS[i % COLORS.length] || "#444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {c.rank || i + 1}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", maxWidth: 220 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#fff",
                          lineHeight: 1.3,
                          fontSize: 12,
                        }}
                      >
                        {c.name || "Unknown"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>
                        {c.asin || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#facc15" }}>
                      {c.rating ? (
                        `★ ${c.rating}`
                      ) : (
                        <span style={{ color: "#444" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#aaa" }}>
                      {c.reviewCount || c.reviewCount === 0 ? (
                        c.reviewCount
                      ) : (
                        <span style={{ color: "#444" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#aaa" }}>
                      {c.price ? (
                        `₹${c.price}`
                      ) : (
                        <span style={{ color: "#444" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {c.revenue ? (
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>
                          {c.revenue}
                        </span>
                      ) : (
                        <span style={{ color: "#444", fontSize: 11 }}>
                          BSR needed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              ...card,
              padding: 24,
              textAlign: "center",
              color: "#666",
              marginBottom: 24,
            }}
          >
            No competitors found
          </div>
        )}

        {/* Sentiment Per Competitor */}
        {competitors.length > 0 && (
          <div style={{ ...card, padding: 24, marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                color: "#555",
                letterSpacing: 1,
                marginBottom: 20,
                fontWeight: 600,
              }}
            >
              REAL SENTIMENT (FROM SCRAPED REVIEW RATINGS)
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(
                  competitors.length,
                  5
                )}, 1fr)`,
                gap: 12,
              }}
            >
              {competitors.slice(0, 5).map((c, i) => {
                const s = c.sentiment || {
                  positive: 0,
                  neutral: 0,
                  negative: 0,
                };
                return (
                  <div
                    key={c.asin || i}
                    style={{
                      background: "#111",
                      border: "1px solid #1e1e1e",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 11,
                        marginBottom: 10,
                        color: COLORS[i % COLORS.length],
                        lineHeight: 1.3,
                      }}
                    >
                      {c.name?.split(" ").slice(0, 4).join(" ") || `Competitor ${i + 1}`}
                    </div>
                    {[
                      { pct: s.positive || 0, color: "#22c55e", label: "Pos" },
                      { pct: s.neutral || 0, color: "#eab308", label: "Neu" },
                      { pct: s.negative || 0, color: "#ef4444", label: "Neg" },
                    ].map((bar) => (
                      <div
                        key={bar.label}
                        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: bar.color,
                            flexShrink: 0,
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            background: "#222",
                            borderRadius: 2,
                          }}
                        >
                          <div
                            style={{
                              width: `${bar.pct}%`,
                              height: "100%",
                              background: bar.color,
                              borderRadius: 2,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#555",
                            width: 28,
                            textAlign: "right",
                          }}
                        >
                          {bar.pct}%
                        </span>
                      </div>
                    ))}
                    <div
                      style={{ marginTop: 8, fontSize: 10, color: "#555" }}
                    >
                      ★ {c.rating || "—"} · {c.reviewCount || 0} reviews
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {(buyReasons.length > 0 ||
          complaints.length > 0 ||
          improvements.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <InsightBox
              title="🔥 Key Purchase Criteria"
              color="#22c55e"
              items={buyReasons}
            />
            <InsightBox
              title="❌ Market Complaints"
              color="#ef4444"
              items={complaints}
            />
            <InsightBox
              title="🚀 Market Opportunities"
              color="#6c5ce7"
              items={improvements}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface InsightBoxProps {
  title: string;
  color: string;
  items: string[];
}

function InsightBox({ title, color, items }: InsightBoxProps) {
  return (
    <div
      style={{
        background: "#161616",
        border: "1px solid #222",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 12 }}>
        {title}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.length > 0 ? (
          items.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: 13,
                color: "#bbb",
                paddingBottom: 8,
                marginBottom: 8,
                lineHeight: 1.4,
                borderBottom:
                  i < items.length - 1 ? "1px solid #1e1e1e" : "none",
              }}
            >
              {item}
            </li>
          ))
        ) : (
          <li style={{ fontSize: 13, color: "#666", fontStyle: "italic" }}>
            No data available
          </li>
        )}
      </ul>
    </div>
  );
}