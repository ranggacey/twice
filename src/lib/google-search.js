export async function searchImages(query) {
  try {
    // Gunakan environment variables dari Vercel
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

    if (!apiKey || !searchEngineId) {
      console.error("Missing Google Search API key or Search Engine ID")
      return null
    }

    console.log("Searching for images with query:", query)

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&safe=active&num=10`

    const response = await fetch(url)
    const data = await response.json()

    console.log("Search response status:", response.status)

    if (data.error) {
      console.error("Google Search API error:", data.error)
      return null
    }

    if (data.items && data.items.length > 0) {
      console.log("Found images:", data.items.length)

      // Filter out problematic domains
      const blockedDomains = [
        "instagram.com",
        "lookaside.instagram.com",
        "scontent.cdninstagram.com",
        "facebook.com",
        "platform-lookaside.fbsbx.com",
        "tiktok.com",
        "vm.tiktok.com",
        "vt.tiktok.com",
      ]

      const filteredItems = data.items.filter((item) => {
        try {
          const url = new URL(item.link)
          return !blockedDomains.some((domain) => url.hostname.includes(domain))
        } catch (e) {
          return false
        }
      })

      if (filteredItems.length > 0) {
        console.log("Filtered images:", filteredItems.length)
        console.log("First filtered image URL:", filteredItems[0].link)
        return filteredItems
      }

      // If all images were filtered out, return the original list
      // The calling code will handle the fallback
      return data.items
    }

    console.log("No images found for query:", query)
    return null
  } catch (error) {
    console.error("Error searching for images:", error)
    return null
  }
}
