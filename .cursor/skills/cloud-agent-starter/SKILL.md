# Cloud Agent Starter Skill: ZF Resumes

Use this skill as your first-stop runbook when working in this repo from Cursor Cloud.

## 1) First 5 minutes (practical setup)

1. Install dependencies:
   - `npm ci`
2. If you will touch Next.js APIs or routing behavior, read the relevant guide in:
   - `node_modules/next/dist/docs/`
3. Start the app:
   - `npm run dev -- --hostname 0.0.0.0 --port 3000`
4. Open `http://localhost:3000`.
5. Confirm the landing page renders and the **Start Your Intake** button is visible.

### Login/auth expectations

- There is no user auth flow in the current app (no sign-in page, no session gate).
- `gh` is already authenticated in Cloud environments for read-only GitHub inspection.

## 2) Environment variables and feature flags

Current state:

- No runtime env/feature flags are used in the app code today.
- Verify quickly with:
  - `rg "process\\.env|NEXT_PUBLIC_" app next.config.ts`

When adding or mocking a flag for testing:

1. Create/update `.env.local` (do not commit secrets):
   - `NEXT_PUBLIC_EXPERIMENT_NAME=1`
2. Read the flag in code via `process.env.NEXT_PUBLIC_EXPERIMENT_NAME`.
3. Restart `npm run dev` after env changes.
4. Test both states (`1` and unset/`0`) before shipping.

## 3) Codebase areas and concrete test workflows

This project is a single Next.js App Router app. Most edits are in `app/page.tsx`.

### Area A: App shell and metadata (`app/layout.tsx`)

Use when editing fonts, global wrapper structure, or metadata behavior.

Test workflow:

1. `npm run lint`
2. `npm run build`
3. Manually open the page and confirm it renders without hydration/runtime errors.

### Area B: Marketing sections and pricing content (`app/page.tsx`)

Use when changing hero copy, service/workshop tables, or footer content.

Test workflow:

1. Run `npm run dev -- --hostname 0.0.0.0 --port 3000`.
2. Verify hero headline + CTA buttons.
3. Verify both pricing tables render all rows and remain horizontally scrollable on narrow widths.
4. Verify footer links still open correctly (`mailto:`, `tel:`, LinkedIn).

### Area C: Intake form logic and validation (`app/page.tsx`)

Use when changing form fields, step logic, validation, or submit states.

Test workflow:

1. On Step 1, click **Continue** with empty required fields and confirm error appears.
2. Fill required fields and proceed to Step 2.
3. Repeat validation check on Step 2 and Step 3 required fields.
4. On Step 4, submit and confirm **Intake Submitted** success state appears.
5. Navigate back between steps and confirm previously entered values persist.

### Area D: Styling/theme and static assets (`app/globals.css`, `public/*`)

Use when changing colors, spacing, typography, or replacing icons/images.

Test workflow:

1. Run `npm run dev`.
2. Check for visual regressions in hero, pricing cards, form fields, and footer.
3. Confirm smooth anchor scrolling still works for `#services` and `#intake-form`.
4. If you changed assets, load the page and ensure there are no 404s for files under `public/`.

## 4) Fast command checklist

- Install deps: `npm ci`
- Dev server: `npm run dev -- --hostname 0.0.0.0 --port 3000`
- Lint: `npm run lint`
- Production build check: `npm run build`
- Search for env flags: `rg "process\\.env|NEXT_PUBLIC_" app next.config.ts`

## 5) How to keep this skill updated

Whenever you discover a new testing trick or runbook fix:

1. Add it under the relevant area above (A/B/C/D), not in a random notes block.
2. Include:
   - Trigger: what kind of change this applies to
   - Command/steps: exact commands or clicks
   - Expected signal: what proves success
3. If a workaround is temporary, mark it with `TEMP:` and add removal criteria.
4. Keep this file minimal; remove stale steps as the codebase evolves.
