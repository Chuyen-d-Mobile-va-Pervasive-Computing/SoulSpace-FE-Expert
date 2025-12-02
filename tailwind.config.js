/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter"], // Regular
        "inter-bold": ["InterBold"], // Bold
        "inter-extrabold": ["InterExtraBold"], // ExtraBold
        "inter-medium": ["InterMedium"], // Medium
      },
    },
  },
  plugins: [],
};
