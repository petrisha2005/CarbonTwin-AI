import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: "#071A12",
          900: "#0B0F0E",
          800: "#10231B"
        },
        neon: {
          green: "#22C55E",
          cyan: "#06B6D4"
        }
      },
      boxShadow: {
        glow: "0 0 35px rgba(34,197,94,0.24)"
      }
    }
  },
  plugins: []
} satisfies Config;
