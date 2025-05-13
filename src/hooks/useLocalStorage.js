'use client';

import { useState, useEffect, useRef } from 'react';
import { safeLocalStorage, getFromLocalStorage, isBrowser } from '@/lib/utils';

/**
 * Debug function to log localStorage operations
 * Helps with debugging storage issues
 */
function debugLocalStorage(key, operation, value) {
  if (process.env.NODE_ENV === 'development' && isBrowser()) {
    console.log(`[LocalStorage Debug] ${operation} for key "${key}":`, 
      value || localStorage.getItem(key) || 'No value');
    
    // Log all keys in localStorage for this app
    const allKeys = Object.keys(localStorage)
      .filter(k => k.startsWith('twice_'));
    
    console.log(`[LocalStorage Debug] All TWICE chat keys:`, allKeys);
  }
}

/**
 * Custom hook untuk menggunakan localStorage dengan auto-save yang reliable
 * 
 * @param {string} key - Kunci untuk menyimpan data di localStorage
 * @param {any} initialValue - Nilai default jika data tidak ditemukan
 * @returns {[any, Function, Function]} - [nilai, setter, remover]
 */
export function useLocalStorage(key, initialValue) {
  // Use a ref to track if this is the initial render
  const isFirstRender = useRef(true);
  
  // Track if localStorage is available
  const [isStorageAvailable, setIsStorageAvailable] = useState(false);
  
  // Check localStorage availability on mount
  useEffect(() => {
    setIsStorageAvailable(isBrowser());
  }, []);
  
  // Initialize state with value from localStorage or initial value
  const [storedValue, setStoredValue] = useState(() => {
    if (!isBrowser()) {
      return initialValue;
    }
    
    try {
      // Get value from localStorage
      const item = getFromLocalStorage(key, initialValue);
      debugLocalStorage(key, 'INIT', item);
      return item;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set up auto-save effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (!isBrowser() || !isStorageAvailable) {
      return;
    }
    
    // Create a timer for debounced saving
    const saveTimer = setTimeout(() => {
      try {
        safeLocalStorage(key, storedValue);
        debugLocalStorage(key, 'AUTO-SAVE', storedValue);
      } catch (error) {
        console.error(`Error auto-saving to localStorage key "${key}":`, error);
      }
    }, 300); // 300ms debounce
    
    // Clean up timer on component unmount or before next save
    return () => clearTimeout(saveTimer);
  }, [key, storedValue, isStorageAvailable]);
  
  // Save the value on page unload/tab close
  useEffect(() => {
    if (!isBrowser() || !isStorageAvailable) {
      return;
    }
    
    const handleBeforeUnload = () => {
      try {
        safeLocalStorage(key, storedValue);
        debugLocalStorage(key, 'UNLOAD-SAVE', storedValue);
      } catch (error) {
        console.error(`Error saving to localStorage on unload: ${key}`, error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [key, storedValue, isStorageAvailable]);

  // Function to update the stored value
  const setValue = (value) => {
    try {
      // Allow value to be a function
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to localStorage immediately for all updates - critical fix
      if (isBrowser()) {
        // Direct write to localStorage without any conditionals for chat data
        try {
          localStorage.setItem(key, JSON.stringify(valueToStore));
          console.log(`[CRITICAL FIX] Directly saved to localStorage: ${key}`, valueToStore);
        } catch (err) {
          console.error(`[CRITICAL FIX] Error saving to localStorage directly:`, err);
        }
      }
    } catch (error) {
      console.error(`Error in setValue for localStorage key "${key}":`, error);
    }
  };

  // Function to remove the value from localStorage
  const removeValue = () => {
    try {
      // Reset state to initial value
      setStoredValue(initialValue);
      
      // Remove from localStorage
      if (isBrowser() && isStorageAvailable) {
        localStorage.removeItem(key);
        debugLocalStorage(key, 'REMOVE');
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * Hook untuk chat history dengan auto-save
 * @param {string} memberId - ID member TWICE
 * @param {Array} initialHistory - History chat awal
 * @returns {Object} - Object containing history and methods
 */
export function useChatHistory(memberId, initialHistory = []) {
  const storageKey = `twice_chat_${memberId}`;
  const [history, setHistory, clearHistory] = useLocalStorage(storageKey, initialHistory);

  /**
   * Menambahkan pesan ke history
   * @param {Object} message - Pesan untuk ditambahkan
   */
  const addMessage = (message) => {
    setHistory(prevHistory => {
      // Ensure we have a valid array
      const validHistory = Array.isArray(prevHistory) ? prevHistory : [];
      return [...validHistory, message];
    });
  };

  /**
   * Delete a specific message by ID
   * @param {string} messageId - ID of message to delete
   */
  const deleteMessage = (messageId) => {
    setHistory(prevHistory => {
      // Ensure we have a valid array
      const validHistory = Array.isArray(prevHistory) ? prevHistory : [];
      return validHistory.filter(msg => msg.id !== messageId);
    });
  };

  return {
    history: Array.isArray(history) ? history : [],
    addMessage,
    setHistory,
    clearHistory,
    deleteMessage
  };
}
