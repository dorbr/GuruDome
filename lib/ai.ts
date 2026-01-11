import OpenAI from 'openai';
import { tavily } from '@tavily/core';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function detectFakeReview(review: { text: string; title?: string; rating: number }) {
    if (!process.env.OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY not found, skipping AI detection");
        return null;
    }

    try {
        const prompt = `
    Analyze the following review for potential inauthenticity or fake content.
    Review Title: ${review.title || 'N/A'}
    Review Text: ${review.text}
    Rating: ${review.rating}

    Respond with a JSON object containing:
    - isFake (boolean): whether the review appears fake
    - confidence (number): confidence score 0-100
    - reasoning (string): brief explanation for the verdict

    Consider:
    - Generic, vague, or repetitive language
    - Excessive marketing speak
    - Mismatch between rating and text
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert at detecting fake reviews. Response must be valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) return null;

        const result = JSON.parse(content);
        return {
            isFake: result.isFake,
            confidence: result.confidence,
            reasoning: result.reasoning,
            analyzedAt: new Date()
        };
    } catch (error) {
        console.error("AI Detection failed:", error);
        return null;
    }
}

export async function generateGuruAnalysis(guruName: string, reviews: any[]) {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    const tvly = process.env.TAVILY_API_KEY ? tavily({ apiKey: process.env.TAVILY_API_KEY }) : null;
    let searchContext = "";

    if (tvly) {
        try {
            const searchResult = await tvly.search(`"${guruName}" reviews scam fraud background check`, {
                searchDepth: "advanced",
                maxResults: 5
            });
            searchContext = searchResult.results.map((r: any) => `Source: ${r.url}\nContent: ${r.content}`).join('\n\n');
        } catch (error) {
            console.error("Tavily search failed:", error);
        }
    }

    if (reviews.length === 0) {
        return {
            summary: "No reviews available yet to generate a summary.",
            backgroundCheck: "Insufficient data for background check."
        };
    }

    try {
        const reviewsText = reviews.map((r: any) => `Rating: ${r.rating}, Text: "${r.text}", Title: "${r.title || ''}"`).join('\n');

        const prompt = `
        Analyze the following reviews for a guru/creator named "${guruName}".
        
        Review Data (Internal Users):
        ${reviewsText.substring(0, 3000)}

        Web Search Results (External Sources):
        ${searchContext || "No external search data available."}
        
        Respond with a JSON object containing:
        - summary (string): A concise 2-3 sentence summary of what users generally think (pros/cons). Use generic terms like "content", "mentorship", "products", or "services" instead of assuming they sell a "course".
        - backgroundCheck (string): A "background check" assessment. Combined analysis of internal reviews and web search results. Look for patterns of scam accusations, fake guru behavior, lawsuits, or inconsistent claims. Quote specific external sources if relevant. 
        
        IMPORTANT: 
        - If external search results are empty or irrelevant, DO NOT say "No results found" or "External search yielded no pertinent information". Instead, base the check solely on internal data or say "No significant public negative records found."
        - Avoid assuming the guru sells a course unless explicitly mentioned.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert analyst of online gurus, influencers, and content creators. Be objective, critical but fair. Response must be valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) return null;

        const result = JSON.parse(content);
        return {
            summary: result.summary,
            backgroundCheck: result.backgroundCheck,
        };
    } catch (error) {
        console.error("AI Analysis failed:", error);
        return null;
    }
}
