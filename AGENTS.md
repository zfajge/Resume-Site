<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- **Single-service app**: Only the Next.js dev server is needed — no databases, Docker, or external APIs.
- **Commands**: See `package.json` scripts and `README.md`. Key ones: `npm run dev` (dev server on port 3000), `npm run lint` (ESLint), `npm run build` (production build).
- **Next.js 16.2.3**: This is a recent major version with potential breaking changes vs training data. Always consult `node_modules/next/dist/docs/` before writing code, per the rules above.
- **Tailwind CSS v4**: Uses `@tailwindcss/postcss` plugin — no `tailwind.config.js` file; theme is configured in `app/globals.css`.
- **No env vars or secrets required**: The app has no external dependencies or API keys.
