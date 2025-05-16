"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Search, Plus, Camera, MoreVertical, Check, CheckCheck } from "lucide-react"
import { format } from "date-fns"
import { getAllMembers } from "@/lib/member-data"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [members, setMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMembers, setFilteredMembers] = useState([])

  const activeMember = searchParams.get("member")

  useEffect(() => {
    // Get all members
    const allMembers = getAllMembers()

    // Add last message and time from localStorage
    const membersWithChat = allMembers.map((member) => {
      const savedMessages = localStorage.getItem(`chat-${member.id}`)
      let lastMessage = null
      let lastMessageTime = null

      if (savedMessages) {
        const messages = JSON.parse(savedMessages)
        if (messages.length > 0) {
          lastMessage = messages[messages.length - 1]
          lastMessageTime = lastMessage.timestamp
        }
      }

      return {
        ...member,
        lastMessage,
        lastMessageTime,
      }
    })

    setMembers(membersWithChat)
    setFilteredMembers(membersWithChat)

    // If a member is selected in the URL, navigate to their chat
    if (activeMember) {
      router.push(`/chat/${activeMember}`)
    }
  }, [activeMember, router])

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members)
    } else {
      const filtered = members.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredMembers(filtered)
    }
  }, [searchQuery, members])

  const formatTime = (timestamp) => {
    if (!timestamp) return ""

    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return format(date, "HH:mm")
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return format(date, "dd/MM/yyyy")
    }
  }

  const truncateText = (text, maxLength = 40) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-4 max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">
            TWICE Chat
          </h1>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Camera className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 sticky top-16 z-10 bg-white border-b border-gray-200">
        <div className="bg-gray-100 rounded-full flex items-center px-4 py-2 max-w-4xl mx-auto">
          <Search className="h-5 w-5 text-gray-600 mr-3" />
          <input
            type="text"
            placeholder="Search members..."
            className="flex-1 py-1 border-none focus:outline-none text-gray-800 bg-transparent placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => router.push(`/chat/${member.id}`)}
            >
              <div className="flex items-center p-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src={`/images/${member.id}.png`}
                      alt={member.name}
                      width={56}
                      height={56}
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallbackDiv = document.createElement("div");
                        fallbackDiv.className = "w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-medium";
                        fallbackDiv.textContent = member.name[0];
                        e.currentTarget.parentElement.appendChild(fallbackDiv);
                      }}
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                </div>

                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    <span className="text-xs text-gray-600">{formatTime(member.lastMessageTime)}</span>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-700 truncate max-w-[70%]">
                      {member.lastMessage ? (
                        member.lastMessage.sender === "user" ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-1">
                              {member.lastMessage.status === "sent" && <Check className="h-3 w-3" />}
                              {member.lastMessage.status === "delivered" && <CheckCheck className="h-3 w-3" />}
                              {member.lastMessage.status === "read" && <CheckCheck className="h-3 w-3 text-blue-500" />}
                            </div>
                            {truncateText(member.lastMessage.text)}
                          </div>
                        ) : (
                          truncateText(member.lastMessage.text)
                        )
                      ) : (
                        <span className="italic text-gray-600">Start chatting</span>
                      )}
                    </div>

                    <div className="flex items-center">
                      {member.relationshipType === "romantic" ? (
                        <div className="bg-pink-500 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                          Romantic
                        </div>
                      ) : (
                        <div className="bg-blue-500 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                          Fan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <Search className="h-6 w-6 text-gray-600" />
              </div>
              <p className="font-medium text-gray-900">No results found</p>
              <p className="text-sm mt-2 text-gray-700">No members found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-primary text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}