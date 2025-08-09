import axios from "axios";
import { Movie } from "../types/movie";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenRouterService {
  private apiKey: string;
  private model: string;

  constructor(
    apiKey: string,
    model: string = "deepseek/deepseek-r1-0528-qwen3-8b:free"
  ) {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async getAIResponse(messages: AIMessage[]) {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: this.model,
          messages,
          temperature: 0.5,
          max_tokens: 1500,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://github.com/deborah-sylvia/cine-sage",
            "X-Title": "CineSage",
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      throw error;
    }
  }

  public async generatePersonalizedRecommendations(
    selectedMovies: Movie[]
  ): Promise<string> {
    const movieList = selectedMovies
      .map((movie) => `- ${movie.title} (${movie.year}) - ${movie.genre}`)
      .join("\n");

    const systemPrompt = `You are a movie recommendation expert. Analyze the user's movie preferences and provide personalized recommendations.`;

    const userPrompt = `Based on these movies I like, please provide 5 personalized movie recommendations with a short explanation for each:

${movieList}

Format your response as a markdown list with each recommendation including:
1. Movie Title (Year)
2. Brief explanation of why it's recommended
3. Similar themes or elements to the selected movies

Make it engaging and personalized!`;

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return await this.getAIResponse(messages);
  }
}

export const openRouterService = new OpenRouterService(
  import.meta.env.VITE_OPENROUTER_API_KEY || ""
);
