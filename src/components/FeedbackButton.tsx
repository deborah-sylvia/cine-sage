import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FeedbackButton: React.FC = () => {
  return (
    <a
      href="https://tally.so/r/nGE4e2"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-purple-600/90 hover:bg-purple-500/90 text-white rounded-xl px-5 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 flex items-center z-50 border border-purple-400/20 hover:border-purple-300/40"
      aria-label="Provide feedback"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="ml-2 font-medium text-sm">Feedback</span>
    </a>
  );
};

export default FeedbackButton;
