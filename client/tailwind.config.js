/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: { DEFAULT: "#1ed760", dark: "#1aa34a", light: "#5cf08a" },
        accent: { DEFAULT: "#8b5cf6", dark: "#6d3fe0" },
        ink: {
          950: "#08080b",
          900: "#0d0d12",
          850: "#121218",
          800: "#17171f",
          750: "#1d1d27",
          700: "#26262f",
          600: "#34343f",
          500: "#4a4a57",
        },
        "app-black": "#0d0d12",
        "card-color": "#17171f",
      },
      height: { "1/10": "10%", "9/10": "90%" },
      screens: { xs: "420px" },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-in": "fade-in .35s ease-out",
        "scale-in": "scale-in .2s ease-out",
        "spin-slow": "spin-slow 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};
