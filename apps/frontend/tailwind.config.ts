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
        primary: 'var(--color-primary-500, #0f172a)',
        surface: 'var(--color-surface, #ffffff)',
        bodyText: 'var(--color-text, #1e293b)',
        ink: {
          DEFAULT: 'rgb(var(--color-ink-rgb, 10 11 15) / <alpha-value>)',
          elevated: 'rgb(var(--color-ink-elevated-rgb, 19 21 27) / <alpha-value>)',
          border: 'rgb(var(--color-ink-border-rgb, 36 39 47) / <alpha-value>)',
          100: 'var(--color-text-primary, #f2ede3)',
          400: 'var(--color-text-secondary, #a39c8e)',
        },
        gold: 'rgb(var(--color-gold-rgb, 201 162 77) / <alpha-value>)',
        accentBlue: 'rgb(var(--color-accent-blue-rgb, 111 155 216) / <alpha-value>)',
        parchment: 'var(--color-parchment, #f4ede0)',
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
