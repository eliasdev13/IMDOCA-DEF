// tailwind.config.js para Tailwind v4
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },

      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },

        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(30px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },

      animation: {
        "fade-in": "fade-in 1.3s ease forwards",
        "fade-in-up": "fade-in-up 1s ease forwards",
      },
    },
  },

  plugins: [],
};
