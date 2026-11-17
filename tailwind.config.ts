import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050608",
        graphite: "#101318",
        carbon: "#161B24",
        cyanGlow: "#00E5FF",
        electricBlue: "#2979FF",
        violetAccent: "#8B5CF6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Sora", "system-ui", "sans-serif"],
        heading: ["Sora", "Space Grotesk", "system-ui", "sans-serif"],
        jakarta: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "chrome-gradient":
          "linear-gradient(135deg, #FFFFFF 0%, #B8C4D4 48%, #5F6E82 100%)",
        "cyber-grid":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
