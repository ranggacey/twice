'use client';

import React from 'react';
import Button from '@/components/ui/Button';

/**
 * Daftar topik yang bisa dibicarakan dengan member
 */
const TOPIC_SUGGESTIONS = {
  general: [
    'Apa kabar hari ini?',
    'Ceritakan tentang dirimu',
    'Kamu sedang apa sekarang?'
  ],
  music: [
    'Lagu favoritmu apa?',
    'Ceritakan tentang pengalaman syuting MV',
    'Kamu paling suka perform lagu apa?'
  ],
  personal: [
    'Apa hobimu di waktu luang?',
    'Tipe kepribadian MBTI kamu apa?',
    'Makanan favoritmu apa?'
  ],
  funny: [
    'Ceritakan momen lucu dengan member lain',
    'Selca terbaru kamu kayak gimana?',
    'Hal apa yang membuat kamu tertawa?'
  ]
};

/**
 * ChatTopicSuggestion - Component to display chat topic suggestions
 * 
 * @param {Object} props
 * @param {Function} props.onSelectTopic - Function to call when a topic is selected
 * @param {string} props.memberName - Member name for personalized suggestions
 */
const ChatTopicSuggestion = ({ onSelectTopic, memberName }) => {
  const allCategories = Object.keys(TOPIC_SUGGESTIONS);
  // Pick 2 random categories
  const randomCategories = allCategories
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
  
  return (
    <div className="mt-6 mb-4">
      <p className="text-sm text-gray-500 mb-3 text-center">
        Bingung mau ngobrol apa sama {memberName}? Coba topik ini:
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {randomCategories.flatMap(category => 
          TOPIC_SUGGESTIONS[category]
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map((topic, index) => (
              <Button 
                key={`${category}-${index}`}
                variant="outline"
                size="sm"
                onClick={() => onSelectTopic(topic)}
                className="text-xs animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {topic}
              </Button>
            ))
        )}
      </div>
    </div>
  );
};

export default ChatTopicSuggestion; 