import { NextResponse } from "next/server"
import { searchImages } from "@/lib/google-search"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const images = await searchImages(query)

    if (!images) {
      return NextResponse.json({ error: "No images found" }, { status: 404 })
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error in images API:", error)
    return NextResponse.json({ error: "Failed to search for images" }, { status: 500 })
  }
}