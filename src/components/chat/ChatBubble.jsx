'use client';

import React from 'react';
import Image from 'next/image';
import { MEMBER_COLORS } from '@/lib/constants';

/**
 * ChatBubble - Component for displaying a chat message
 * 
 * @param {Object} props
 * @param {string} props.sender - 'user' or member id
 * @param {string} props.text - Message text content
 * @param {string} props.timestamp - Time message was sent
 * @param {string} props.imageUrl - Optional image URL for member messages
 * @param {boolean} props.isLoading - Whether the message is in loading state
 */
const ChatBubble = ({ 
  sender, 
  text, 
  timestamp, 
  imageUrl, 
  isLoading = false 
}) => {
  const isUser = sender === 'user';
  // Instead of using template literals, we'll use style for member colors
  const defaultBubbleClass = isUser ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700';
  const alignmentClass = isUser ? 'ml-auto' : 'mr-auto';
  const maxWidthClass = 'max-w-[80%] sm:max-w-[70%]';
  
  // Determine animation class for loading state
  const loadingClass = isLoading ? 'animate-pulse' : '';
  
  return (
    <div className={`flex gap-2 w-full my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for member messages */}
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={`${sender} avatar`} 
              width={32} 
              height={32} 
              className="object-cover"
            />
          ) : (
            <div 
              className="h-full w-full flex items-center justify-center text-white"
              style={{ backgroundColor: MEMBER_COLORS[sender] || '#ccc' }}
            >
              {sender.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      {/* Message content */}
      <div className={`${alignmentClass} ${maxWidthClass}`}>
        <div 
          className={`rounded-2xl px-4 py-3 ${defaultBubbleClass} ${loadingClass}`}
          style={{ 
            ...((!isUser && MEMBER_COLORS[sender]) && { 
              backgroundColor: `${MEMBER_COLORS[sender]}20` // Adds 20% opacity
            })
          }}
        >
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{text}</p>
        </div>
        
        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-1 px-1">
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
