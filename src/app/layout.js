import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <title>TWICE AI Chat</title>
        <meta name="description" content="Chat with TWICE members powered by AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };