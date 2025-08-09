import axios from "axios";
import { Movie } from "../types/movie";
import { systemPrompt, generateMovieRecPrompt } from "../prompts/moviePrompts";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free";

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AIRecommendationService {
  constructor(private apiKey: string) {}

  private async getAIResponse(messages: AIMessage[]) {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: OPENROUTER_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 1000,

          // 🔒 FREE-ONLY: if the free endpoint is busy, this will error instead of falling back.
          provider: {
            allow_fallbacks: false,
            max_price: { prompt: 0, completion: 0, request: 0 },
            // If you know the exact free provider name from the Models page, uncomment:
            // only: ["OpenRouter"] // or whatever exact provider label shows as free
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "http://localhost:3001/",
            "X-Title": "CineSage",
          },
          timeout: 60000,
          validateStatus: (s) => s >= 200 && s < 300, // fail fast on non-2xx
        }
      );

      // ✅ Double-check what OpenRouter actually used
      const routed =
        (response.headers &&
          (response.headers["openrouter-model"] as string)) ||
        (response.data && (response.data.model as string)) ||
        (response.data?.choices?.[0]?.model as string) ||
        "";

      if (routed && routed !== OPENROUTER_MODEL) {
        // Hard fail if anything except the free DeepSeek endpoint was used.
        throw new Error(
          `Blocked: routed to unexpected model "${routed}". Expected "${OPENROUTER_MODEL}".`
        );
      }

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No content returned from OpenRouter.");
      }
      return content;
    } catch (error: any) {
      console.error(
        "Error calling OpenRouter:",
        error?.response?.data || error
      );
      throw error;
    }
  }

  public async generatePersonalizedRecommendations(
    selectedMovies: Movie[]
  ): Promise<string> {
    const userPrompt = generateMovieRecPrompt(selectedMovies);
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
    return this.getAIResponse(messages);
  }
}

// IMPORTANT: Prefer passing the key from server-side env, not exposing it to the browser.
export const aiRecommendationService = new AIRecommendationService(
  process.env.OPENROUTER_API_KEY || ""
);
