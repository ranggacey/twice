import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_CHAT_HISTORY_LENGTH } from '@/lib/constants';

/**
 * Global chat store untuk menyimpan state chat
 * Digunakan untuk menyimpan history chat, loading state, dll.
 */
const useChatStore = create(
  persist(
    (set, get) => ({
      /**
       * Map of memberID -> array of messages
       * Example: { nayeon: [...messages], momo: [...messages] }
       */
      chatHistories: {},
      
      /**
       * Map of memberID -> loading status
       */
      loadingStates: {},
      
      /**
       * Last active member ID
       */
      activeMemeberId: null,
      
      /**
       * Map of memberID -> image URL
       */
      attachedImages: {},
      
      /**
       * Add message to chat history
       * @param {string} memberId - Member ID
       * @param {Object} message - Message object
       */
      addMessage: (memberId, message) => {
        const currentHistory = get().chatHistories[memberId] || [];
        
        // Don't exceed max length
        const newHistory = [...currentHistory, message].slice(-MAX_CHAT_HISTORY_LENGTH);
        
        set((state) => ({
          chatHistories: {
            ...state.chatHistories,
            [memberId]: newHistory
          },
          activeMemeberId: memberId
        }));
      },
      
      /**
       * Clear chat history for specific member
       * @param {string} memberId - Member ID
       */
      clearHistory: (memberId) => {
        set((state) => ({
          chatHistories: {
            ...state.chatHistories,
            [memberId]: []
          }
        }));
      },
      
      /**
       * Set loading state for member
       * @param {string} memberId - Member ID
       * @param {boolean} isLoading - Loading state
       */
      setLoading: (memberId, isLoading) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [memberId]: isLoading
          }
        }));
      },
      
      /**
       * Set attached image for member
       * @param {string} memberId - Member ID
       * @param {string} imageUrl - Image URL
       */
      setAttachedImage: (memberId, imageUrl) => {
        set((state) => ({
          attachedImages: {
            ...state.attachedImages,
            [memberId]: imageUrl
          }
        }));
      },
      
      /**
       * Get chat history for member
       * @param {string} memberId - Member ID
       * @returns {Array} Chat history
       */
      getHistory: (memberId) => {
        return get().chatHistories[memberId] || [];
      },
      
      /**
       * Check if member is loading
       * @param {string} memberId - Member ID
       * @returns {boolean} Loading state
       */
      isLoading: (memberId) => {
        return get().loadingStates[memberId] || false;
      },
      
      /**
       * Get attached image for member
       * @param {string} memberId - Member ID
       * @returns {string} Image URL
       */
      getAttachedImage: (memberId) => {
        return get().attachedImages[memberId] || null;
      }
    }),
    {
      name: 'twice-chat-storage',
      partialize: (state) => ({
        chatHistories: state.chatHistories,
        activeMemeberId: state.activeMemeberId
      })
    }
  )
);

export default useChatStore;
