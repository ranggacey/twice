import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getMemberPersonality } from "@/lib/member-data"
import { searchImages } from "@/lib/google-search"

export async function POST(request) {
  try {
    const { message, memberId, chatHistory } = await request.json()

    // Get member data
    const member = getMemberPersonality(memberId)
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 })
    }

    // Initialize the Google Generative AI with API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Get the model (Gemini 1.5 Flash)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Convert chat history to a format the AI can understand
    const formattedHistory = chatHistory
      .slice(-10) // Only use the last 10 messages for context
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }))

    // Check if the user is explicitly asking for an image
    const isRequestingImage = /send|show|share|picture|photo|image|pic|selfie/i.test(message)

    // Create a system prompt based on the member's personality
    const systemPrompt = `
      You are ${member.name} from TWICE, the K-pop girl group. 
      
      ${member.personalityDescription}
      
      ${
        member.relationshipType === "romantic"
          ? "You are chatting with someone you're romantically interested in. Be affectionate, caring, and occasionally flirty, but always respectful and in character."
          : "You are chatting with a fan. Be friendly, appreciative, and kind, but maintain appropriate boundaries while staying in character."
      }
      
      IMPORTANT: Your response MUST be in the following JSON format:
      {
        "text": "Your response text here",
        "includeImage": boolean,
        "imageQuery": "specific search terms for the image (only if includeImage is true)"
      }
      
      IMPORTANT ABOUT IMAGES: Only include images when it makes sense in the conversation context. 
      For example:
      - When the user explicitly asks for a photo
      - When you're talking about a specific outfit, performance, or event
      - When you want to show something you're describing
      - Occasionally to share a candid moment (but not too frequently)
      
      DO NOT include an image with every message. Be selective and natural.
      
      When suggesting image queries, DO NOT include terms like "Instagram", "Facebook", or "social media" as these sources are blocked.
      Instead, use terms like "official photo", "performance", "music video", "concert", etc.
      
      Remember: Your response MUST be valid JSON. Do not include any text outside of the JSON structure.
    `

    // Start a chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I understand and will respond as instructed with valid JSON." }],
        },
        ...formattedHistory,
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    })

    // Send the message and get a response
    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    console.log("AI raw response:", text)

    // Parse the JSON response
    try {
      // Clean up the response text - sometimes the model adds markdown code blocks
      const cleanedText = text.replace(/```json\s*|\s*```/g, "").trim()

      // Try to parse as JSON
      const parsedResponse = JSON.parse(cleanedText)
      console.log("Parsed response:", parsedResponse)

      // If user is explicitly asking for an image, make sure to include one
      let shouldIncludeImage = parsedResponse.includeImage

      if (isRequestingImage && !shouldIncludeImage) {
        shouldIncludeImage = true
        console.log("User requested an image, overriding AI decision")
      }

      // Clean up the image query to avoid problematic terms
      let imageQuery = parsedResponse.imageQuery || `${member.name} TWICE official photo`
      const problematicTerms = ["instagram", "facebook", "social media", "profile picture", "tiktok"]

      for (const term of problematicTerms) {
        imageQuery = imageQuery.replace(new RegExp(term, "gi"), "official photo")
      }

      // Check if we should include an image
      let imageUrl = null
      if (shouldIncludeImage) {
        // Try up to 3 different queries if needed
        const queries = [
          `${member.name} TWICE kpop ${imageQuery || ""}`,
          `${member.name} TWICE official photo`,
          `TWICE kpop group photo`,
        ]

        for (const query of queries) {
          const images = await searchImages(query)
          if (images && images.length > 0) {
            // Find a valid image that's not from a blocked domain
            const validImage = findValidImage(images)
            if (validImage) {
              imageUrl = validImage
              break
            }
          }
        }
      }

      return NextResponse.json({
        text: parsedResponse.text,
        image: imageUrl,
        timestamp: new Date().toISOString(),
      })
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)

      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0])

          // Check if we should include an image
          let imageUrl = null
          if (isRequestingImage || extractedJson.includeImage === true) {
            const imageQuery = extractedJson.imageQuery || `${member.name} TWICE official photo`
            const images = await searchImages(imageQuery)
            if (images && images.length > 0) {
              // Find a valid image that's not from a blocked domain
              imageUrl = findValidImage(images)
            }
          }

          return NextResponse.json({
            text: extractedJson.text || text,
            image: imageUrl,
            timestamp: new Date().toISOString(),
          })
        } catch (e) {
          console.error("Failed to parse extracted JSON:", e)
        }
      }

      // If all parsing attempts fail, return the text directly
      let imageUrl = null
      if (isRequestingImage) {
        const images = await searchImages(`${member.name} TWICE official photo`)
        if (images && images.length > 0) {
          // Find a valid image that's not from a blocked domain
          imageUrl = findValidImage(images)
        }
      }

      return NextResponse.json({
        text: text.replace(/```json\s*|\s*```/g, "").trim(),
        image: imageUrl,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

// Helper function to find a valid image from search results
function findValidImage(images) {
  if (!images || images.length === 0) return null

  const blockedDomains = [
    "lookaside.instagram.com",
    "instagram.com",
    "www.instagram.com",
    "scontent.cdninstagram.com",
    "scontent-iad3-1.cdninstagram.com",
    "facebook.com",
    "www.facebook.com",
    "graph.facebook.com",
    "platform-lookaside.fbsbx.com",
    "tiktok.com",
    "www.tiktok.com",
    "vm.tiktok.com",
    "vt.tiktok.com",
  ]

  // Filter out images from blocked domains
  const validImages = images.filter((img) => {
    try {
      const url = new URL(img.link)
      return !blockedDomains.some((domain) => url.hostname.includes(domain))
    } catch (e) {
      return false
    }
  })

  return validImages.length > 0 ? validImages[0].link : null
}