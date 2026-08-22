-- Zach's Career Studio database schema for Supabase
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Training examples: uploaded .docx files used to teach the AI formatting style
create table if not exists training_examples (
  id uuid primary key,
  filename text not null,
  uploaded_at timestamptz not null default now(),
  extracted_text text not null default '',
  sections jsonb not null default '[]'
);

-- Generated resumes: AI-generated resume data with admin review workflow
create table if not exists resumes (
  id uuid primary key,
  intake_data jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied', 'edited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  admin_notes text not null default '',
  content jsonb not null
);

-- Storage bucket for .docx files (training uploads + generated resumes)
-- Run this AFTER creating the tables above:
insert into storage.buckets (id, name, public)
values ('docx-files', 'docx-files', false)
on conflict (id) do nothing;

-- Allow authenticated (service-role) access to the bucket.
-- Since all access goes through the service-role key in API routes,
-- no RLS policies are needed on tables or storage for this app.
