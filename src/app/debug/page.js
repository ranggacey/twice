"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export default function DebugPage() {
  const [searchQuery, setSearchQuery] = useState("TWICE Nayeon")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSearchResults([])

    try {
      const response = await fetch(`/api/images?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.images || [])
      } else {
        setError(data.error || "Failed to search for images")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>

        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Test Image Search</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Search
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((image, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={image.link || "/placeholder.svg"}
                        alt={image.title}
                        fill
                        className="object-contain"
                        unoptimized={true}
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.parentElement.innerHTML =
                            '<div class="flex h-full items-center justify-center text-gray-400">Image failed to load</div>'
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs truncate">{image.title}</p>
                      <p className="text-xs text-gray-500 truncate">{image.displayLink}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    </div>
  )
}