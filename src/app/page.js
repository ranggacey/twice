'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { membersData } from '@/lib/memberData';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  const [hoveredMember, setHoveredMember] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
            Chat with <span className="text-pink-500">TWICE</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Pilih member TWICE yang ingin kamu ajak chat. Aplikasi ini menggunakan AI untuk mensimulasikan percakapan dengan member TWICE berdasarkan kepribadian mereka.
          </p>
        </header>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {membersData.map((member) => (
            <Link 
              href={ROUTES.MEMBER_CHAT(member.id)} 
              key={member.id}
              className="block"
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform duration-300 h-full hover:-translate-y-2"
                style={{ borderTop: `4px solid ${member.color}` }}
              >
                {/* Member Image */}
                <div className="relative w-full h-60 sm:h-72">
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                      priority={member.id === 'nayeon' || member.id === 'tzuyu'}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div 
                    className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300 ${
                      hoveredMember === member.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium">
                      Chat now {member.emoji}
                    </div>
                  </div>
                </div>
                
                {/* Member Info */}
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {member.name} 
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                      {member.mbti}
                    </span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{member.position}</p>
                  
                  {/* Personality Traits Preview */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {member.personality.traits.slice(0, 2).map((trait, index) => (
                      <span 
                        key={index} 
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {trait}
                      </span>
                    ))}
                    {member.personality.traits.length > 2 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        +{member.personality.traits.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Next.js, Tailwind CSS, and Gemini API</p>
          <p className="mt-1">
            Made with 💖 for ONCEs
          </p>
        </footer>
      </div>
    </div>
  );
}
