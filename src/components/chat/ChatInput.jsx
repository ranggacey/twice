'use client';

import React, { useState, useRef } from 'react';

/**
 * ChatInput - Component for sending messages in chat
 * 
 * @param {Object} props
 * @param {Function} props.onSendMessage - Function to call when a message is sent
 * @param {boolean} props.isLoading - Whether currently waiting for a response
 * @param {string} props.accentColor - Accent color for the input styling
 */
const ChatInput = ({ 
  onSendMessage, 
  isLoading = false, 
  accentColor = '#a970ff'
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    // Allow sending with Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full border-t border-gray-200 dark:border-gray-800 pt-4 pb-6"
    >
      <div className="relative flex items-center">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan..."
          disabled={isLoading}
          className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-700 
                    rounded-full resize-none text-sm focus:outline-none focus:ring-2
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    disabled:opacity-60 disabled:cursor-not-allowed min-h-[50px] max-h-[120px]"
          style={{ 
            height: '50px',
            overflowY: 'auto',
            lineHeight: '1.5',
            focusRingColor: accentColor 
          }}
          rows={1}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="absolute right-2 p-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200"
          style={{ 
            backgroundColor: isLoading || !message.trim() ? '#ccc' : accentColor 
          }}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" transform="rotate(90, 10, 10)" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        {isLoading ? 'Menunggu balasan...' : 'Tekan Enter untuk mengirim'}
      </div>
    </form>
  );
};

export default ChatInput;
