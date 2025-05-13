/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nayeon: '#A2D4F2',  // Sky Blue
        jeongyeon: '#9ACD32', // Yellow-Green
        momo: '#FFC0CB',    // Pink
        sana: '#C8A2C8',    // Light Purple
        jihyo: '#FFA07A',   // Light Salmon
        mina: '#98FB98',    // Pale Green
        dahyun: '#F0E68C',  // Khaki
        chaeyoung: '#FF8C00', // Dark Orange
        tzuyu: '#87CEEB',   // Sky Blue
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        twice: {
          "primary": "#F06292",
          "secondary": "#C8A2C8",
          "accent": "#F8BBD0",
          "neutral": "#333333",
          "base-100": "#FFFFFF",
        },
      },
      "light",
      "dark",
    ],
  },
} 