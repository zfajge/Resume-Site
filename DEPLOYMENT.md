# Free Cloud Deployment Guide

Host Zach's Career Studio for **$0/month** using Vercel + Supabase + Gemini.

| Service | What it does | Free tier |
|---------|-------------|-----------|
| **Vercel** | Hosts the Next.js app | 100 GB bandwidth, serverless functions, auto-deploy from GitHub |
| **Supabase** | PostgreSQL database + file storage | 500 MB database, 1 GB file storage, unlimited API requests |
| **Gemini API** | AI resume generation | 15 requests/minute, no credit card required |

---

## Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New Project** → pick a name and region → set a database password → click **Create**.
3. Wait ~1 minute for provisioning.

### Run the database schema

4. In your Supabase dashboard, go to **SQL Editor** (left sidebar).
5. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
6. You should see the `training_examples` table, `resumes` table, and `docx-files` storage bucket created.

### Get your keys

7. Go to **Settings → API** in the Supabase dashboard.
8. Copy:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (under "Project API keys") → this is `SUPABASE_SERVICE_ROLE_KEY`

> **Important**: Use the `service_role` key, not the `anon` key. The service role key bypasses Row Level Security and is only used server-side in API routes.

---

## Step 2: Get a Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Click **Create API key** → select or create a Google Cloud project.
3. Copy the key → this is `GEMINI_API_KEY`.

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub (free).
2. Click **Add New → Project** → import your GitHub repository.
3. On the configuration screen, add these **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `ADMIN_PASSWORD` | Choose a strong password for the admin panel |
   | `GEMINI_API_KEY` | Your Gemini API key from Step 2 |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL from Step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key from Step 1 |

4. Click **Deploy**. Vercel auto-detects Next.js and builds it.
5. Your site is live at `https://your-project.vercel.app`.

---

## Step 4: Set up a custom domain (optional)

1. In Vercel, go to your project → **Settings → Domains**.
2. Add your domain (e.g., `zfresumes.com`).
3. Follow Vercel's instructions to update your DNS records.

---

## How it works

```
Client (browser)
  ↓
Vercel (Next.js serverless functions)
  ↓                    ↓
Supabase DB          Supabase Storage
(resumes, training)  (.docx files)
  ↓
Gemini API
(AI resume generation)
```

- The **marketing site** (`/`) is statically generated — loads instantly.
- **API routes** (`/api/*`) run as serverless functions on Vercel.
- **Resume data** and **training examples** are stored in Supabase PostgreSQL.
- **DOCX files** (uploaded training docs + generated resumes) are stored in Supabase Storage.
- **AI generation** calls the Gemini API (free tier: 15 req/min).
- **Admin auth** uses a simple password stored in the `ADMIN_PASSWORD` env var.

---

## Local development

```bash
# Copy the example env file and fill in your values
cp .env.example .env.local

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
