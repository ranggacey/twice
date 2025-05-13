'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

/**
 * ChatHeader - Component for displaying header of chat interface
 * 
 * @param {Object} props
 * @param {Object} props.member - Member data object
 * @param {Function} props.onClearChat - Function to clear chat history
 */
const ChatHeader = ({ member, onClearChat }) => {
  if (!member) return null;

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Back button */}
        <Link 
          href={ROUTES.HOME} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        
        {/* Member info */}
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2" style={{ borderColor: member.color }}>
            {member.imageUrl ? (
              <Image 
                src={member.imageUrl} 
                alt={member.name} 
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div 
                className="h-full w-full flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0)}
              </div>
            )}
            
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
          </div>
          
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">{member.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{member.position}</p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onClearChat}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          title="Hapus riwayat chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        
        <div 
          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs"
          style={{ backgroundColor: member.color }}
          title={`MBTI: ${member.mbti}`}
        >
          {member.emoji || member.mbti}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
