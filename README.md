# Creatorwood

A marketplace for hiring AI creators. Clients browse portfolios, send connection requests, chat in real time, and leave reviews after a project wraps.

Built with Next.js 16 (App Router), React 19, Supabase, TypeScript, Tailwind CSS v4, shadcn/ui, and Framer Motion.

---

## What it does

- **Discover page** — browse creators by role, hourly rate, or free-text search. Cards cycle through portfolio thumbnails on hover (Dribbble-style).
- **Profile pages** — full-bleed cinematic hero using the creator's featured work, portfolio gallery with lightbox, ratings, reviews, and a "Request Connection" CTA.
- **Connection flow** — a client pitches a creator through a modal. The creator accepts or declines from their inbox. Both parties can chat in real time (Supabase Realtime + typing indicators + notification sounds) and mark the project as completed.
- **Reviews** — after completion, either side can leave a star rating and comment. Ratings aggregate into an average shown on the profile and discover cards.
- **Saved creators** — heart any creator to bookmark them. Saved list lives at `/saved`.
- **Inbox badge** — unread message count in the navbar, updated live via Realtime.
- **Profile settings** — avatar upload (Supabase Storage), display name, bio, roles, hourly rate, discoverability toggle. Portfolio manager supports image uploads, YouTube/Vimeo embeds, and external links with drag-to-reorder.
- **Onboarding** — new signups are redirected to `/settings?onboarding=true` until they complete their profile. Handled in middleware.
- **Presence** — green dot on cards and profiles shows who's online right now (Supabase Presence).
- **Dark/light mode** — via `next-themes`, defaults to dark.

## Data model

Six tables, one view:

| Table | Purpose |
|---|---|
| `profiles` | display name, avatar, bio, roles, hourly rate, discoverability flag |
| `connections` | client→talent relationship with status (pending/active/declined/completed), pitch, budget, read timestamps |
| `messages` | chat messages tied to a connection |
| `reviews` | 1–5 star rating + optional comment, one per reviewer per connection |
| `portfolio_items` | images, video embeds, external links — each with a thumbnail and sort order |
| `saved_creators` | user↔creator favorites |
| `profile_ratings` (view) | materialized avg rating + count per profile |

RLS is enabled on every table. Policies enforce that users can only read/write their own data where appropriate, and portfolio items + profiles are publicly readable.

## Project structure

```
app/
  actions/          Server Actions (auth, profile, portfolio, connection, inbox, review, saved)
  discover/         Browse + filter creators
  inbox/            Connection list + per-connection chat room
  login/            Email/password auth
  profile/[id]/     Public creator profile
  saved/            Bookmarked creators
  settings/         Profile form + portfolio manager
components/
  ui/               shadcn/ui primitives
  (everything else) Feature components — Navbar, TalentCard, ChatInterface, etc.
lib/                Utility functions + shared motion constants
utils/supabase/     Client, server, and middleware Supabase helpers
types/              Generated Supabase types
supabase/migrations SQL migrations
middleware.ts       Auth protection + onboarding redirect
```

## Getting started

### Prerequisites

- Node 20+
- A Supabase project (free tier works)

### 1. Clone and install

```bash
git clone <repo-url>
cd creatorwood-marketplace
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com). You'll need the tables that the app expects. The base schema (profiles, connections, messages, reviews) should be created first — those aren't in the migrations folder because they were set up through the Supabase dashboard. The migrations in `supabase/migrations/` add portfolio items, the ratings view, saved creators, and inbox read tracking on top of that base.

You also need two **Storage buckets**:
- `avatars` (public) — for profile photos
- `portfolio` (public) — for portfolio image uploads

Create them in the Supabase dashboard under Storage, and make sure "Public" is enabled for both.

### 3. Environment variables

Copy `.env.local.example` or create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. First user

Sign up at `/login`. You'll be redirected to `/settings` to set up your profile. Flip the "Available for Hire" toggle to make yourself discoverable on the marketplace.

## Architecture notes

- **Server Components by default.** Client components are only used when hooks or browser APIs are needed (chat, filters, presence, animations).
- **Server Actions for all mutations.** No API routes. Every write goes through `app/actions/`.
- **Supabase Realtime** powers three things: live chat messages (`postgres_changes`), typing indicators (`broadcast`), and online presence (`presence`).
- **OKLCH color system** for the design tokens. Brand color is a violet at hue 275, with light/dark variants defined in `globals.css`.
- **Framer Motion** is used sparingly — scroll-triggered fade-ups, card hover interactions, lightbox transitions, chat message animations. Constants are centralized in `lib/motion.ts`.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.1 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS v4, shadcn/ui, Radix primitives |
| Animation | Framer Motion 12 |
| Backend | Supabase (Postgres, Auth, Storage, Realtime) |
| Auth | Supabase Auth via `@supabase/ssr` |
| Fonts | Geist (body), Instrument Serif (display) |
