/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{vue,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  purge: [
    "./components/**/*.{vue,js}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  daisyui: {
    styled: true,
    themes: ["night"],
  },
};
