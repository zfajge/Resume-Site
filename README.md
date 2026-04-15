# ZF Resumes Website

A high-end, modern marketing website for **ZF Resumes**, built with:

- Next.js (App Router)
- Tailwind CSS
- Lucide React icons

## Sections Included

- Hero section focused on landing interviews at elite firms
- Services pricing tables:
  - Individual services with regular pricing + 50% student pricing
  - Group workshop packages
- Why Us section (results-driven coaching, 48-72 hour turnaround, personal relationship)
- Multi-step intake form for client details and target roles
- Footer with LinkedIn and contact information
- AI Resume Builder at `/ai-creator`:
  - Multi-step input flow (work history, skills, target job description)
  - Live before-vs-after bullet optimization preview
  - PDF export button for optimized bullets

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm run build` - create production build

## AI Integration Configuration

The AI route is available at `POST /api/ai-resume`.

Set one of these in your environment:

- `OPENAI_API_KEY` (optional `OPENAI_MODEL`, default `gpt-4.1-mini`)
- `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`, default `claude-3-5-sonnet-latest`)

Prompt source files loaded when present:

- `RESUME_STYLE_GUIDE.md`
- `ZF_Resumes_Business_Plan.docx`

If these files or API keys are not present, the app falls back to built-in ZF style logic so the preview still works locally.
