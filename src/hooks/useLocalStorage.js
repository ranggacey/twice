'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook untuk menggunakan localStorage
 * Menyediakan kemampuan untuk menyimpan dan mengambil data dari localStorage
 * dengan fitur type safety dan error handling
 *
 * @param {string} key - Kunci untuk menyimpan data di localStorage
 * @param {any} initialValue - Nilai default jika data tidak ditemukan
 * @returns {[any, Function, Function]} - [nilai, setter, remover]
 */
export function useLocalStorage(key, initialValue) {
  // State untuk menyimpan nilai
  const [storedValue, setStoredValue] = useState(initialValue);
  // Flag untuk mengetahui apakah localStorage tersedia
  const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(false);

  // Cek apakah localStorage tersedia saat komponen di-mount
  useEffect(() => {
    try {
      const testKey = '__test_storage__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      setIsLocalStorageAvailable(true);
    } catch (error) {
      console.warn('localStorage tidak tersedia:', error);
      setIsLocalStorageAvailable(false);
    }
  }, []);

  // Inisialisasi nilai dari localStorage saat komponen di-mount
  // Gunakan ref untuk menghindari re-render berulang
  useEffect(() => {
    if (!isLocalStorageAvailable) return;

    try {
      const item = window.localStorage.getItem(key);
      
      // Hanya set nilai jika berbeda dari nilai saat ini untuk mencegah re-render tak perlu
      const parsedItem = item ? JSON.parse(item) : initialValue;
      if (JSON.stringify(parsedItem) !== JSON.stringify(storedValue)) {
        setStoredValue(parsedItem);
      }
    } catch (error) {
      console.warn(`Error membaca dari localStorage dengan key ${key}:`, error);
      setStoredValue(initialValue);
    }
  }, [key, isLocalStorageAvailable]); // Hapus initialValue dari dependencies

  /**
   * Fungsi untuk memperbarui nilai di localStorage
   * @param {any} value - Nilai baru atau fungsi yang mengambil nilai sebelumnya
   */
  const setValue = (value) => {
    try {
      // Izinkan value berupa fungsi seperti setState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Simpan ke state
      setStoredValue(valueToStore);
      
      // Simpan ke localStorage jika tersedia
      if (isLocalStorageAvailable) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error menyimpan ke localStorage dengan key ${key}:`, error);
    }
  };

  /**
   * Fungsi untuk menghapus nilai dari localStorage
   */
  const removeValue = () => {
    try {
      // Hapus dari state
      setStoredValue(initialValue);
      
      // Hapus dari localStorage jika tersedia
      if (isLocalStorageAvailable) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error menghapus dari localStorage dengan key ${key}:`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * Hook untuk chat history
 * @param {string} memberId - ID member TWICE
 * @param {Array} initialHistory - History chat awal
 * @returns {[Array, Function]} - [history, setHistory]
 */
export function useChatHistory(memberId, initialHistory = []) {
  const storageKey = `twice_chat_${memberId}`;
  const [history, setHistory, clearHistory] = useLocalStorage(storageKey, initialHistory);

  /**
   * Menambahkan pesan ke history
   * @param {Object} message - Pesan untuk ditambahkan
   */
  const addMessage = (message) => {
    setHistory(prevHistory => [...prevHistory, message]);
  };

  return {
    history,
    addMessage,
    setHistory,
    clearHistory
  };
}
