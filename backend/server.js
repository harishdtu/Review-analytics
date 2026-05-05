import express from "express";
import cors from "cors";
import { getReviews, searchCompetitors, estimateRevenue } from "./scrape.js"; 
import { analyzeWithGroq } from "./ai.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ─────────────────────────────────────────
   POST /analyze — single product URL
   ───────────────────────────────────────── */
app.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const { reviews, avgRating, reviewCount, productName, asin, sentiment } = await getReviews(url);

    if (!reviews.length) return res.status(400).json({ error: "No reviews found for this product" });

    const insights = await analyzeWithGroq(reviews);

    res.json({
      success: true,
      mode: "single",
      reviewsCount: reviewCount,
      avgRating,
      productName,
      asin,
      sentiment,
      insights,
    });
  } catch (err) {
    console.error("❌ /analyze:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});
/* ─────────────────────────────────────────
   POST /analyze-category — keyword mode
   ───────────────────────────────────────── */
app.post("/analyze-category", async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword) return res.status(400).json({ error: "keyword required" });

    console.log("\n🚀 CATEGORY ANALYSIS:", keyword);

    // Step 1: find competitors via epctex search scraper
    const competitors = await searchCompetitors(keyword);
    if (!competitors.length) return res.status(400).json({ error: "No competitors found" });

    // Step 2: scrape reviews for each (max 5 on free tier)
    const limit = Math.min(competitors.length, 5);
    const results = [];

    for (let i = 0; i < limit; i++) {
      const comp = competitors[i];
      try {
        // ✅ FIX: construct full URL from ASIN instead of calling scrapeReviews(asin)
        const productUrl = `https://www.amazon.in/dp/${comp.asin}`;
        const { reviews, avgRating, reviewCount, sentiment } = await getReviews(productUrl);

        results.push({
          rank: i + 1,
          asin: comp.asin,
          name: comp.name.slice(0, 35),
          price: comp.price,
          rating: avgRating || comp.rating || 0,
          reviewCount: reviewCount || comp.reviewCount || 0,
          bsr: comp.bsr,
          revenue: comp.revenue || estimateRevenue(comp.bsr, comp.price),
          reviews,
          sentiment,
        });
      } catch (err) {
        // ✅ Don't let one failed product kill the whole category analysis
        console.error(`⚠️ Skipping ${comp.asin}:`, err.message);
      }
    }

    if (!results.length) return res.status(400).json({ error: "Could not scrape any competitor reviews" });

    // Step 3: AI analysis on all scraped reviews combined
    const allReviews = results.flatMap((r) => r.reviews);
    const totalReviews = allReviews.length;
    const insights = totalReviews > 0
      ? await analyzeWithGroq(allReviews)
      : JSON.stringify({
          buyReasons: [],
          complaints: [],
          improvements: [],
          sentimentScore: { positive: 0, neutral: 0, negative: 0 },
        });

    // Step 4: market revenue total
    const marketRevenue = calcMarketRevenue(results);

    res.json({
      success: true,
      mode: "category",
      keyword,
      totalReviewsScraped: totalReviews,
      marketRevenue,
      competitors: results.map(({ reviews: _, ...rest }) => rest),
      insights,
    });

  } catch (err) {
    console.error("❌ /analyze-category:", err.message);
    res.status(500).json({ error: err.message });
  }
});

function calcMarketRevenue(results) {
  let total = 0;
  results.forEach((r) => {
    if (r.revenue) {
      const n = parseFloat(r.revenue.replace(/[$KM]/g, ""));
      if (r.revenue.includes("M")) total += n * 1_000_000;
      else if (r.revenue.includes("K")) total += n * 1_000;
      else total += n;
    }
  });
  if (!total) return "N/A";
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(total / 1_000)}K`;
}

app.listen(5000, () => console.log("Server running on http://localhost:5000"));