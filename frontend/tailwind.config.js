/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./editor.html",
    "./allproduct.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}

