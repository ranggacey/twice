/**
 * Direct chat storage implementation
 * This bypasses React state to ensure messages are always saved
 */

// Function to directly save a message to localStorage
export function saveMessage(memberId, message) {
  try {
    // Get existing messages
    const storageKey = `twice_chat_${memberId}`;
    const existingMessagesJSON = localStorage.getItem(storageKey);
    let messages = [];
    
    // Parse existing messages or create empty array
    if (existingMessagesJSON) {
      try {
        messages = JSON.parse(existingMessagesJSON);
        if (!Array.isArray(messages)) {
          messages = [];
        }
      } catch (e) {
        console.error('Error parsing existing messages:', e);
        messages = [];
      }
    }
    
    // Add the new message
    messages.push(message);
    
    // Save back to localStorage immediately
    localStorage.setItem(storageKey, JSON.stringify(messages));
    
    // Log the update
    console.log(`[DIRECT SAVE] Message saved for ${memberId}, total: ${messages.length}`);
    
    return true;
  } catch (error) {
    console.error('Error in direct save:', error);
    return false;
  }
}

// Get all messages for a member
export function getAllMessages(memberId) {
  try {
    const storageKey = `twice_chat_${memberId}`;
    const messagesJSON = localStorage.getItem(storageKey);
    
    if (!messagesJSON) {
      return [];
    }
    
    const messages = JSON.parse(messagesJSON);
    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.error('Error getting all messages:', error);
    return [];
  }
}

// Delete a message
export function deleteMessage(memberId, messageId) {
  try {
    const storageKey = `twice_chat_${memberId}`;
    const existingMessagesJSON = localStorage.getItem(storageKey);
    
    if (!existingMessagesJSON) {
      return false;
    }
    
    // Parse existing messages
    let messages = JSON.parse(existingMessagesJSON);
    
    // Filter out the message to delete
    messages = messages.filter(msg => msg.id !== messageId);
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(messages));
    
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

// Clear all messages for a member
export function clearAllMessages(memberId) {
  try {
    const storageKey = `twice_chat_${memberId}`;
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Error clearing messages:', error);
    return false;
  }
}

// Helper to create a new message object
export function createMessage(sender, text, isUser = false) {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    sender,
    text,
    timestamp: new Date().toISOString(),
    isUser
  };
} 