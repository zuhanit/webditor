import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      background: {
        primary: "#EFF1F5",
        secondary: "#E6E9EF",
        tertiary: "#DCE0E8",
      },
      surface: {
        primary: "#CCD0DA",
        secondary: "#BCC0CC",
        tertiary: "#ACB0BE",
      },
      overlay: {
        primary: "#9CA0B0",
        secondary: "#8C8FA1",
        tertiary: "#7C7F93",
      },
      status: {
        success: "#40A02B",
        warning: "#DF8E1D",
        error: "#D20F39",
        info: "#04A5E5",
      },
      text: {
        primary: "#4C4F69",
        secondary: "#5C5F77",
        tertiary: "#6C6F85",
        muted: "#8C8FA1",
        label: "#6C6F85",
        link: "#1E66F5",
      },
      transparent: "rgba(0, 0, 0, 0)",
    },
  },
  plugins: [],
} satisfies Config;
