/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind scans these files for class names to include in the output
  content: [
    "./src/**/*.{html,ts,css}"
  ],
  theme: {
    extend: {
      // Hexxcell brand colours — extracted from hexxcell.com
      colors: {
        hx: {
          navy:    "#0a0d1a",   // page background
          navy2:   "#0d1426",   // panel background
          panel:   "#0f1a30",   // elevated surfaces
          border:  "#1e3050",   // borders
          border2: "#243858",   // stronger borders
          blue:    "#00a3e0",   // primary accent (electric blue)
          blue2:   "#0077b6",   // secondary accent
          blue3:   "#003f6b",   // deep blue
          text:    "#ffffff",   // primary text
          text2:   "#c8d8e8",   // secondary text
          text3:   "#8ca0b8",   // muted text
          text4:   "#556070",   // very muted
        }
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"]
      },
      keyframes: {
        "msg-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pop": {
          "0%":   { transform: "scale(0)" },
          "70%":  { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" }
        },
        "bounce-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)",    opacity: "0.35" },
          "30%":           { transform: "translateY(-5px)", opacity: "1" }
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.35" }
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(16px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        "msg-in":      "msg-in 0.25s ease-out forwards",
        "fade-up":     "fade-up 0.4s ease-out forwards",
        "pop":         "pop 0.3s ease forwards",
        "bounce-dot":  "bounce-dot 1.2s ease-in-out infinite",
        "bounce-dot2": "bounce-dot 1.2s ease-in-out 0.2s infinite",
        "bounce-dot3": "bounce-dot 1.2s ease-in-out 0.4s infinite",
        "blink":       "blink 2s ease-in-out infinite",
        "slide-up":    "slide-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
      }
    }
  },
  plugins: []
}
