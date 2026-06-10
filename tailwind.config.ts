import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
        "safe-left": "env(safe-area-inset-left, 0px)",
        "safe-right": "env(safe-area-inset-right, 0px)",
      },
      maxWidth: {
        "mobile-xs": "320px",
        "mobile-sm": "375px",
        "mobile-md": "414px",
        "mobile-lg": "480px",
      },
      screens: {
        "xs": "320px",
        "tall": { raw: "(min-height: 700px)" },
        "short": { raw: "(max-height: 640px)" },
        "3xl": "1600px",
      },
      minHeight: {
        "touch": "44px",
        "mobile": "100svh",
        "mobile-dvh": "100dvh",
      },
      touchAction: {
        manipulation: "manipulation",
        pan: "pan-x pan-y",
      },
      fontSize: {
        "mobile-xs": ["11px", { lineHeight: "1.5" }],
        "mobile-sm": ["13px", { lineHeight: "1.5" }],
        "mobile-base": ["16px", { lineHeight: "1.5" }],
        "mobile-lg": ["18px", { lineHeight: "1.5" }],
      },
      boxShadow: {
        "mobile-sm": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "mobile-md": "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
        "mobile-lg": "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)",
        "mobile-card": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
      keyframes: {
        "slide-up-mobile": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down-mobile": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "bounce-tap": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
        },
      },
      animation: {
        "slide-up-mobile": "slide-up-mobile 0.3s ease-out",
        "slide-down-mobile": "slide-down-mobile 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "bounce-tap": "bounce-tap 0.15s ease-in-out",
      },
      transitionDuration: {
        "150": "150ms",
        "250": "250ms",
        "350": "350ms",
      },
      aspectRatio: {
        "product": "3/4",
        "product-wide": "4/3",
      },
      zIndex: {
        "mobile-nav": "40",
        "mobile-overlay": "45",
        "mobile-drawer": "50",
        "mobile-toast": "55",
        "mobile-max": "60",
      },
    },
  },
  plugins: [animate],
};

export default config;
