'use client';

import React, { useState, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import Image from 'next/image';
import { formatTime } from '@/lib/utils';

/**
 * ChatMessage - Component for displaying a chat message with additional features
 * 
 * @param {Object} props
 * @param {Object} props.message - Message object containing text, sender, timestamp
 * @param {boolean} props.isLoading - Whether message is in loading state
 * @param {string} props.memberImageUrl - URL for member avatar
 * @param {string} props.attachedImageUrl - URL for attached image (if any)
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 */
const ChatMessage = ({ 
  message, 
  isLoading = false, 
  memberImageUrl, 
  attachedImageUrl,
  onDelete
}) => {
  const [imageError, setImageError] = useState(false);
  const [formattedTime, setFormattedTime] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  
  // Safety check for missing message object
  const safeMessage = message || { sender: '', text: '', timestamp: null };
  
  useEffect(() => {
    if (safeMessage.timestamp) {
      try {
        setFormattedTime(formatTime(safeMessage.timestamp));
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        setFormattedTime('');
      }
    } else {
      setFormattedTime('');
    }
  }, [safeMessage.timestamp]);

  // If no message provided after safety check, don't render anything
  if (!safeMessage.text && !isLoading) return null;

  const handleDelete = () => {
    if (onDelete && safeMessage.id) {
      onDelete(safeMessage.id);
    }
  };

  return (
    <div 
      className="w-full relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Delete button - Show only for user messages and when hovering */}
      {onDelete && safeMessage.sender === 'user' && (
        <button 
          onClick={handleDelete}
          className="absolute -right-2 -top-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center 
                    hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <ChatBubble 
        sender={safeMessage.sender}
        text={safeMessage.text || ''}
        timestamp={formattedTime}
        imageUrl={safeMessage.sender !== 'user' ? memberImageUrl : null}
        isLoading={isLoading}
      />
      
      {/* Display attached image if present and no error loading it */}
      {attachedImageUrl && !imageError && (
        <div className={`my-2 ${safeMessage.sender === 'user' ? 'text-right' : 'text-left'}`}>
          <div 
            className={`inline-block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700
              ${safeMessage.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
            style={{ maxWidth: 'calc(70% - 40px)' }}
          >
            <div className="relative w-full h-48 sm:h-64">
              <Image
                src={attachedImageUrl}
                alt="Attached image"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized={attachedImageUrl.startsWith('https://')} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
