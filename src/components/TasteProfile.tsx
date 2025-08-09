import React from 'react';
import { Brain, Sparkles, Bot } from 'lucide-react';

// Simple markdown to JSX converter for basic formatting
const formatText = (text: string) => {
  if (!text) return null;
  
  // Split by double newlines to handle paragraphs
  return text.split('\n\n').map((paragraph, i) => {
    // Handle headers (##)
    if (paragraph.startsWith('## ')) {
      return <h3 key={i} className="text-xl font-bold text-white mt-4 mb-2">{paragraph.substring(3)}</h3>;
    }
    // Handle bold (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let elements: (string | JSX.Element)[] = [paragraph];
    
    // Process bold text
    elements = elements.flatMap((el, idx) => {
      if (typeof el !== 'string') return [el];
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(el)) !== null) {
        if (match.index > lastIndex) {
          parts.push(el.substring(lastIndex, match.index));
        }
        parts.push(<strong key={`${idx}-${match.index}`} className="text-amber-300">{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < el.length) {
        parts.push(el.substring(lastIndex));
      }
      
      return parts;
    });
    
    return <p key={i} className="text-gray-200 text-lg leading-relaxed mb-4">{elements}</p>;
  });
};

interface TasteProfileProps {
  profile: string;
}

export const TasteProfile: React.FC<TasteProfileProps> = ({ profile }) => {
  // Split the profile into the main part and AI insights
  const [mainProfile, aiInsights] = profile.includes('**AI-Powered Insights**') 
    ? profile.split('**AI-Powered Insights**')
    : [profile, ''];

  return (
    <div className="space-y-6">
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
        <p className="text-gray-200 text-lg leading-relaxed">{mainProfile}</p>
      </div>

      {aiInsights && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-gray-600/30 backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-2 rounded-lg mr-3">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              AI-Powered Insights
              <Sparkles className="w-5 h-5 ml-2 text-blue-300" />
            </h2>
          </div>
          <div className="text-gray-200">
            {formatText(aiInsights)}
          </div>
        </div>
      )}
    </div>
  );
};