/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: "#1072EA", dark: "#0B5BC4", light: "#E8F1FD" },
        navy:      { DEFAULT: "#05305C", dark: "#021B36", mid: "#0A3D6E" },
        gold:      { DEFAULT: "#F8DF20", dark: "#D4BB00", light: "#FEFAE0" },
        success:   { DEFAULT: "#118D45", light: "#E8F7EE" },
        error:     { DEFAULT: "#E02E5B", light: "#FCEEF3" },
        warning:   { DEFAULT: "#F59E0B", light: "#FFFBEB" },
        background: "#F7F9FC",
        surface:   "#FFFFFF",
        border:    "#E2E8F0",
      },
    },
  },
  plugins: [],
};
