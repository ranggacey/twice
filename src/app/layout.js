import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Chat with TWICE",
  description: "Chat with your favorite TWICE members using AI",
  keywords: ["TWICE", "chat", "K-pop", "AI", "Next.js", "Gemini", "chatbot"],
  creator: "ONCE Developer",
  openGraph: {
    title: "Chat with TWICE",
    description: "Chat with your favorite TWICE members using AI",
    images: ['/images/tzuyu.png'],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
