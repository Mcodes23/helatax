/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
        },
        action: {
          DEFAULT: "#10B981",
          hover: "#059669",
        },
        accent: "#6366F1",
      },
    },
  },
  plugins: [],
};
