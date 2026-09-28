/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        carbon: "#070707",
        aqua: "#4FC3F7",
        titanium: "#FF9A4D",
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 34px rgba(79, 195, 247, 0.34)",
        orange: "0 0 30px rgba(255, 154, 77, 0.28)",
      },
    },
  },
  plugins: [],
};
