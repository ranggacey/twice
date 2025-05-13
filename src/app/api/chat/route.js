import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getMemberSystemPrompt, getMemberTemperature } from '@/lib/memberData';
import { API_CONFIG } from '@/lib/constants';

/**
 * API route handler untuk chat dengan member TWICE
 * Menggunakan Gemini API dengan personalisasi berdasarkan member
 */
export async function POST(request) {
  try {
    // Parse request body
    let message, memberId, history;
try {
  const body = await request.json();
  message = body.message;
  memberId = body.memberId;
  history = body.history || [];
} catch (jsonError) {
  console.error('Error parsing JSON:', jsonError);
  return NextResponse.json(
    { error: 'Format JSON tidak valid' },
    { status: 400 }
  );
}
    console.log('Request diterima:', { 
      message, 
      memberId,
      historyLength: history?.length 
    });
    
    if (!memberId || !message) {
      return NextResponse.json(
        { error: 'Member ID dan pesan harus disediakan' },
        { status: 400 }
      );
    }

    // Validasi panjang pesan
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Pesan tidak boleh lebih dari 500 karakter' },
        { status: 400 }
      );
    }
    
    // Dapatkan system prompt dan temperature berdasarkan member
    const systemPrompt = getMemberSystemPrompt(memberId);
    const temperature = getMemberTemperature(memberId);
    
    try {
      // Inisialisasi Gemini API
      if (!API_CONFIG.GEMINI_API_KEY) {
  console.error('API key tidak ditemukan');
  return NextResponse.json(
    { error: 'Konfigurasi API tidak valid' },
    { status: 500 }
  );
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDbkf34IgYYB1drKs_npOjGuBn60VUt3HM');
      
      // Persiapkan prompt untuk AI
      const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;
      
      // Sebagai alternatif untuk model.startChat yang bisa error dengan history
      // kita gunakan generateContent langsung
      if (!message || !memberId) {
  return NextResponse.json(
    { error: 'Pesan atau Member ID tidak boleh kosong' },
    { status: 400 }
  );
}
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 300,
      },
    });
    const result = await chat.sendMessage(fullPrompt);
      
      const response = result.response.text();
      console.log('Response dari AI:', { responseLength: response.length });

      // Deteksi apakah respons perlu menyertakan gambar
      const needsImage = shouldIncludeImage(message, response);

      // Kembalikan respons
      return NextResponse.json({ 
        response, 
        needsImage
      });
    } catch (apiError) {
      console.error('Gemini API error:', {
      message: apiError.message,
      stack: apiError.stack,
      request: { memberId, message }
    });
    return NextResponse.json(
      { 
        error: 'Error interaksi dengan AI', 
        message: apiError.message || 'Gagal mendapatkan respons dari Gemini API',
        details: 'Silakan coba lagi dalam beberapa menit atau hubungi support'
      },
      { status: 500 }
    );
    }
  } catch (error) {
    console.error('Error dalam API chat:', error);
    return NextResponse.json(
      { error: 'Gagal memproses chat', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper function untuk mendeteksi apakah respons sebaiknya menyertakan gambar
 * @param {string} userMessage - Pesan dari pengguna
 * @param {string} modelResponse - Respons dari model
 * @returns {boolean} - True jika respons sebaiknya menyertakan gambar
 */
function shouldIncludeImage(userMessage, modelResponse) {
  // Keywords yang menunjukkan konteks visual
  const imageKeywords = [
    'foto', 'gambar', 'lihat', 'selca', 'selfie', 'tampilan', 'outfit',
    'pakaian', 'penampilan', 'tunjukkan', 'kelihatan', 'cantik', 'style',
    'fashion', 'pose', 'baju', 'kostum', 'cute', 'imut'
  ];

  // Cek apakah respons mengandung trigger kata untuk gambar
  const userWantsImage = imageKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  const modelSuggestsImage = imageKeywords.some(keyword => 
    modelResponse.toLowerCase().includes(keyword)
  );

  // Criteria lain: respons yang sangat pendek mungkin membutuhkan gambar
  const isShortResponse = modelResponse.length < 50;
  
  // Kriteria keseluruhan
  return (userWantsImage || modelSuggestsImage || isShortResponse) &&
    Math.random() < 0.7; // 70% probabilitas untuk menambahkan gambar jika kriteria terpenuhi
}
