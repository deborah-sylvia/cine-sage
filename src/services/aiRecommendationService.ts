import axios from 'axios';
import { Movie } from '../types/movie';
import { systemPrompt, generateMovieRecPrompt } from '../prompts/moviePrompts';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIRecommendationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getAIResponse(messages: AIMessage[]) {
    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-r1-0528-qwen3-8b',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  }

  public async generatePersonalizedRecommendations(selectedMovies: Movie[]): Promise<string> {
    const userPrompt = generateMovieRecPrompt(selectedMovies);

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return await this.getAIResponse(messages);
  }
}

export const aiRecommendationService = new AIRecommendationService(import.meta.env.VITE_DEEPSEEK_API_KEY || '');
