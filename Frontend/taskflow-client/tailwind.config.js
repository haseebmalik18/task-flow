/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // Royal Blue
        secondary: "#3b82f6", // Lighter Blue
        accent: "#0284c7", // Sky Blue
        background: "#f8fafc", // Light Gray
        textColor: "#1e293b", // Dark Blue Gray
        error: "#ef4444", // Red
        success: "#22c55e", // Green
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
