/**
 * Utility functions for the chat application
 */

/**
 * Format a timestamp into a readable time string
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} - Formatted time string (e.g. "14:30")
 */
export function formatTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export function generateId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Truncate text to a specific length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if running in browser environment
 * @returns {boolean} - True if in browser
 */
export function isBrowser() {
  return typeof window !== 'undefined';
}

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to save
 * @returns {boolean} - Success status
 */
export function safeLocalStorage(key, value) {
  if (!isBrowser()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Get data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Retrieved value or default
 */
export function getFromLocalStorage(key, defaultValue = null) {
  if (!isBrowser()) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}
