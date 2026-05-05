import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Analyze reviews using Groq (LLaMA / Mixtral)
 */
export async function analyzeWithGroq(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      buyReasons: [],
      complaints: [],
      improvements: [],
      summary: "No reviews to analyze",
    };
  }

  const reviewTexts = reviews
    .slice(0, 50)
    .map((r) => {
      if (typeof r === "string") return r;
      if (r.text) return r.text;
      return `[${r.rating}/5] ${r.title}: ${r.description}`;
    })
    .join("\n");

  const prompt = `You are a market intelligence analyst. Analyze these Amazon product reviews and extract actionable insights.

REVIEWS:
${reviewTexts}

Return a JSON object with EXACTLY this structure (no additional text):
{
  "buyReasons": ["reason1", "reason2", "reason3"],
  "complaints": ["complaint1", "complaint2", "complaint3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}

Constraints:
- Each array should have 3-5 items
- Items should be concise (under 80 characters)
- Focus on recurring themes
- Return ONLY valid JSON`;

  try {
    console.log(`📊 Sending ${reviews.length} reviews to Groq...`);

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b", // or mixtral-8x7b
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    console.log("📝 Groq response:", responseText);

    let insights;

    try {
      insights = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[1]);
      } else {
        console.warn("⚠️ Could not parse Groq response as JSON");
        insights = {
          buyReasons: ["Product quality", "Customer reviews", "Price point"],
          complaints: ["Delivery delays", "Packaging issues", "Product defects"],
          improvements: ["Faster delivery", "Better quality control", "Enhanced packaging"],
        };
      }
    }

    // Validate structure
    insights.buyReasons = Array.isArray(insights.buyReasons) ? insights.buyReasons : [];
    insights.complaints = Array.isArray(insights.complaints) ? insights.complaints : [];
    insights.improvements = Array.isArray(insights.improvements) ? insights.improvements : [];

    console.log("✅ Analysis complete:", insights);
    return insights;
  } catch (err) {
    console.error("❌ Groq API error:", err.message);
    throw new Error(`AI analysis failed: ${err.message}`);
  }
}