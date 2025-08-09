import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface TasteProfileProps {
  profile: string;
}

export const TasteProfile: React.FC<TasteProfileProps> = ({ profile }) => {
  return (
    <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 rounded-lg p-6 border border-purple-500/30 backdrop-blur-sm">
      <div className="flex items-center mb-4">
        <div className="bg-purple-500 p-2 rounded-lg mr-3">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white flex items-center">
          Your Cinematic DNA
          <Sparkles className="w-5 h-5 ml-2 text-amber-400" />
        </h2>
      </div>
      <p className="text-gray-200 text-lg leading-relaxed">{profile}</p>
    </div>
  );
};