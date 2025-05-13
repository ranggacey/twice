'use client';

import { useState, useEffect, useRef } from 'react';
import { getMemberData } from '@/lib/memberData';
import { saveMessage, getAllMessages, deleteMessage as deleteStoredMessage, clearAllMessages, createMessage } from '@/lib/chatStorage';

/**
 * Custom hook for managing chat functionality
 * Uses direct localStorage access for reliability
 * 
 * @param {string} memberId - ID of the TWICE member
 * @returns {Object} Chat related state and functions
 */
export function useChat(memberId) {
  const member = getMemberData(memberId);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [pendingUserMessage, setPendingUserMessage] = useState(null);
  const messagesEndRef = useRef(null);

  // Load messages from direct storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedMessages = getAllMessages(memberId);
        setMessages(storedMessages);
        console.log(`[LOAD] Loaded ${storedMessages.length} messages for ${memberId}`);
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    }
  }, [memberId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, Boolean(typingMessage)]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`twice_chat_${memberId}`, JSON.stringify(messages));
        console.log(`[SAVE] Saved ${messages.length} messages to localStorage`);
      } catch (error) {
        console.error('Error saving messages to localStorage:', error);
      }
    }
  }, [messages, memberId]);

  // Function to add a message
  const addMessage = (message) => {
    // Save to direct storage first
    saveMessage(memberId, message);
    
    // Then update state
    setMessages(prev => [...prev, message]);
  };

  // Function to send a message
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    
    // Create user message
    const userMessage = createMessage('user', text, true);
    
    // Add to pending state and storage
    setPendingUserMessage(userMessage);
    addMessage(userMessage);
    
    // Start loading
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
          history: [...messages.slice(-10)].map(msg => ({
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
      
      // Check if we need to fetch an image
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
      
      // Create member message
      const memberMessage = createMessage(memberId, result.response);
      
      // Simulate typing
      const typingSpeed = 20;
      let charIndex = 0;
      
      const typingInterval = setInterval(() => {
        charIndex += 1 + Math.floor(Math.random() * 3);
        if (charIndex >= result.response.length) {
          clearInterval(typingInterval);
          setTypingMessage('');
          
          // Critical fix: Save directly to localStorage AND update state
          // 1. Save to direct storage
          saveMessage(memberId, memberMessage);
          
          // 2. Update state after direct save
          setMessages(prev => [...prev, memberMessage]);
          
          // 3. Double save to ensure persistence
          const allMessages = [...messages, userMessage, memberMessage];
          localStorage.setItem(`twice_chat_${memberId}`, JSON.stringify(allMessages));
          
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
      
      const errorMsg = createMessage(memberId, `${errorMessage} Coba lagi nanti ya!`);
      addMessage(errorMsg);
      
      setIsLoading(false);
      setPendingUserMessage(null);
    }
  };

  // Clear all chat history
  const clearChat = () => {
    if (window.confirm('Yakin ingin menghapus semua pesan chat?')) {
      clearAllMessages(memberId);
      setMessages([]);
    }
  };

  // Delete a specific message
  const deleteMessage = (messageId) => {
    deleteStoredMessage(memberId, messageId);
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
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

  return {
    member,
    history: messages,
    isLoading,
    typingMessage,
    attachedImage,
    pendingUserMessage,
    messagesEndRef,
    sendMessage,
    deleteMessage,
    clearChat
  };
}
