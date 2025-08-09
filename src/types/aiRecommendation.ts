export interface AIRecommendation {
  title: string;
  year?: number;
  type: 'Movie' | 'Series';
  category: 'Safe Bet' | 'Deep Cut' | 'Curveball';
  why: string;
  similarElements: string[];
  contentNote?: string;
  whereToWatch?: string;
}
