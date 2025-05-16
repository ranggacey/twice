"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import {
  ArrowLeft,
  MoreVertical,
  Search,
  Phone,
  Video,
  Paperclip,
  Mic,
  Send,
  Smile,
  Camera,
  Trash2,
  Check,
  CheckCheck,
  ImageIcon,
  Loader2,
} from "lucide-react"
import { generateChatResponse } from "@/lib/ai"
import { getMemberPersonality } from "@/lib/member-data"
import { useMobile } from "@/hooks/use-mobile"
import { takeScreenshot } from "@/lib/screenshot"

export default function ChatPage({ params }) {
  const unwrappedParams = use(params);
  const memberId = unwrappedParams.memberId;
  const router = useRouter()
  const isMobile = useMobile()
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [member, setMember] = useState({
    id: memberId,
    name: memberId.charAt(0).toUpperCase() + memberId.slice(1),
    relationshipType: "fan",
    themeColor: "from-teal-400 to-emerald-500",
    bgColor: "bg-emerald-50",
  })
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [isSearchingImage, setIsSearchingImage] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isScreenshotMode, setIsScreenshotMode] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Load member data and chat history
  useEffect(() => {
    const memberData = getMemberPersonality(memberId)
    if (memberData) {
      setMember(memberData)
    }

    // Load chat history from localStorage
    const savedMessages = localStorage.getItem(`chat-${memberId}`)
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // If no chat history, add a welcome message
      const initialMessage = {
        id: Date.now(),
        sender: "ai",
        text: memberData.welcomeMessage,
        timestamp: new Date().toISOString(),
      }
      setMessages([initialMessage])
      localStorage.setItem(`chat-${memberId}`, JSON.stringify([initialMessage]))
    }
  }, [memberId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!inputMessage.trim()) return

    // Clear any previous errors
    setError(null)

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toISOString(),
      status: "sent", // sent, delivered, read
    }

    // Update messages with user message
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    localStorage.setItem(`chat-${memberId}`, JSON.stringify(updatedMessages))
    setInputMessage("")

    // Show typing indicator
    setIsTyping(true)
    setIsLoading(true)
    setIsSearchingImage(false)

    // Update status to delivered after a short delay
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg)))
      localStorage.setItem(
        `chat-${memberId}`,
        JSON.stringify(
          updatedMessages.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg)),
        ),
      )
    }, 1000)

    try {
      // Generate AI response
      const aiResponse = await generateChatResponse(inputMessage, messages, member)
      console.log("AI response:", aiResponse)

      // Update status to read
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "read" } : msg)))
      localStorage.setItem(
        `chat-${memberId}`,
        JSON.stringify(updatedMessages.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "read" } : msg))),
      )

      // Ensure we have valid text in the response
      const responseText = aiResponse.text || "Sorry, I couldn't generate a proper response. Let's try again!"

      // Add AI response to messages
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: responseText,
        image: aiResponse.image,
        timestamp: new Date().toISOString(),
      }

      console.log("Final AI message with image:", aiMessage)

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)
      localStorage.setItem(`chat-${memberId}`, JSON.stringify(finalMessages))
    } catch (error) {
      console.error("Error generating response:", error)
      setError(error.message)

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, I couldn't respond right now. Let's talk about something else!",
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
      localStorage.setItem(`chat-${memberId}`, JSON.stringify(finalMessages))
    } finally {
      setIsTyping(false)
      setIsLoading(false)
      setIsSearchingImage(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return format(date, "HH:mm")
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return format(date, "dd/MM/yyyy")
    }
  }

  const clearChat = () => {
    if (confirm("Are you sure you want to clear this chat history?")) {
      localStorage.removeItem(`chat-${memberId}`)

      // Add initial welcome message
      const memberData = getMemberPersonality(memberId)
      const initialMessage = {
        id: Date.now(),
        sender: "ai",
        text: memberData.welcomeMessage,
        timestamp: new Date().toISOString(),
      }

      setMessages([initialMessage])
      localStorage.setItem(`chat-${memberId}`, JSON.stringify([initialMessage]))
      setShowMenu(false)
    }
  }

  // Function to check if a URL is from a blocked domain
  const isBlockedImageDomain = (url) => {
    if (!url) return false

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

    try {
      const urlObj = new URL(url)
      return blockedDomains.some((domain) => urlObj.hostname.includes(domain))
    } catch (e) {
      return false
    }
  }

  const handleImageError = (e) => {
    console.error("Image failed to load:", e.currentTarget.src)
    e.currentTarget.style.display = "none"

    // Show fallback icon
    const fallbackIcon = e.currentTarget.parentNode.querySelector(".image-fallback")
    if (fallbackIcon) {
      fallbackIcon.style.display = "flex"
    }
  }

  const handleScreenshot = async () => {
    setIsScreenshotMode(true)
    setShowMenu(false)

    // Wait for the UI to update
    setTimeout(async () => {
      await takeScreenshot(chatContainerRef, `twice-${member.name}-chat.png`)
      setIsScreenshotMode(false)
    }, 100)
  }

  // Function to render message image with fallback
  const renderMessageImage = (imageUrl) => {
    if (!imageUrl) return null

    // Check if the image is from a blocked domain
    if (isBlockedImageDomain(imageUrl)) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden relative">
          <div className="image-fallback flex h-[200px] w-full bg-gray-200 items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Image couldn't be displayed</p>
              <p className="text-xs text-gray-400">Image from restricted source</p>
            </div>
          </div>
        </div>
      )
    }

    // Use a default TWICE image as fallback
    const fallbackImage = `/images/${memberId}.png`

    return (
      <div className="mt-2 rounded-lg overflow-hidden relative">
        <div className="image-fallback hidden absolute inset-0 bg-gray-200 items-center justify-center">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Image couldn't be displayed</p>
          </div>
        </div>
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt="Shared image"
          width={300}
          height={200}
          className="object-cover w-full rounded-lg"
          onError={(e) => {
            handleImageError(e)
            // Try to set a fallback image
            if (e.currentTarget.parentNode) {
              const imgElement = document.createElement("img")
              imgElement.src = fallbackImage
              imgElement.alt = "Fallback image"
              imgElement.className = "object-cover w-full rounded-lg"
              imgElement.width = 300
              imgElement.height = 200
              e.currentTarget.parentNode.appendChild(imgElement)
            }
          }}
          unoptimized={true}
        />
      </div>
    )
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  // Function to render message status
  const renderMessageStatus = (status) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  // Get emoji list
  const emojis = ["😊", "😂", "❤️", "👍", "🔥", "✨", "🎉", "😍", "🥰", "😘", "🤗", "🙏", "💕", "💯", "🎵", "🎶"]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center p-3 max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center flex-1">
            <div className="relative mr-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20">
                <Image
                  src={`/images/${member.id}.png`}
                  alt={member.name}
                  width={40}
                  height={40}
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement.innerHTML = `<div class="w-10 h-10 rounded-full bg-gradient-to-br ${member.themeColor} flex items-center justify-center text-white font-medium">${member.name[0]}</div>`
                  }}
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white"></div>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{member.name}</h2>
              <p className="text-xs text-gray-600">Online</p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20 animate-in fade-in slide-in-from-top-5 duration-300">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      handleScreenshot()
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 text-gray-700"
                  >
                    <Camera className="h-4 w-4 mr-2.5 text-gray-600" />
                    <span>Take screenshot</span>
                  </button>
                  <button
                    onClick={clearChat}
                    className="flex items-center w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2.5" />
                    <span>Clear chat</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 ${isScreenshotMode ? "screenshot-mode" : ""}`}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Group messages by date */}
          {messages.reduce((groups, message, index) => {
            const messageDate = formatDate(message.timestamp)
            
            // Check if we need a date divider
            if (index === 0 || formatDate(messages[index - 1].timestamp) !== messageDate) {
              groups.push(
                <div key={`date-${message.id}`} className="flex justify-center my-6">
                  <div className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                    {messageDate}
                  </div>
                </div>
              )
            }
            
            // Add the message
            groups.push(
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-primary text-white shadow-md"
                      : "bg-white border border-gray-200 shadow-sm text-gray-800"
                  }`}
                >
                  {message.text}
                  {message.image && renderMessageImage(message.image)}
                  <div
                    className={`text-right mt-1 text-xs ${
                      message.sender === "user" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                    {message.sender === "user" && renderMessageStatus(message.status)}
                  </div>
                </div>
              </div>
            )
            
            return groups
          }, [])}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm my-4">
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white py-3 px-4">
        <form onSubmit={handleSendMessage} className="flex items-center max-w-4xl mx-auto">
          <button
            type="button"
            className="p-2 rounded-full mr-1 text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </button>
          
          <button
            type="button"
            className="p-2 rounded-full mr-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full py-2.5 px-4 rounded-full bg-pink-300 focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`ml-2 p-3 rounded-full focus:outline-none ${
              !inputMessage.trim() || isLoading
                ? "bg-gray-300 text-gray-500"
                : "bg-primary text-white shadow-md hover:opacity-90 transition-opacity"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}