import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // WhatsApp-inspired dark theme, reused for the Binance-style trading layout
        appbg: "#0B141A",       // App background
        surface: "#1F2C34",     // Cards / panels / chat bubbles
        surfaceAlt: "#111B21",  // Slightly darker alt surface (headers, nav)
        primary: "#00A884",     // Teal accent - buttons / active states
        secondary: "#25D366",   // Bright green - positive trend
        danger: "#F6465D",      // Red - negative trend
        textPrimary: "#E9EDEF",
        textSecondary: "#8696A0",
        borderc: "#222D34",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.85rem",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
