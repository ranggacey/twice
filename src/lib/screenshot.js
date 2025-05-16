import { toPng } from "html-to-image"

export const takeScreenshot = async (elementRef, filename = "twice-chat-screenshot.png") => {
  if (!elementRef.current) return null

  try {
    // Add a class to the element to style it for screenshot
    elementRef.current.classList.add("taking-screenshot")

    // Wait for any animations to complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    const dataUrl = await toPng(elementRef.current, {
      quality: 0.95,
      backgroundColor: "#ffffff",
    })

    // Remove the screenshot class
    elementRef.current.classList.remove("taking-screenshot")

    // Create a download link
    const link = document.createElement("a")
    link.download = filename
    link.href = dataUrl
    link.click()

    return dataUrl
  } catch (error) {
    console.error("Error taking screenshot:", error)
    elementRef.current.classList.remove("taking-screenshot")
    return null
  }
}
