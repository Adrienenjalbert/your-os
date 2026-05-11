// Tailwind CSS v4 uses a single PostCSS plugin entry. No `@tailwindcss/postcss`
// config object needed — the engine reads `globals.css` directives.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
