/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          600: "var(--primary-600)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        twice: {
          "primary": "#E91E63", // Darker pink for better contrast
          "secondary": "#9C27B0", // Darker purple for better contrast
          "accent": "#F50057",
          "neutral": "#333333",
          "base-100": "#FFFFFF",
        },
      },
      "light",
      "dark",
    ],
  },
} 