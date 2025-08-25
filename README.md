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

Supabase Service Role is used only in backend route handlers (`/api/*`) to bypass RLS safely.

---

## 🧠 Database Schema Overview

The application uses Supabase (PostgreSQL) with RLS enabled.
Data is structured into four main entities:

### 1. `users`
- Stores extended profile info
- Linked to Supabase `auth.users`

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK (auth.users.id) |
| display_name | text | User's display name |
| avatar_url | text | Profile image |
| timezone | text | Auto-detected timezone |
| plan | text | Subscription or usage plan |

---

### 2. `emotion_logs`
- Records user-submitted emotional entries

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to `users.id` |
| input_text | text | Raw emotion input |
| main_emotion | text | Classified main emotion |
| mood_tags | text[] | Extra mood tags |
| gpt_comment | text | GPT-generated feedback |
| recommended_routine | text | Routine ID or title |
| created_at | timestamp | Record timestamp |

---

### 3. `routines`
- Predefined self-care routines recommended via GPT

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| title | text | Routine title |
| mood_tags | text[] | Target moods |
| steps | json | Routine steps |
| animation_url | text | Visual guide (optional) |
| duration_min | int | Estimated duration |

---

### 4. `routine_logs`
- Records when user completes a routine

| Field | Type | Description |
|-------|------|-------------|
| id | int8 | PK |
| routine_id | text | FK to `routines.id` |
| user_id | uuid | FK to `users.id` |
| created_at | timestamptz | Timestamp of completion |
| feedback | text | Optional feedback after routine |

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