// Tailwind CSS v4 via PostCSS — required because this project builds with
// Webpack (`next dev --webpack` / `next build --webpack`), and the
// @tailwindcss/turbopack plugin only works under Turbopack. Without this,
// `@import "tailwindcss"` in globals.css compiles to nothing and the page
// renders unstyled.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
