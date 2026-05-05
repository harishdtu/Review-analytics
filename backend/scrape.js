import { ApifyClient } from "apify-client";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_KEY });

/* ─────────────────────────────────────────
   Extract ASIN
   ───────────────────────────────────────── */
function extractASIN(url = "") {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}

/* ─────────────────────────────────────────
   Get product title by fetching Amazon page
   and extracting <title> tag
   ───────────────────────────────────────── */
function fetchPageTitle(asin) {
  return new Promise((resolve) => {
    const options = {
      hostname: "www.amazon.in",
      path: `/dp/${asin}`,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    };

    const req = https.request(options, (res) => {
      let html = "";
      res.on("data", (chunk) => {
        html += chunk;
        // Stop reading once we have the <title> tag — no need for full page
        if (html.includes("</title>")) req.destroy();
      });
      res.on("end", () => {
        const match = html.match(/<title>(.*?)<\/title>/i);
        if (match) {
          // Amazon title format: "Product Name : Amazon.in: ..."
          // Clean it up
          let title = match[1]
            .replace(/\s*[:\|]\s*Amazon\.in.*$/i, "")
            .replace(/&amp;/g, "&")
            .replace(/&#\d+;/g, "")
            .trim();
          resolve(title || null);
        } else {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.on("close", () => {
      const match = req.res?.toString().match(/<title>(.*?)<\/title>/i);
      resolve(null); // already resolved above if title found
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

/* ─────────────────────────────────────────
   Revenue estimator
   ───────────────────────────────────────── */
export function estimateRevenue(bsr, price) {
  if (!bsr || !price) return null;
  const p = parseFloat(String(price).replace(/[^0-9.]/g, ""));
  if (!p || p <= 0) return null;
  const monthlySales = Math.round(3000 / Math.pow(Number(bsr), 0.6));
  const revenue = monthlySales * p;
  if (revenue >= 1_000_000) return `$${(revenue / 1_000_000).toFixed(1)}M`;
  if (revenue >= 1_000) return `$${Math.round(revenue / 1_000)}K`;
  return `$${Math.round(revenue)}`;
}

/* ─────────────────────────────────────────
   Search Competitors by keyword
   ───────────────────────────────────────── */
export async function searchCompetitors(keyword) {
  try {
    console.log("🔍 Searching competitors for:", keyword);
    const run = await client.actor("junglee/amazon-search-scraper").call({
      searchQueries: [keyword],
      maxResultsPerQuery: 5,
      countryCode: "IN",
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`📦 ${items.length} competitor items found`);

    return items
      .filter((i) => i.asin || extractASIN(i.url || ""))
      .map((i) => ({
        asin: i.asin || extractASIN(i.url || ""),
        name: i.title || i.name || "Unknown Product",
        price: i.price || i.priceAmount || null,
        rating: i.stars || i.rating || null,
        reviewCount: i.reviewsCount || i.reviewCount || 0,
        bsr: i.bestSellerRank || i.bsr || null,
        revenue: estimateRevenue(i.bestSellerRank || i.bsr, i.price || i.priceAmount),
      }))
      .filter((i) => i.asin);
  } catch (e) {
    console.error("❌ searchCompetitors failed:", e.message);
    return [];
  }
}

/* ─────────────────────────────────────────
   Get Reviews
   ───────────────────────────────────────── */
export async function getReviews(productUrl) {
  const asin = extractASIN(productUrl);
  if (!asin) throw new Error("Invalid Amazon URL — no ASIN found");

  const url = `https://www.amazon.in/dp/${asin}`;
  console.log("✅ CLEAN URL:", url);

  // Fetch title and reviews in parallel to save time
  const [run, titleFromPage] = await Promise.all([
    client.actor("junglee/amazon-reviews-scraper").call({
      productUrls: [{ url }],
      maxReviews: 10,
    }),
    fetchPageTitle(asin),
  ]);

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  console.log(`📦 ${items.length} review items`);

  // ✅ Use page title first, then Apify fields, then ASIN fallback
  let productName =
    titleFromPage ||
    items[0]?.product?.title ||
    items[0]?.productTitle ||
    items[0]?.title ||
    `Amazon Product (${asin})`;

  console.log(`✅ Product name resolved: "${productName}"`);

  const reviews = items.map((i) => ({
    rating: i.ratingScore || 0,
    text: `${i.reviewTitle || ""} ${i.reviewDescription || ""}`.trim(),
  }));

  const avgRating = items.length
    ? parseFloat(
        (items.reduce((s, i) => s + (i.ratingScore || 0), 0) / items.length).toFixed(1)
      )
    : 0;

  const total = items.length || 1;
  const pos = items.filter((i) => (i.ratingScore || 0) >= 4).length;
  const neg = items.filter((i) => (i.ratingScore || 0) <= 2).length;
  const neu = total - pos - neg;

  console.log(`✅ ${reviews.length} reviews, avg ${avgRating}★`);

  return {
    reviews,
    avgRating,
    reviewCount: items.length,
    productName,
    asin,
    sentiment: {
      positive: Math.round((pos / total) * 100),
      neutral: Math.round((neu / total) * 100),
      negative: Math.round((neg / total) * 100),
    },
  };
}