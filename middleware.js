import { NextResponse } from "next/server"

export function middleware(request) {
  // Add environment variables to client
  const response = NextResponse.next()

  response.headers.set("x-gemini-api-key", process.env.GEMINI_API_KEY || "")

  response.headers.set("x-google-search-api-key", process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || "")

  response.headers.set("x-google-search-engine-id", process.env.GOOGLE_SEARCH_ENGINE_ID || "")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}