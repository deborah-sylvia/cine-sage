import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FeedbackButton: React.FC = () => {
  return (
    <a
      href="https://tally.so/r/nGE4e2"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center z-50"
      aria-label="Provide feedback"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="ml-2 font-medium">Feedback</span>
    </a>
  );
};

export default FeedbackButton;
