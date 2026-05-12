<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This is a single-service Next.js 16.2.3 (App Router) marketing website with no external dependencies (no database, no API routes, no auth, no Docker).

### Commands

See `README.md` for the full list. Key commands:
- `npm run dev` — starts Next.js dev server on port 3000
- `npm run lint` — runs ESLint
- `npm run build` — creates production build

### Notes

- The client intake form at the bottom of the page is client-side only — `submitIntake` sets local React state and does not call any backend API.
- No `.env` file or secrets are required.
- Uses Tailwind CSS 4 via `@tailwindcss/postcss`; styles are in `src/app/globals.css`.
