import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/accessibility/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary-500, #96721e)',
        surface: 'var(--color-surface, #fbf8f2)',
        bodyText: 'var(--color-text, #1c1712)',
        ink: {
          DEFAULT: 'rgb(var(--color-ink-rgb, 251 248 242) / <alpha-value>)',
          elevated: 'rgb(var(--color-ink-elevated-rgb, 255 255 253) / <alpha-value>)',
          raised: 'rgb(var(--color-ink-raised-rgb, 255 255 255) / <alpha-value>)',
          border: 'rgb(var(--color-ink-border-rgb, 224 214 196) / <alpha-value>)',
          100: 'var(--color-text-primary, #1c1712)',
          400: 'var(--color-text-secondary, #5a4d3d)',
        },
        gold: {
          DEFAULT: 'rgb(var(--color-gold-rgb, 199 160 76) / <alpha-value>)',
          bright: 'rgb(var(--color-gold-bright-rgb, 224 186 105) / <alpha-value>)',
          /* AAA-safe (7:1) darkened gold for use as running TEXT color, e.g. links. */
          text: 'rgb(var(--color-gold-text-rgb, 95 66 15) / <alpha-value>)',
        },
        /* Fixed dark tone for text/icons sitting on top of gold-filled elements
           (logo badge, primary buttons) — stays dark across every theme. */
        onGold: 'rgb(var(--color-on-gold-rgb, 18 16 15) / <alpha-value>)',
        accentBlue: 'rgb(var(--color-accent-blue-rgb, 33 87 158) / <alpha-value>)',
        parchment: 'var(--color-parchment, #f4ede0)',
        successText: 'rgb(var(--color-success-text-rgb, 15 95 55) / <alpha-value>)',
        errorText: 'rgb(var(--color-error-text-rgb, 150 20 20) / <alpha-value>)',
        warningText: 'rgb(var(--color-warning-text-rgb, 120 68 5) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-noto-sans)', 'var(--font-noto-devanagari)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        md: 'var(--radius-md, 0.5rem)',
        lg: 'var(--radius-lg, 0.75rem)',
      },
    },
  },
  plugins: [],
};
export default config;
