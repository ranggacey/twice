# TWICE Chat App

Aplikasi chat menggunakan AI yang mensimulasikan percakapan dengan anggota TWICE berdasarkan kepribadian mereka yang sebenarnya.

## Fitur

- 💬 Chat dengan anggota TWICE menggunakan Google Gemini API
- 🎨 Personalisasi berdasarkan kepribadian dan traits setiap member
- 🌙 Mode gelap/terang
- 📱 Tampilan responsif untuk semua perangkat
- 🖼️ Respons dengan gambar sesuai konteks pembicaraan
- 💾 Penyimpanan history chat lokal

## Prasyarat

- Node.js 18.0.0 atau lebih tinggi
- NPM atau Yarn

## Instalasi

1. Clone repository ini
```bash
git clone https://github.com/your-username/chat_twice.git
cd chat_twice
```

2. Install dependensi
```bash
npm install
# atau
yarn install
```

3. Buat file `.env.local` di root direktori dan isi dengan API key yang diperlukan:
```
# Gemini API Key - Dapatkan dari https://aistudio.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google Custom Search API - Dapatkan dari https://programmablesearchengine.google.com/
GOOGLE_CUSTOM_SEARCH_API_KEY=YOUR_GOOGLE_SEARCH_API_KEY
GOOGLE_SEARCH_ENGINE_ID=YOUR_SEARCH_ENGINE_ID
```

4. Jalankan aplikasi dalam mode development
```bash
npm run dev
# atau
yarn dev
```

5. Buka [http://localhost:3000](http://localhost:3000) di browser

## Mendapatkan API Key

### Google Gemini API
1. Buka [AI Studio](https://aistudio.google.com/app/apikey)
2. Buat akun atau login dengan akun Google
3. Klik "Get API Key" dan ikuti petunjuknya
4. Salin API key yang dihasilkan ke file `.env.local`

### Google Custom Search API (untuk gambar)
1. Buka [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Buat search engine baru dan batasi pencarian untuk TWICE dan K-pop
3. Salin Search Engine ID
4. Dapatkan API key dari [Google Cloud Console](https://console.cloud.google.com/)

## Teknologi yang Digunakan

- Next.js 15
- Tailwind CSS 4
- Gemini API
- Google Custom Search API
- Zustand (State Management)
- date-fns

## Struktur Proyek

- `/src/app` - Halaman Next.js dengan App Router
- `/src/components` - Komponen React
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utilitas dan konfigurasi
- `/src/store` - Zustand store untuk manajemen state
- `/public/images` - Gambar member TWICE

## Kontribusi

1. Fork repository
2. Buat branch fitur baru (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

## Kontak

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Link Proyek: [https://github.com/your-username/chat_twice](https://github.com/your-username/chat_twice)
#   t w i c e  
 