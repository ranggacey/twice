'use client';

import React, { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatTopicSuggestion from './ChatTopicSuggestion';
import { useChat } from '@/hooks/useChat';

/**
 * ChatContainer - Main component for chat functionality
 * 
 * @param {Object} props
 * @param {string} props.memberId - ID of the TWICE member
 */
const ChatContainer = ({ memberId }) => {
  const {
    member,
    history,
    isLoading,
    typingMessage,
    attachedImage,
    pendingUserMessage,
    messagesEndRef,
    sendMessage,
    deleteMessage,
    clearChat
  } = useChat(memberId);

  // Handle selecting a suggested topic
  const handleSelectTopic = (topic) => {
    sendMessage(topic);
  };

  if (!member) return <div>Member tidak ditemukan</div>;

  // Safety check for history
  const safeHistory = Array.isArray(history) ? history : [];
  
  // Log current chat state for debugging
  console.log(`[RENDER] ChatContainer with ${safeHistory.length} messages`);

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50 dark:bg-gray-900">
      <ChatHeader member={member} onClearChat={clearChat} />
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome message if history is empty */}
        {safeHistory.length === 0 && (
          <div className="text-center p-6 text-gray-500">
            <p className="mb-2">
              👋 Halo! Kamu sekarang chatting dengan {member.name}
            </p>
            <p>Mulai chat dengan mengirim pesan!</p>
            
            {/* Show topic suggestions for new chats */}
            <ChatTopicSuggestion 
              onSelectTopic={handleSelectTopic}
              memberName={member.name}
            />
          </div>
        )}
        
        {/* Chat messages */}
        <div className="space-y-4">
          {safeHistory.map((message) => (
            <ChatMessage 
              key={message.id || `msg-${Math.random()}`} 
              message={message} 
              memberImageUrl={member.imageUrl}
              attachedImageUrl={message.sender === memberId ? attachedImage : null}
              onDelete={() => deleteMessage(message.id)}
            />
          ))}
          {pendingUserMessage && (
            <ChatMessage 
              key={pendingUserMessage.id || 'pending'} 
              message={pendingUserMessage}
              memberImageUrl={member.imageUrl}
              attachedImageUrl={null}
            />
          )}
          {typingMessage && (
            <ChatMessage 
              key={`typing-${Date.now()}`}
              message={{ 
                id: `typing-${Date.now()}`,
                sender: memberId, 
                text: typingMessage 
              }}
              isLoading={true}
              memberImageUrl={member.imageUrl}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
        accentColor={member.color}
      />
    </div>
  );
};

export default ChatContainer;
