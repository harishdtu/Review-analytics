# 🧠 ReviewIQ — Amazon Review Intelligence Platform

ReviewIQ is a full-stack web application that analyzes Amazon product reviews and converts them into **actionable insights** using AI. It helps users quickly understand **what customers love, hate, and expect improvements on** — without manually reading hundreds of reviews.

---

## 🚀 Live Features

### 🔍 1. Single Product Analysis

* Input: Amazon product URL
* Output:

  * ⭐ Average Rating
  * 📊 Sentiment Breakdown (Positive / Neutral / Negative)
  * 💡 AI-generated insights:

    * Why customers buy
    * Common complaints
    * Suggested improvements

---

### 📊 2. AI-Powered Insights

* Uses **Groq API (LLMs like Mixtral / GPT-OSS)**
* Converts raw reviews → structured JSON:

```json
{
  "buyReasons": [],
  "complaints": [],
  "improvements": []
}
```

---

### 🎯 3. Sentiment Analysis

* Derived from ratings:

  * ⭐ 4–5 → Positive
  * ⭐ 3 → Neutral
  * ⭐ 1–2 → Negative
* Displayed using:

  * Doughnut chart (Chart.js)
  * Progress bars

---

### 🖥️ 4. Modern Dashboard UI

* Clean dark UI
* Product scorecard
* Insight cards
* Interactive charts

---

## 🏗️ Tech Stack

### Frontend

* ⚛️ React (Vite + TypeScript)
* 📊 Chart.js
* 🎨 Custom CSS (dark theme)

### Backend

* 🟢 Node.js + Express
* 🌐 REST API

### AI

* 🤖 Groq SDK (LLM-based analysis)

### Scraping

* 🕷️ Playwright / Cheerio / Apify (earlier iterations)
* Extracts:

  * Product title
  * Reviews
  * Ratings

---

## ⚙️ Project Architecture

```
review-analytics/
│
├── backend/
│   ├── server.js        # Express server
│   ├── scrape.js        # Review + product scraping
│   ├── ai.js            # Groq AI integration
│   └── .env             # API keys
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── Dashboard.tsx
│   │   ├── components/
│   │   └── styles/
│   └── index.html
```

---

## 🔄 Workflow

1. User enters Amazon product URL
2. Backend:

   * Extracts ASIN
   * Scrapes product title + reviews
   * Computes sentiment
   * Sends reviews to AI
3. AI:

   * Generates structured insights
4. Frontend:

   * Displays analytics dashboard

---

## 📡 API Endpoints

### `POST /analyze`

**Request:**

```json
{
  "url": "https://www.amazon.in/dp/XXXX"
}
```

**Response:**

```json
{
  "productName": "...",
  "avgRating": 4.5,
  "reviewsCount": 10,
  "sentiment": {
    "positive": 80,
    "neutral": 10,
    "negative": 10
  },
  "insights": {
    "buyReasons": [],
    "complaints": [],
    "improvements": []
  }
}
```

---

## 🛠️ Setup Instructions

### 1️⃣ Clone Repo

```bash
git clone https://github.com/yourusername/reviewiq.git
cd reviewiq
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
GROQ_API_KEY=your_api_key
```

Run server:

```bash
node server.js
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## ⚠️ Challenges Faced

### ❌ API Limitations

* Apify free tier memory limits (8192MB)
* Paid actor restrictions
* Service downtime (junglee maintenance)

### ✅ Solutions

* Reduced API dependency
* Implemented fallback scraping
* Optimized API calls

---

## 💡 Key Learnings

* Real-world scraping ≠ stable APIs
* Need for fallback mechanisms
* Data pipelines require multiple sources
* AI works best with structured prompts

---

## 🔮 Future Improvements

* 🔥 Competitor comparison dashboard
* 📈 Revenue estimation
* 🧠 Keyword extraction (battery, camera, etc.)
* ⚡ Caching results (reduce API cost)
* 🌍 Deploy as SaaS

---

## 🧑‍💻 Author

**Harish Vasamsetti**

* Full Stack Developer
* Passionate about AI + Product Building

---

## ⭐ Why This Project Matters

Most users:

> ❌ Read hundreds of reviews manually

ReviewIQ:

> ✅ Converts reviews → insights instantly

---

## 🏁 Conclusion

ReviewIQ is a step toward building:

> 🧠 AI-powered decision tools for e-commerce

It demonstrates:

* Full-stack engineering
* AI integration
* Real-world problem solving

---

## 📬 Feedback

Feel free to contribute or suggest improvements 🚀
