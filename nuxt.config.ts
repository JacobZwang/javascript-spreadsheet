import { defineNuxtConfig } from "nuxt/config";
import dotenv from "dotenv";

dotenv.config();

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ["@pinia/nuxt"],
  build: {
    postcss: {
      postcssOptions: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    },
  },
  runtimeConfig: {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    mongoUrl: "mongodb://root:password@localhost:27017/",
  },
  nitro: {
    plugins: ["~/server/index.ts"],
  },
});
