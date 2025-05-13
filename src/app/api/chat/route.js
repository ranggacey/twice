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
    const { message, memberId, history = [] } = await request.json();
    console.log('Request diterima:', { 
      message, 
      memberId,
      historyLength: history?.length 
    });
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID harus disediakan' },
        { status: 400 }
      );
    }
    
    // Dapatkan system prompt dan temperature berdasarkan member
    const systemPrompt = getMemberSystemPrompt(memberId);
    const temperature = getMemberTemperature(memberId);
    
    try {
      // Inisialisasi Gemini API
      const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_API_KEY);
      
      // Persiapkan prompt untuk AI
      const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;
      
      // Sebagai alternatif untuk model.startChat yang bisa error dengan history
      // kita gunakan generateContent langsung
      const result = await genAI.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: 500,
          topK: 40,
          topP: 0.8,
        },
      });
      
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
      console.error('Gemini API error:', apiError);
      return NextResponse.json(
        { 
          error: 'Error interaksi dengan AI', 
          message: apiError.message || 'Gagal mendapatkan respons dari Gemini API'
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
