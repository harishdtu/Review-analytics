export const DATA = [
  { rank: 1, brand: "Thorne",        revenue: 608000, rating: 4.7, reviews: 3241, me: false, sentiment: { positive: 89, neutral: 7,  negative: 4 }, topPro: "Bioavailability", topCon: "Price"       },
  { rank: 2, brand: "Doctor's Best", revenue: 412000, rating: 4.6, reviews: 2108, me: false, sentiment: { positive: 84, neutral: 10, negative: 6 }, topPro: "Value",           topCon: "Capsule size" },
  { rank: 3, brand: "Pure Encap.",   revenue: 310000, rating: 4.7, reviews: 1876, me: false, sentiment: { positive: 91, neutral: 6,  negative: 3 }, topPro: "Clean formula",   topCon: "Price"       },
  { rank: 4, brand: "YOU",           revenue: 221000, rating: 4.5, reviews: 1247, me: true,  sentiment: { positive: 80, neutral: 12, negative: 8 }, topPro: "Effectiveness",   topCon: "Shipping"    },
  { rank: 5, brand: "NOW Foods",     revenue: 198000, rating: 4.4, reviews: 987,  me: false, sentiment: { positive: 78, neutral: 13, negative: 9 }, topPro: "Affordable",      topCon: "Fillers"     },
];

export type Competitor = typeof DATA[0];