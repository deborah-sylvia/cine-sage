import axios from "axios";
import { Movie } from "../types/movie";
import { systemPrompt, generateMovieRecPrompt } from "../prompts/moviePrompts";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free";

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// starting to think this file is not being used anywhere, is this a useless file?

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

          // Strict configuration to use only the specified model
          provider: {
            allow_fallbacks: false, // Disable fallbacks completely
            require_parameters: true,
            require_consent: true,
            // Force the exact model we want
            model: OPENROUTER_MODEL,
            // Explicitly reject any fallback models
            reject_models: ["*"],
            // Set price limits to 0 to prevent any paid model usage
            max_price: { prompt: 0, completion: 0, request: 0 },
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

      // Double-check what OpenRouter actually used
      // Get the actual model used from the response
      const routedModel =
        response.headers?.["x-openrouter-model"] ||
        response.headers?.["openrouter-model"] ||
        response.data?.model ||
        response.data?.choices?.[0]?.model ||
        "unknown";

      console.log("Requested model:", OPENROUTER_MODEL);
      console.log("Actual model used:", routedModel);
      console.log("Full response headers:", response.headers);

      if (routedModel !== OPENROUTER_MODEL) {
        throw new Error(
          `Blocked: Routed to model "${routedModel}" but expected "${OPENROUTER_MODEL}". ` +
            "Please check if the model name is correct and available."
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

// Check for the environment variable with Vite's required VITE_ prefix
const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

if (!openRouterApiKey) {
  console.warn(
    "No VITE_OPENROUTER_API_KEY environment variable set. Please set it in your .env file and in your Vercel project settings."
  );
}

export const aiRecommendationService = new AIRecommendationService(
  openRouterApiKey || ""
);
