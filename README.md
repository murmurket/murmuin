# 🌿 Murmuin

A Next.js 14 app with Supabase integration for emotion tracking and user profile management. Built with App Router, server actions, and clean modular architecture.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Auth & DB**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **State & Logic**: React Hooks, Server Actions
- **API Routes**: File-based API (e.g. `/api/update-profile`)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── initialize-profile/route.ts   # Create user profile on first login
│   │   ├── update-profile/route.ts       # Update user profile info
│   │   └── check-username/route.ts       # Check if username is taken
│   ├── emotion/                          # Emotion recording page
│   ├── emotion-history/                  # Emotion history view
│   ├── routine/                          # Routine suggestions (planned)
│   ├── profile/                          # Profile page
│   ├── login/                            # Supabase login page
│   ├── callback/                         # Supabase auth callback
│   ├── layout.tsx, page.tsx              # Global layout
│   └── globals.css
│
├── components/
│   ├── emotion/EmotionHistoryClient.tsx
│   ├── history/HistoryClient.tsx
│   └── profile/
│       ├── LogoutButton.tsx
│       └── ProfileClient.tsx            # Realtime editable profile form
│
├── lib/
│   ├── supabase.ts                       # Supabase client for client-side
│   ├── supabaseClient.ts                 # Supabase client for server-side
│   ├── supabase-browser.ts               # Legacy browser client (optional)
│   ├── gpt.ts                            # OpenAI integration (future use)
│   ├── utils.ts                          # Utility functions
│   ├── withAuth.ts                       # Route-level auth guard
│   └── middleware.ts                     # Middleware for auth redirection
│
├── actions/                              # Server actions (optional / WIP)
```

---

## ✅ Features

- 🔐 Authenticated routes with Supabase
- 👤 User profile creation & editing (`display_name`, `username`, etc.)
- 🧠 Emotion log tracking (Supabase `emotion_logs`)
- 🌎 Auto timezone detection on login
- 🔍 Real-time username validation (with debounce)
- 🎨 Clean client/server separation

---

## 🔐 RLS (Row Level Security)

Enabled for:

- `users`: access only own profile
- `emotion_logs`: only access own logs
- `routine_logs`: same as above
- `routine`: readable public

Supabase Service Role is used only in backend route handlers (`/api/*`) to bypass RLS safely.

---

## 🧠 Database Schema Overview

The application uses Supabase (PostgreSQL) with RLS enabled.
Data is structured into four main entities:

### 1. `users`
- Stores extended profile info
- Linked to Supabase `auth.users`

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  display_name text,
  avatar_url text,
  role text,
  plan text,
  timezone text,
  username text unique
);

---

### 2. `emotion_logs`
- Records user-submitted emotional entries

create table public.emotion_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_text text,
  main_emotion text,
  mood_tags text[],
  gpt_comment text,
  recommended_routine text,         -- human-friendly slug (legacy/backward compatibility)
  recommended_routine_uuid uuid references public.routines(id)
    on update cascade on delete restrict,
  created_at timestamptz default now()
);

create index if not exists emotion_logs_user_created_idx
  on public.emotion_logs(user_id, created_at desc);

---

### 3. `routines`
- Predefined self-care routines recommended via GPT

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  mood_tags text[],
  steps jsonb,                     -- sequence of steps
  description text,
  animation_url text,
  duration_min int,
  slug text not null unique,        -- canonical slug for URLs
  constraint routines_slug_format_chk check (slug ~ '^[a-z0-9_]+$')
);

create index if not exists routines_mood_tags_gin
  on public.routines using gin (mood_tags);

---

### 4. `routine_logs`
- Records when user completes a routine

create table public.routine_logs (
  id bigserial primary key,
  routine_uuid uuid not null references public.routines(id)
    on update cascade on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  feedback text
);

create index if not exists routine_logs_user_created_idx
  on public.routine_logs(user_id, created_at desc);

---

📌 **Row Level Security (RLS)** is enabled on all tables.  
Each user only has access to their own records.  
Supabase Service Role Key is used in server-side API routes for secure elevated access (`/api/*`).

---

## 🚀 Getting Started

1. Clone this repo
2. Setup your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Run locally:

```bash
npm install
npm run dev
```

---

## 🔄 Future Roadmap

- [ ] Public user profiles (`/u/:username`)
- [ ] Custom routine generator via GPT
- [ ] Streaks & emotion-based progress tracking
- [ ] Realtime emotion feed
- [ ] i18n + mobile-first UX

---

## 👩‍💻 Author

Made with ❤️ by [Mur Mur](https://hazle.netlify.app)

---