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
      // fills: {
      //   primary: "rgba(120, 120, 128, 0.2)",
      //   secondary: "rgba(120, 120, 128, 0.16)",
      //   tertiary: "rgba(255, 255, 255, 0.12)",
      //   quaternary: "rgba(255, 255, 255, 0.08)",
      // },
      // labels: {
      //   primary: "rgba(0, 0, 0, 1)",
      //   secondary: "rgba(60, 60, 67, 0.6)",
      //   tertiary: "rgba(60, 60, 67, 0.3)",
      //   quaternary: "rgba(60, 60, 67, 0.18)",
      // },
      // blue: "rgb(0, 122, 255)",
      // grays: {
      //   black: "rgb(0, 0, 0)",
      //   gray: "rgb(108, 108, 112)",
      //   gray2: "rgb(174, 174, 178)",
      //   gray3: "rgb(199, 199, 203)",
      //   gray4: "rgb(209, 209, 213)",
      //   gray5: "rgb(229, 229, 233)",
      //   gray6: "rgb(242, 242, 246)",
      //   white: "rgb(255, 255, 255)",
      // },
      // seperator: {
      //   opaque: "rgb(198, 198, 200)",
      //   nonOpaque: "rgba(60, 60, 67, 0.29)",
      //   menu: "rgba(0, 0, 0, 0.08)",
      // },
    },
  },
  plugins: [],
} satisfies Config;
