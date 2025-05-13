import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/constants';

/**
 * Endpoint untuk mencari gambar berdasarkan member TWICE dan konteks chat
 */
export async function POST(request) {
  try {
    // Validasi API key
    if (!API_CONFIG.GOOGLE_SEARCH_API_KEY || !API_CONFIG.GOOGLE_SEARCH_ENGINE_ID) {
      return NextResponse.json(
        { error: 'API key untuk pencarian gambar tidak ditemukan' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { memberId, context = 'default' } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID harus disediakan' },
        { status: 400 }
      );
    }

    // Buat query pencarian berdasarkan member dan konteks
    const queryTerms = buildSearchQuery(memberId, context);
    
    // URL untuk Google Custom Search API
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', API_CONFIG.GOOGLE_SEARCH_API_KEY);
    searchUrl.searchParams.append('cx', API_CONFIG.GOOGLE_SEARCH_ENGINE_ID);
    searchUrl.searchParams.append('q', queryTerms);
    searchUrl.searchParams.append('searchType', 'image');
    searchUrl.searchParams.append('num', '5');
    searchUrl.searchParams.append('safe', 'active');

    // Lakukan pencarian dengan fetch
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Search API error:', errorData);
      return NextResponse.json(
        { error: 'Gagal melakukan pencarian gambar', details: errorData },
        { status: response.status }
      );
    }

    // Parse hasil pencarian
    const searchData = await response.json();
    
    // Jika tidak ada hasil, kembalikan error
    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada gambar ditemukan' },
        { status: 404 }
      );
    }

    // Pilih salah satu gambar secara acak dari 5 hasil teratas
    const randomIndex = Math.floor(Math.random() * Math.min(5, searchData.items.length));
    const selectedImage = searchData.items[randomIndex];
    
    // Kembalikan hasil pencarian
    return NextResponse.json({
      imageUrl: selectedImage.link,
      thumbnailUrl: selectedImage.image.thumbnailLink,
      imageTitle: selectedImage.title,
      contextUsed: context
    });
  } catch (error) {
    console.error('Error dalam API search-image:', error);
    return NextResponse.json(
      { error: 'Gagal memproses pencarian gambar', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper function untuk membangun query pencarian berdasarkan member dan konteks
 * @param {string} memberId - ID member TWICE
 * @param {string} context - Konteks chat (selfie, performance, dll)
 * @returns {string} - Query pencarian
 */
function buildSearchQuery(memberId, context) {
  // Mapping member name untuk memastikan pencarian yang tepat
  const memberNames = {
    nayeon: 'Im Nayeon TWICE',
    jeongyeon: 'Yoo Jeongyeon TWICE',
    momo: 'Hirai Momo TWICE',
    sana: 'Minatozaki Sana TWICE',
    jihyo: 'Park Jihyo TWICE',
    mina: 'Myoui Mina TWICE',
    dahyun: 'Kim Dahyun TWICE',
    chaeyoung: 'Son Chaeyoung TWICE',
    tzuyu: 'Chou Tzuyu TWICE'
  };

  // Nama member yang akan digunakan untuk pencarian
  const memberName = memberNames[memberId] || `${memberId} TWICE`;
  
  // Tambahkan terms berdasarkan konteks
  let contextTerms = '';
  
  switch (context) {
    case 'selfie':
      contextTerms = 'selfie selca close-up face';
      break;
    case 'performance':
      contextTerms = 'performance stage concert official';
      break;
    case 'food':
      contextTerms = 'eating food mukbang';
      break;
    case 'casual':
      contextTerms = 'casual outfit fashion';
      break;
    case 'group':
      contextTerms = 'with TWICE members group';
      break;
    default:
      contextTerms = 'pretty HD official';
  }
  
  return `${memberName} ${contextTerms}`;
}
