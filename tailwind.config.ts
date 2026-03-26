/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#050a0e",
          900: "#0a1628",
          800: "#0f2040",
          700: "#162d56",
          600: "#1e3a6e",
        },
        grass: {
          500: "#00c853",
          400: "#00e676",
          300: "#69f0ae",
        },
        amber: {
          500: "#ffa000",
          400: "#ffb300",
          300: "#ffd54f",
        },
        red: {
          600: "#c62828",
          500: "#e53935",
          400: "#ef5350",
        },
        neutral: {
          950: "#080c10",
          900: "#0f1923",
          800: "#161f2c",
          700: "#1e2d3d",
          600: "#2a3f57",
          500: "#3d5a73",
          400: "#5a7a93",
          300: "#8ba5bd",
          200: "#b8cdd9",
          100: "#dce8f0",
          50: "#f0f6fa",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "pitch-gradient":
          "linear-gradient(180deg, #0a1628 0%, #050a0e 100%)",
        "card-gradient":
          "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)",
        "live-gradient":
          "linear-gradient(90deg, #c62828 0%, #e53935 100%)",
        "grass-gradient":
          "linear-gradient(90deg, #00c853 0%, #00e676 100%)",
      },
      animation: {
        "ticker": "ticker 40s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "live-dot": "liveDot 1.5s ease-in-out infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        liveDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(0.8)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      boxShadow: {
        "card": "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.6)",
        "glow-green": "0 0 20px rgba(0, 200, 83, 0.3)",
        "glow-amber": "0 0 20px rgba(255, 160, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
