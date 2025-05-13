'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatTopicSuggestion from './ChatTopicSuggestion';
import { useChatHistory } from '@/hooks/useLocalStorage';
import { getMemberData } from '@/lib/memberData';

/**
 * ChatContainer - Main component for chat functionality
 * 
 * @param {Object} props
 * @param {string} props.memberId - ID of the TWICE member
 */
const ChatContainer = ({ memberId }) => {
  const member = getMemberData(memberId);
  const { history, addMessage, setHistory, clearHistory } = useChatHistory(memberId, []);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] = useState(null);

  // Scroll to bottom when messages change - buat referensi stabil untuk history
  // untuk mencegah infinite loop
  const historyLength = history.length;
  const hasTyping = Boolean(typingMessage);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    setMounted(true);
  }, [historyLength, hasTyping]); // Gunakan nilai primitif

  // Function to handle sending a message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setPendingUserMessage(userMessage);
    addMessage(userMessage);
    setIsLoading(true);
    setTypingMessage('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          message: text,
          history: [...history.slice(-10), { text: text, sender: 'user' }].map(msg => ({
            text: msg.text,
            sender: msg.sender
          })),
        }),
      });
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Format respon tidak valid');
      }
      if (!response.ok) {
        console.error('API error:', result);
        throw new Error(result.error || result.message || 'Error in chat API');
      }
      if (result.needsImage) {
        try {
          const imageResponse = await fetch('/api/search-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              memberId,
              context: determineImageContext(text, result.response),
            }),
          });
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            setAttachedImage(imageData.imageUrl);
          } else {
            console.error('Error fetching image:', await imageResponse.text().catch(() => 'Failed to get response text'));
            setAttachedImage(null);
          }
        } catch (error) {
          console.error('Error fetching image:', error);
          setAttachedImage(null);
        }
      } else {
        setAttachedImage(null);
      }
      const memberMessage = {
        id: (Date.now() + 1).toString(),
        sender: memberId,
        text: result.response,
        timestamp: new Date().toISOString(),
      };
      const typingSpeed = 20;
      const minDelay = 500;
      const typingTime = Math.max(minDelay, result.response.length * typingSpeed);
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        charIndex += 1 + Math.floor(Math.random() * 3);
        if (charIndex >= result.response.length) {
          clearInterval(typingInterval);
          setTypingMessage('');
          addMessage(memberMessage);
          setIsLoading(false);
          setPendingUserMessage(null);
        } else {
          setTypingMessage(result.response.substring(0, charIndex));
        }
      }, 50);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Maaf, ada kesalahan saat memproses pesan.';
      if (error.message.includes('API key')) {
        errorMessage = 'Maaf, API key belum dikonfigurasi. Silakan cek file .env.local';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        errorMessage = 'Terjadi masalah koneksi. Pastikan kamu terhubung ke internet.';
      }
      addMessage({
        id: (Date.now() + 1).toString(),
        sender: memberId,
        text: `${errorMessage} Coba lagi nanti ya!`,
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
      setPendingUserMessage(null);
    }
  };

  // Handle clearing chat history
  const handleClearChat = () => {
    if (window.confirm('Yakin ingin menghapus semua pesan yang kamu kirim?')) {
      // Hanya hapus pesan yang dikirim oleh user
      const filteredHistory = history.filter(msg => msg.sender !== 'user');
      setHistory(filteredHistory);
    }
  };

  // Handle selecting a suggested topic
  const handleSelectTopic = (topic) => {
    handleSendMessage(topic);
  };

  /**
   * Helper function untuk menentukan konteks gambar berdasarkan percakapan
   * @param {string} userMessage - Pesan dari pengguna
   * @param {string} modelResponse - Respons dari model
   * @returns {string} - Konteks gambar (selfie, food, performance, casual, group)
   */
  const determineImageContext = (userMessage, modelResponse) => {
    const combinedText = (userMessage + ' ' + modelResponse).toLowerCase();
    
    // Deteksi konteks berdasarkan kata kunci
    if (combinedText.match(/selfie|selca|foto|wajah|foto diri|mirror/i)) {
      return 'selfie';
    } else if (combinedText.match(/makanan|makan|food|masak|memasak|lapar|snack|dessert/i)) {
      return 'food';
    } else if (combinedText.match(/perform|panggung|konser|dance|menari|nyanyi|bernyanyi|stage/i)) {
      return 'performance';
    } else if (combinedText.match(/casual|santai|outfit|pakaian|baju|fashion|hangout|jalan-jalan/i)) {
      return 'casual';
    } else if (combinedText.match(/grup|group|member|bersama|together|all|semua/i)) {
      return 'group';
    }
    
    // Default konteks jika tidak ada yang cocok
    return 'default';
  };

  if (!member) return <div>Member tidak ditemukan</div>;

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50 dark:bg-gray-900">
      <ChatHeader member={member} onClearChat={handleClearChat} />
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome message if history is empty */}
        {history.length === 0 && (
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
          {history.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              memberImageUrl={member.imageUrl}
              attachedImageUrl={message.sender === memberId ? attachedImage : null}
            />
          ))}
          {pendingUserMessage && (
            <ChatMessage 
              key={pendingUserMessage.id}
              message={pendingUserMessage}
              memberImageUrl={member.imageUrl}
              attachedImageUrl={null}
            />
          )}
          {typingMessage && (
            <ChatMessage 
              message={{ sender: memberId, text: typingMessage }}
              isLoading={true}
              memberImageUrl={member.imageUrl}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        accentColor={member.color}
      />
    </div>
  );
};

export default ChatContainer;
