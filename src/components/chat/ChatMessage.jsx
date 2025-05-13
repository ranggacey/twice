'use client';

import React, { useState } from 'react';
import ChatBubble from './ChatBubble';
import Image from 'next/image';
import { format } from 'date-fns';

/**
 * ChatMessage - Component for displaying a chat message with additional features
 * 
 * @param {Object} props
 * @param {Object} props.message - Message object containing text, sender, timestamp
 * @param {boolean} props.isLoading - Whether message is in loading state
 * @param {string} props.memberImageUrl - URL for member avatar
 * @param {string} props.attachedImageUrl - URL for attached image (if any)
 */
const ChatMessage = ({ 
  message, 
  isLoading = false, 
  memberImageUrl, 
  attachedImageUrl 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Format timestamp if it exists
  const formattedTime = message.timestamp 
    ? format(new Date(message.timestamp), 'HH:mm')
    : '';

  return (
    <div className="w-full">
      <ChatBubble 
        sender={message.sender}
        text={message.text}
        timestamp={formattedTime}
        imageUrl={message.sender !== 'user' ? memberImageUrl : null}
        isLoading={isLoading}
      />
      
      {/* Display attached image if present and no error loading it */}
      {attachedImageUrl && !imageError && (
        <div className={`my-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
          <div 
            className={`inline-block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700
              ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
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
