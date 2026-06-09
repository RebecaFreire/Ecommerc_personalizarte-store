/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais sofisticadas
        primary: {
          DEFAULT: "#C9A962", // Dourado sofisticado
          light: "#E0C585",
          dark: "#A68B4F",
          accent: "#D4B86A",
        },
        secondary: {
          DEFAULT: "#8B7355", // Marrom elegante
          light: "#A68B6B",
          dark: "#6B5A42",
        },
        accent: {
          DEFAULT: "#E8D4B8", // Bege suave
          light: "#F5EBE0",
          dark: "#D4C4A8",
        },
        // Cores complementares
        rose: {
          DEFAULT: "#D4A5A5",
          light: "#E8C4C4",
          dark: "#B88888",
        },
        sage: {
          DEFAULT: "#9CAF88",
          light: "#B8C4A8",
          dark: "#7A9A68",
        },
        // Cores neutras
        cream: "#FAF7F2",
        charcoal: "#2C2C2C",
        slate: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#DEE2E6",
          300: "#CED4DA",
          400: "#ADB5BD",
          500: "#6C757D",
          600: "#495057",
          700: "#343A40",
          800: "#212529",
          900: "#1A1A1A",
        },
      },
      fontFamily: {
        cursive: ["'Dancing Script'", "cursive"],
        sans: ["'Poppins'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
