// This file now just contains a client-side function to call the server API
export async function generateChatResponse(userMessage, chatHistory, member) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        memberId: member.id,
        chatHistory: chatHistory,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate response")
    }

    return await response.json()
  } catch (error) {
    console.error("Error calling chat API:", error)
    throw error
  }
}
