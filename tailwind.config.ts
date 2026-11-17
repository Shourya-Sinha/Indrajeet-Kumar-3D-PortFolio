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
        void: "#040508",
        graphite: "#0e121a",
        carbon: "#151b26",
        cyanGlow: "#00E5FF",
        electricBlue: "#2563EB",
        violetAccent: "#9333EA",
        rosePulse: "#F43F5E",
        champagneGold: "#F59E0B",
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
        display: ["Syne", "Orbitron", "system-ui", "sans-serif"],
        cyber: ["Orbitron", "Syne", "system-ui", "sans-serif"],
        heading: ["Syne", "Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        jakarta: ["Outfit", "Plus Jakarta Sans", "system-ui", "sans-serif"],
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
