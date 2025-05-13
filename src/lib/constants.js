/**
 * Konstanta untuk aplikasi Chat TWICE
 * Berisi nilai-nilai yang digunakan di seluruh aplikasi
 */

/**
 * API keys dan config
 * (Nilai sebenarnya diambil dari environment variables)
 */
export const API_CONFIG = {
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyDLJJqUeecYYMPuLXkrUQWUhl78cSmoANg',
  GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || 'AIzaSyDztk8XxicENqFkUJFI45K3LY0Fwy-yXVo',
  GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID || 'e13c0b9e69a6c4ffa',
  GEMINI_MODEL: 'gemini-1.5-flash',
};

/**
 * Variabel warna untuk setiap member TWICE
 * Digunakan untuk UI
 */
export const MEMBER_COLORS = {
  nayeon: 'var(--color-nayeon)',
  jeongyeon: 'var(--color-jeongyeon)',
  momo: 'var(--color-momo)',
  sana: 'var(--color-sana)',
  jihyo: 'var(--color-jihyo)',
  mina: 'var(--color-mina)',
  dahyun: 'var(--color-dahyun)',
  chaeyoung: 'var(--color-chaeyoung)',
  tzuyu: 'var(--color-tzuyu)',
};

/**
 * Route paths
 */
export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  MEMBER_CHAT: (member) => `/chat/${member}`,
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'twice_chat_history',
  USER_PREFERENCES: 'twice_user_preferences',
  LAST_MEMBER: 'twice_last_member',
};

/**
 * Chat context untuk pencarian gambar
 */
export const CHAT_CONTEXTS = [
  { id: 'selfie', keywords: ['selfie', 'selca', 'foto', 'wajah', 'foto diri', 'selfie', 'mirror'] },
  { id: 'food', keywords: ['makanan', 'makan', 'food', 'masak', 'memasak', 'lapar', 'snack', 'dessert'] },
  { id: 'performance', keywords: ['perform', 'panggung', 'konser', 'dance', 'menari', 'nyanyi', 'bernyanyi', 'stage'] },
  { id: 'casual', keywords: ['casual', 'santai', 'outfit', 'pakaian', 'baju', 'fashion', 'hangout', 'jalan-jalan'] },
  { id: 'group', keywords: ['grup', 'group', 'member', 'bersama', 'together', 'all', 'semua'] },
];

/**
 * Ukuran maksimum history chat untuk localStorage
 */
export const MAX_CHAT_HISTORY_LENGTH = 30;

/**
 * Polling interval untuk animasi typing
 */
export const TYPING_ANIMATION_INTERVAL = 300; // ms

/**
 * Default user name
 */
export const DEFAULT_USER_NAME = 'ONCE';

/**
 * Maksimum ukuran file untuk upload
 */
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
