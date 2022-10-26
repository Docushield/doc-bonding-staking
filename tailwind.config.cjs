/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cursive: ["CURSIVE"],
        cursive: ["DOC"],
        cursive: ["STAKING"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}