# Creatorwood -- Technical Documentation

Creatorwood is a marketplace for hiring AI creators. Clients browse portfolios, send connection requests, chat in real time, and leave reviews after a project wraps. This document is an exhaustive technical reference covering every feature, route, server action, API endpoint, component, database table, real-time system, and utility in the codebase.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [Authentication and Middleware](#3-authentication-and-middleware)
4. [Routes (Pages)](#4-routes-pages)
5. [API Endpoint](#5-api-endpoint)
6. [Server Actions Reference](#6-server-actions-reference)
7. [Real-Time Systems](#7-real-time-systems)
8. [Components Reference](#8-components-reference)
9. [Utilities](#9-utilities)
10. [Environment Variables](#10-environment-variables)

---

## 1. Architecture Overview

### Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.1 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS v4, shadcn (new-york style), Radix primitives |
| Animation | Framer Motion 12 |
| Backend | Supabase (Postgres, Auth, Storage, Realtime) |
| Auth | Supabase Auth via `@supabase/ssr` (cookie-based SSR sessions) |
| AI | Vercel AI SDK + OpenAI `gpt-4o-mini` |
| Fonts | Geist (body), Geist Mono (code), Instrument Serif (display) |
| Theming | `next-themes` (dark default, system-aware) |
| Toasts | Sonner |
| Icons | Lucide React |

### Server Components vs Client Components

The codebase defaults to React Server Components. The `"use client"` directive is only added when a component needs hooks (`useState`, `useEffect`, `useChat`, etc.), browser APIs, event listeners, or Supabase Realtime subscriptions. Out of 28 feature components, only 3 are server components (`Navbar`, `FeaturedShowcase`, `FeaturedCreators`).

### Server Actions Pattern

All data mutations go through Next.js Server Actions defined in `app/actions/`. There are **zero standard API routes** except for the AI chat streaming endpoint at `app/api/ai-chat/route.ts`. This follows the project's `.cursorrules` convention: "Never use standard API routes unless building webhooks."

### Supabase Client Setup

Three Supabase client factories serve different runtime contexts:

| File | Factory | Context | Auth |
|---|---|---|---|
| `utils/supabase/client.ts` | `createClient()` | Browser (Client Components) | Anon key, cookie-based session |
| `utils/supabase/server.ts` | `createClient()` | Server (Server Components, Server Actions) | Anon key, reads/writes cookies via `next/headers` |
| `utils/supabase/middleware.ts` | `updateSession()` | Next.js middleware | Anon key, refreshes session cookies on every request |

The server client's `setAll` callback has a try-catch because setting cookies from a Server Component is a no-op -- the middleware handles session refresh instead. All data access goes through RLS policies, so no service role key is needed at runtime.

### Project Structure

```
app/
  layout.tsx              Root layout (fonts, ThemeProvider, Navbar, PresenceProvider, Toaster)
  page.tsx                Landing page
  globals.css             OKLCH design tokens, custom animations
  actions/                Server Actions (7 files, 15 functions)
    auth.ts               login, signup, signOut
    profile.ts            updateProfile
    portfolio.ts          addPortfolioItem, removePortfolioItem, reorderPortfolioItems
    connection.ts         requestConnection
    inbox.ts              sendMessage, updateConnectionStatus, cancelConnection, markConnectionRead, getUnreadCount
    review.ts             submitReview
    saved.ts              toggleSaveCreator, getSavedCreatorIds
  api/ai-chat/route.ts   POST -- AI concierge (streaming, gpt-4o-mini)
  discover/              Browse + filter creators
  inbox/                 Connection list + per-connection chat room
  login/                 Email/password auth
  profile/[id]/          Public creator profile
  saved/                 Bookmarked creators
  settings/              Profile form + portfolio manager
components/
  ui/                    17 shadcn/ui primitives (Avatar, Badge, Button, Card, Dialog, etc.)
  (28 feature components)
lib/
  utils.ts               cn(), getInitials()
  motion.ts              Framer Motion presets
  ai-context.ts          buildCreatorContext() for AI chat
utils/supabase/
  client.ts              Browser Supabase client
  server.ts              Server Supabase client
  middleware.ts           Session refresh helper
types/supabase.ts        Auto-generated Supabase Database types
supabase/migrations/     SQL migration files
middleware.ts            Auth protection + onboarding redirect
```

---

## 2. Database Schema

All tables have Row Level Security (RLS) enabled. Policies enforce that users can only read/write their own data where appropriate. Profiles and portfolio items are publicly readable.

### `profiles`

Stores user profile information. Created on signup.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Matches Supabase auth user ID |
| `display_name` | text | Required. Defaults to "New User" on signup |
| `avatar_url` | text | Supabase Storage URL (avatars bucket) |
| `bio` | text | Free-form biography |
| `roles` | text[] | e.g. `["AI Engineer", "Prompt Designer"]` |
| `hourly_rate` | numeric | Dollar amount per hour |
| `is_discoverable` | boolean | Controls visibility on the marketplace |
| `portfolio_urls` | text[] | Legacy field (superseded by `portfolio_items` table) |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

### `connections`

Represents a client-to-talent hiring relationship. Created when a client sends a connection request.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `client_id` | uuid (FK -> profiles) | The hiring party |
| `talent_id` | uuid (FK -> profiles) | The creator |
| `project_title` | text | Name of the project |
| `initial_pitch` | text | Client's pitch message |
| `budget_estimate` | text | Optional budget string |
| `status` | text | `pending` / `active` / `declined` / `completed` |
| `client_last_read_at` | timestamptz | Tracks when the client last viewed the chat |
| `talent_last_read_at` | timestamptz | Tracks when the talent last viewed the chat |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

**Status lifecycle:**

```
pending  -->  active     (talent accepts)
pending  -->  declined   (talent declines)
pending  -->  [deleted]  (client cancels)
active   -->  completed  (either party marks done)
```

### `messages`

Chat messages within a connection thread.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `connection_id` | uuid (FK -> connections) | |
| `sender_id` | uuid (FK -> profiles) | |
| `content` | text | Message body |
| `created_at` | timestamptz | Auto-set |

### `reviews`

Star ratings and comments left after a project is completed.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `connection_id` | uuid (FK -> connections) | One review per connection |
| `reviewer_id` | uuid (FK -> profiles) | The person writing the review |
| `target_id` | uuid (FK -> profiles) | The person being reviewed |
| `rating` | integer | 1--5 |
| `comment` | text | Optional text review |
| `created_at` | timestamptz | Auto-set |

Only the **client** can leave a review, and only after the connection status is `completed`.

### `portfolio_items`

Portfolio pieces displayed on a creator's profile.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `profile_id` | uuid (FK -> profiles) | |
| `type` | text | `image`, `video_embed`, or `link` |
| `url` | text | Storage URL, YouTube/Vimeo embed URL, or external link |
| `thumbnail_url` | text | Auto-generated for videos; same as `url` for images |
| `title` | text | Optional display title |
| `description` | text | Optional description |
| `sort_order` | integer | For drag-to-reorder in the portfolio manager |
| `created_at` | timestamptz | Auto-set |

### `saved_creators`

Bookmarked creator favorites.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK -> profiles) | The user who saved |
| `creator_id` | uuid (FK -> profiles) | The saved creator |
| `created_at` | timestamptz | Auto-set |

Has a `UNIQUE(user_id, creator_id)` constraint.

### `profile_ratings` (VIEW)

Pre-aggregated rating statistics per creator.

| Column | Type | Notes |
|---|---|---|
| `profile_id` | uuid | |
| `avg_rating` | numeric | Rounded to 1 decimal |
| `review_count` | integer | |

### Storage Buckets

| Bucket | Visibility | Purpose |
|---|---|---|
| `avatars` | Public | Profile photos. Path: `{userId}/{timestamp}.{ext}` |
| `portfolio` | Public | Portfolio images. Path: `{userId}/{timestamp}.{ext}` |

---

## 3. Authentication and Middleware

### Auth Method

Email/password authentication via Supabase Auth. Session tokens are stored in cookies and managed by `@supabase/ssr`.

### Login Flow

1. User submits email + password on `/login`.
2. `login()` server action calls `supabase.auth.signInWithPassword()`.
3. On success, queries the `profiles` table for the user's `display_name`.
4. If the profile exists and `display_name !== "New User"`, sets the `cw_profile_complete` cookie (httpOnly, 1-year expiry).
5. Redirects to `/`.
6. On auth failure, redirects to `/login?error=<message>`.

### Signup Flow

1. User submits email + password on `/login` (same page, different button).
2. `signup()` server action calls `supabase.auth.signUp()`.
3. Upserts a `profiles` row with `display_name: "New User"` and `is_discoverable: false`.
4. Redirects to `/settings` (the onboarding page).

### Sign Out Flow

1. `signOut()` server action calls `supabase.auth.signOut()`.
2. Deletes the `cw_profile_complete` cookie.
3. Revalidates the root layout and redirects to `/`.

### The `cw_profile_complete` Cookie

This cookie controls the onboarding redirect. It is:
- **Set** during `login()` (if profile is complete) and `updateProfile()` (if display name is valid).
- **Deleted** during `signOut()`.
- **Checked** in the middleware to decide whether to redirect to `/settings?onboarding=true`.

### Middleware (`middleware.ts`)

Runs on every request (except static assets, images, and Next.js internals). Two behaviors:

**1. Protected route guard:**
Routes starting with `/settings`, `/inbox`, or `/saved` redirect unauthenticated users to `/login`.

**2. Onboarding redirect:**
Authenticated users who lack the `cw_profile_complete` cookie are redirected to `/settings?onboarding=true` -- unless they are already on `/settings` or `/login`.

### Session Refresh (`utils/supabase/middleware.ts`)

The `updateSession()` function is called at the start of every middleware invocation. It creates a Supabase server client that reads cookies from the incoming request, calls `supabase.auth.getUser()` to refresh the session, and writes any updated cookies back to the response. This keeps sessions alive across page loads.

---

## 4. Routes (Pages)

### `GET /` -- Landing Page

**File:** `app/page.tsx` (async Server Component)

**Supabase queries:**
- 6 most recent `portfolio_items` joined with `profiles` (for the hero showcase)
- Up to 8 discoverable `profiles` + their first `portfolio_items` thumbnail (for the featured creators carousel)
- Count of discoverable `profiles` and completed `connections` (for the stats bar)

**Sections rendered:**
1. Hero with gradient background, headline, and CTA buttons to `/discover` and `/login`.
2. `FeaturedShowcase` -- bento grid of portfolio items (hero piece + smaller thumbnails).
3. `FeaturedCreators` -- horizontal snap-scrolling carousel of creator avatar cards.
4. Stats bar with `AnimatedCounter` components showing live creator count, completed projects, and "Direct" tagline.
5. CTA banner driving to `/discover` and `/login`.
6. Footer with copyright.

---

### `GET /discover` -- Browse Creators

**File:** `app/discover/page.tsx` (async Server Component)

**URL search params:**
| Param | Type | Purpose |
|---|---|---|
| `roles` | comma-separated string | Filter by role (e.g. `Director,Editor`) |
| `maxRate` | number string | Maximum hourly rate |
| `q` | string | Free-text search (matches `display_name` or `bio` via `ilike`) |
| `sort` | string | `price_asc`, `price_desc`, `rating`, or default |

**Supabase queries:**
1. `profiles` where `is_discoverable = true`, with optional filters for roles (contains/or), hourly rate (<=), and text search.
2. `portfolio_items` for matched profile IDs, ordered by `sort_order` (up to 4 thumbnails per profile).
3. `profile_ratings` view for matched profile IDs.

**Server actions called:**
- `getSavedCreatorIds()` -- returns a `Set<string>` of creator IDs the current user has bookmarked, used to set the `isSaved` flag on each card.

**Client-side sorting:** Profiles are sorted in JavaScript after the fetch based on the `sort` param.

**Components rendered:**
- `FilterSidebar` -- desktop sidebar with role checkboxes and rate slider
- `MobileFilterSheet` -- bottom sheet wrapper for mobile
- `CastingSearch` -- search input bar
- `SortSelect` -- sort dropdown
- `TalentGrid` -- responsive grid of `TalentCard` components
- `AIConcierge` -- floating AI chat widget (only visible when results exist)

**Loading state:** `app/discover/loading.tsx` renders shimmer skeleton cards while the page loads.

---

### `GET /login` -- Authentication

**File:** `app/login/page.tsx` (async Server Component)

**URL search params:**
| Param | Type | Purpose |
|---|---|---|
| `error` | string | Error message displayed as an alert banner |

**Server actions used (via `formAction`):**
- `login(formData)` -- sign in with email/password
- `signup(formData)` -- create account with email/password

Renders a centered card with email and password inputs. Two submit buttons: "Sign In" and "Sign Up". Error messages from the URL param are displayed as a red banner at the top.

---

### `GET /profile/[id]` -- Public Creator Profile

**File:** `app/profile/[id]/page.tsx` (async Server Component)

**Supabase queries (parallel via `Promise.all`):**
1. `profiles` by ID (returns 404 page if not found).
2. `portfolio_items` by profile ID, sorted by `sort_order`.
3. `reviews` joined with reviewer `profiles`, targeting this creator, newest first.
4. `supabase.auth.getUser()` -- determines if the viewer is authenticated (for the CTA button behavior).
5. `getSavedCreatorIds()` -- checks if the viewer has bookmarked this creator.

**Data processing:**
- Computes `avgRating` and `totalReviews` from the reviews array.
- Extracts the first sentence of the bio as a `tagline`.
- Picks the first portfolio item with a thumbnail as the cinematic `heroImage`.

**Page sections:**
1. Cinematic hero (55vh) -- first portfolio thumbnail as a blurred background, gradient overlay, large avatar, name, hourly rate, role badges, `CinematicPresenceStatus` online indicator, `SaveButton`.
2. Tagline blockquote.
3. Two-column layout: `PortfolioGallery` (left, 3/5) | About text + `RatingSummary` + "Work Together" `GlowButton` CTA (right, 2/5).
4. `TestimonialsList` full-width review cards.

---

### `GET /inbox` -- Connection List

**File:** `app/inbox/page.tsx` (async Server Component, auth-gated)

Redirects to `/login` if not authenticated.

**Supabase queries:**
- All `connections` where the user is either `client_id` or `talent_id`, joined with both `profiles` (client and talent), ordered by `updated_at desc`.

**Components rendered:**
- `InboxTabs` -- tabbed interface splitting connections into Pending, Active, and Past (declined + completed). Each tab shows a count. Connections render as cards linking to `/inbox/[id]`.

---

### `GET /inbox/[id]` -- Chat Room

**File:** `app/inbox/[id]/page.tsx` (async Server Component, auth-gated)

Redirects to `/login` if unauthenticated. Redirects to `/inbox` if the connection doesn't exist or the user isn't a participant.

**Supabase queries:**
1. `connections` joined with both `profiles` (client and talent).
2. `messages` joined with sender `profiles`, sorted ascending by `created_at`.
3. `reviews` (inside `ReviewSection`) -- checks if the user already submitted a review.

**Inline server actions defined on the page:**
- `acceptAction` -- calls `updateConnectionStatus(id, "active")`
- `declineAction` -- calls `updateConnectionStatus(id, "declined")`
- `completeAction` -- calls `updateConnectionStatus(id, "completed")`
- `cancelAction` -- calls `cancelConnection(id)`, then redirects to `/inbox`

**Components rendered:**
- Connection details header with project title, status badge, budget, and created date.
- Status-dependent action buttons:
  - Pending + viewer is talent: Accept / Decline
  - Pending + viewer is client: Cancel Request
  - Active: Mark as Completed
- `ChatInterface` -- real-time messaging UI.
- `MarkReadOnMount` -- invisible component that fires `markConnectionRead` on mount.
- `ReviewSection` (when status is `completed` and viewer is client) -- shows either the existing review or a `ReviewPrompt` form.

---

### `GET /saved` -- Saved Creators

**File:** `app/saved/page.tsx` (async Server Component, auth-gated)

Redirects to `/login` if not authenticated.

**Supabase queries:**
1. `saved_creators` by `user_id` -- gets list of saved creator IDs.
2. `profiles` by those IDs.
3. `portfolio_items` by those IDs (up to 4 thumbnails per creator).
4. `profile_ratings` by those IDs.

If no saved creators, shows an empty state with a heart icon and CTA to `/discover`.

**Components rendered:**
- `TalentGrid` -- same grid component as the discover page, with all cards pre-marked as saved.

---

### `GET /settings` -- Profile Settings

**File:** `app/settings/page.tsx` (async Server Component, auth-gated)

Redirects to `/login` if not authenticated.

**URL search params:**
| Param | Type | Purpose |
|---|---|---|
| `onboarding` | presence flag | Shows a welcome banner when present |

**Supabase queries (parallel via `Promise.all`):**
1. `profiles` by user ID -- pre-fills the form.
2. `portfolio_items` by user ID -- populates the portfolio manager.

**Components rendered:**
- `ProfileForm` (client component at `app/settings/profile-form.tsx`)
- `PortfolioManager` (client component at `app/settings/portfolio-manager.tsx`) -- only visible when `is_discoverable` is true.

#### ProfileForm

Handles the user's profile information. Fields:
- Avatar (click-to-upload, stored in `avatars` bucket, max 5MB)
- Display Name
- Available for Hire toggle (`is_discoverable`)
- Roles (comma-separated, shown only when discoverable)
- Hourly Rate (shown only when discoverable)
- Bio (shown only when discoverable)

**Avatar upload flow:** File validated client-side (max 5MB) -> uploaded to Supabase Storage bucket `avatars` at `{userId}/{timestamp}.{ext}` -> public URL stored in state -> sent with form submission.

Submits to the `updateProfile` server action.

#### PortfolioManager

Manages the creator's portfolio pieces. Supports three item types:
- **Image upload** -- files up to 20MB, stored in the `portfolio` bucket
- **Video embed** -- YouTube or Vimeo URLs, auto-parsed into embed URLs with auto-generated thumbnails
- **External link** -- any URL

Items can be reordered via up/down arrow buttons (calls `reorderPortfolioItems`) and deleted (calls `removePortfolioItem`). New items are added via a dialog with three tabs (Upload, Video, Link), calling `addPortfolioItem`.

---

## 5. API Endpoint

### `POST /api/ai-chat` -- AI Concierge

**File:** `app/api/ai-chat/route.ts`

The only API route in the codebase. Provides a streaming AI chat endpoint for the AI casting assistant widget on the discover page.

**Request body:**
```json
{ "messages": [ /* UI message array from useChat */ ] }
```

**Processing:**
1. Converts UI messages to model messages via `convertToModelMessages()`.
2. Calls `buildCreatorContext()` from `lib/ai-context.ts`, which fetches all discoverable profiles, their ratings from `profile_ratings`, and their reviews (with reviewer names) from the database. Formats everything as a Markdown document with one `## Creator` section per profile.
3. Constructs a system prompt positioning the AI as the "Creatorwood AI Casting Assistant" with the full creator database embedded. The prompt instructs the model to keep responses short (2--4 sentences), avoid markdown formatting, and always call the `showCreatorCards` tool when recommending creators.
4. Calls `streamText()` from the Vercel AI SDK with `openai("gpt-4o-mini")`.
5. Returns a streaming response via `result.toUIMessageStreamResponse()`.

**Tools available to the model:**

| Tool | Input | Behavior |
|---|---|---|
| `showCreatorCards` | `{ profileIds: string[] }` | Returns `{ displayed: profileIds }`. The client-side `AIConciergePanel` reads these IDs from tool invocation parts and renders inline profile cards. |

The model is limited to 3 tool-call steps maximum (`stopWhen: stepCountIs(3)`).

**Client integration:** The `AIConciergePanel` component uses `useChat` from `@ai-sdk/react` with `DefaultChatTransport` pointing to `/api/ai-chat`.

---

## 6. Server Actions Reference

All server actions live in `app/actions/` and are marked with `"use server"`. Every action that mutates data performs an auth check via `supabase.auth.getUser()` before proceeding.

### `app/actions/auth.ts`

#### `login(formData: FormData)`

| | |
|---|---|
| **Tables** | Supabase Auth (`signInWithPassword`), `profiles` (SELECT) |
| **Cookies** | Sets `cw_profile_complete` if profile is complete |
| **Redirects** | `/` on success, `/login?error=<message>` on failure |

Steps:
1. Calls `supabase.auth.signInWithPassword()` with email and password from FormData.
2. On auth error, redirects to `/login?error=<encoded message>`.
3. Fetches the user via `getUser()`, queries `profiles.display_name`.
4. Sets `cw_profile_complete` cookie if `display_name !== "New User"`.
5. Redirects to `/`.

#### `signup(formData: FormData)`

| | |
|---|---|
| **Tables** | Supabase Auth (`signUp`), `profiles` (UPSERT) |
| **Redirects** | `/settings` on success, `/login?error=<message>` on failure |

Steps:
1. Calls `supabase.auth.signUp()` with email and password.
2. On auth error, redirects to `/login?error=<encoded message>`.
3. Upserts a `profiles` row: `{ id: user.id, display_name: "New User", is_discoverable: false }`.
4. Redirects to `/settings`.

#### `signOut()`

| | |
|---|---|
| **Tables** | Supabase Auth (`signOut`) |
| **Cookies** | Deletes `cw_profile_complete` |
| **Redirects** | `/` |

Steps:
1. Calls `supabase.auth.signOut()`.
2. Deletes `cw_profile_complete` cookie.
3. Revalidates `/` layout.
4. Redirects to `/`.

---

### `app/actions/profile.ts`

#### `updateProfile(formData: FormData) -> { error: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` -- returns `{ error: "Not authenticated" }` if no user |
| **Tables** | `profiles` (UPSERT) |
| **Cookies** | Sets `cw_profile_complete` if display name is valid |
| **Revalidates** | `/settings`, `/` (layout) |

Steps:
1. Parses `roles` from a comma-separated string into an array.
2. Parses `hourly_rate` as a float (null if NaN).
3. Reads `avatar_url`, `display_name`, `bio`, `is_discoverable` from FormData.
4. Upserts into `profiles` on conflict `id`.
5. Sets the `cw_profile_complete` cookie if `display_name` is set and is not "New User".
6. Returns `{ error: null }`.

---

### `app/actions/portfolio.ts`

#### `addPortfolioItem(formData: FormData) -> { error: string | null; id: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` |
| **Tables** | `portfolio_items` (SELECT count, INSERT) |
| **Storage** | `portfolio` bucket (upload, for images only) |
| **Revalidates** | `/settings`, `/profile/{userId}` |

Branches on the `type` field from FormData:

**`type === "image"`:**
1. Validates file exists and is under 20MB.
2. Uploads to Supabase Storage bucket `portfolio` at `{userId}/{timestamp}.{ext}`.
3. Gets the public URL.
4. Inserts a `portfolio_items` row with `type: "image"`.

**`type === "video_embed"`:**
1. Parses the URL to extract a YouTube or Vimeo video ID.
2. Generates an embed URL (`youtube.com/embed/...` or `player.vimeo.com/video/...`) and a thumbnail URL (`img.youtube.com/vi/.../hqdefault.jpg` or `vumbnail.com/...`).
3. Returns an error if the URL is not a recognized YouTube/Vimeo format.
4. Inserts a `portfolio_items` row with `type: "video_embed"`.

**`type === "link"`:**
1. Inserts a `portfolio_items` row with `type: "link"`. Falls back to the URL's hostname for the title if none is provided.

The `sort_order` for new items is set to the current count of the user's existing portfolio items (appends to end).

#### `removePortfolioItem(itemId: string) -> { error: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` + ownership check (`profile_id === user.id`) |
| **Tables** | `portfolio_items` (SELECT, DELETE) |
| **Storage** | `portfolio` bucket (remove, for images only) |
| **Revalidates** | `/settings`, `/profile/{userId}` |

Steps:
1. Fetches the item by ID.
2. Verifies ownership.
3. If the item is an image, extracts the storage path from the URL and deletes the file from the `portfolio` bucket.
4. Deletes the row from `portfolio_items`.

#### `reorderPortfolioItems(orderedIds: string[]) -> { error: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` |
| **Tables** | `portfolio_items` (UPDATE, one per item) |
| **Revalidates** | `/settings`, `/profile/{userId}` |

Maps over the `orderedIds` array and issues a parallel UPDATE for each item, setting `sort_order` to the array index. Each update is scoped to `profile_id = user.id` so users can only reorder their own items.

---

### `app/actions/connection.ts`

#### `requestConnection(_prevState, formData: FormData) -> { error: string | null }`

Uses the `useActionState` pattern (first argument is previous state).

| | |
|---|---|
| **Auth** | `getUser()` |
| **Tables** | `connections` (INSERT), `messages` (INSERT) |
| **Revalidates** | `/inbox` |

Steps:
1. Validates `talent_id` is present and is not the current user (self-hire prevention).
2. Validates `project_title` and `initial_pitch` are non-empty.
3. Inserts a `connections` row with `status: "pending"`.
4. Inserts the initial pitch as the first message in the `messages` table.

---

### `app/actions/inbox.ts`

#### `sendMessage(connectionId: string, content: string) -> { error: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` + participant check |
| **Tables** | `connections` (SELECT), `messages` (INSERT) |

Steps:
1. Validates content is non-empty.
2. Fetches the connection to get `client_id` and `talent_id`.
3. Verifies the user is a participant.
4. Inserts a message row.

Does NOT call `revalidatePath` -- relies on Supabase Realtime for live UI updates.

#### `updateConnectionStatus(connectionId: string, status: "active" | "declined" | "completed") -> { error: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` + role-based authorization |
| **Tables** | `connections` (SELECT, UPDATE) |
| **Revalidates** | `/inbox`, `/inbox/{connectionId}` |

Authorization rules:
- `"active"` or `"declined"`: only the **talent** can perform this.
- `"completed"`: either the talent or client can perform this.

#### `cancelConnection(connectionId: string) -> { error: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` + client-only + pending-only |
| **Tables** | `connections` (SELECT via user client, DELETE via **admin client**) |
| **Revalidates** | `/inbox` |

Steps:
1. Verifies the current user is the `client_id` (only the sender can cancel).
2. Verifies the status is `"pending"`.
3. Uses the admin client to DELETE the connection row (bypasses RLS since auth and ownership were already verified).

#### `markConnectionRead(connectionId: string) -> { error: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` + participant check |
| **Tables** | `connections` (SELECT, UPDATE) |
| **Revalidates** | `/inbox` |

Determines whether the user is the client or talent, then updates the appropriate `_last_read_at` column to the current timestamp.

#### `getUnreadCount() -> number`

| | |
|---|---|
| **Auth** | Soft check -- returns `0` for unauthenticated users |
| **Tables** | `connections` (SELECT), `messages` (SELECT count per connection) |

Steps:
1. Fetches all connections the user participates in.
2. For each connection, determines the user's `last_read_at` timestamp.
3. Counts messages from the other party that were sent after `last_read_at` (or all messages if never read).
4. Returns the total sum.

---

### `app/actions/review.ts`

#### `submitReview(_prevState, formData: FormData) -> { error: string | null; success: boolean }`

Uses the `useActionState` pattern.

| | |
|---|---|
| **Auth** | `getUser()` |
| **Tables** | `connections` (SELECT), `reviews` (SELECT for duplicate check, INSERT) |
| **Revalidates** | `/inbox/{connectionId}`, `/profile/{targetId}` |

Steps:
1. Parses `rating` (must be 1--5) and optional `comment`.
2. Fetches the connection -- validates `status === "completed"`.
3. Validates `connection.client_id === user.id` (only the client can review).
4. Checks for an existing review by this user on this connection (prevents duplicates).
5. Inserts a `reviews` row with `target_id` set to the talent.

---

### `app/actions/saved.ts`

#### `toggleSaveCreator(creatorId: string) -> { saved: boolean; error: string | null }`

| | |
|---|---|
| **Auth** | `getUser()` |
| **Tables** | `saved_creators` (SELECT, INSERT or DELETE) |
| **Revalidates** | `/saved`, `/discover` |

Toggle behavior:
- If the creator is already saved, deletes the `saved_creators` row and returns `{ saved: false }`.
- If not saved, inserts a new row and returns `{ saved: true }`.
- Prevents self-saving (`user.id === creatorId`).

#### `getSavedCreatorIds() -> Set<string>`

| | |
|---|---|
| **Auth** | Soft check -- returns empty Set for unauthenticated users |
| **Tables** | `saved_creators` (SELECT `creator_id`) |

Returns a `Set<string>` of all creator IDs the current user has bookmarked.

---

## 7. Real-Time Systems

Creatorwood uses three Supabase Realtime features:

### Live Chat Messages

**Mechanism:** `postgres_changes` on the `messages` table (INSERT events).

**Used in:**
- `ChatInterface` -- subscribes to INSERTs filtered by `connection_id`. New messages from the other user trigger a notification sound (Web Audio API, 800Hz oscillator, 80ms) and are appended to the message list with a `fadeUp` animation. The view auto-scrolls to the bottom.
- `NavInboxBadge` -- subscribes to all INSERTs on `messages`. Increments the unread badge count when a new message arrives from someone other than the current user.

### Typing Indicators

**Mechanism:** Supabase Realtime `broadcast` channel (event: `"typing"`).

**Used in:** `ChatInterface` only. When the user types, a throttled broadcast is sent (at most every 2 seconds). The other user sees bouncing dots that auto-hide after 3 seconds of inactivity.

### Online Presence

**Mechanism:** Supabase Realtime Presence channel (`"online-users"`).

**Used in:**
- `PresenceProvider` -- wraps the entire app. Tracks the current user on mount, untracks on unmount, and syncs the `onlineUsers` Set on every `"sync"` event. Exposes the `usePresence()` hook.
- `PresenceIndicator` -- consumes `usePresence()` to render a green (online) or gray (offline) dot on talent cards and profiles.
- `CinematicPresenceStatus` / `PresenceStatus` (from `ProfileHero`) -- larger online/offline indicator with text label.

Anonymous visitors (no user) do not subscribe to the presence channel.

---

## 8. Components Reference

All 28 feature components in `components/`. The 17 shadcn/ui primitives in `components/ui/` are excluded.

### Navigation

#### `Navbar` (Server Component)

The sticky top navigation bar. Renders on every page via the root layout.

**Data fetched server-side:**
- `supabase.auth.getUser()` for auth state.
- `profiles.display_name, avatar_url` for the current user.
- `getUnreadCount()` server action for the inbox badge count.

**Renders:** Creatorwood logo, nav links (Discover, Inbox, Saved -- authenticated only), `ThemeToggle`, and either `NavUserMenu` or Sign In / Sign Up buttons.

#### `NavUserMenu` (Client Component)

Dropdown menu for authenticated users. Shows avatar, email, link to Settings, and a Sign Out button (calls the `signOut` server action via a form).

#### `NavInboxBadge` (Client Component)

**Props:** `{ initialCount: number, userId: string }`

Inbox link with a live unread badge. Subscribes to Supabase Realtime `postgres_changes` on `messages` (INSERT). Increments count for messages from other users. Badge shows "9+" when count exceeds 9. Uses `AnimatePresence` for scale-in/out animation.

#### `ThemeToggle` (Client Component)

Dark/light mode toggle. Uses `useTheme` from `next-themes`. Shows Sun icon in dark mode, Moon icon in light mode. Renders an invisible placeholder until hydrated.

---

### Discover

#### `FilterSidebar` (Client Component)

Desktop filter panel with role checkboxes (Director, Writer, Producer, Editor) and a max hourly rate slider (0--500). Reads/writes URL search params (`roles` as comma-separated, `maxRate`). The slider uses `onValueCommit` to push to the URL only when the user releases the thumb.

#### `MobileFilterSheet` (Client Component)

A bottom sheet wrapper (shadcn `Sheet`) around `FilterSidebar` for mobile viewports.

#### `CastingSearch` (Client Component)

Search input for the discover page. Reads/writes the `q` URL search param. Fires on Enter key or search icon click. Uses `startTransition` for responsive navigation. Shows a shimmer progress bar during pending state.

#### `SortSelect` (Client Component)

Sort dropdown with options: Recommended, Price Low-High, Price High-Low, Highest Rated. Reads/writes the `sort` URL search param. Uses a native `<select>` styled with Tailwind.

#### `TalentGrid` (Client Component)

**Props:** `{ profiles: TalentCardProfile[] }`

Responsive grid layout for `TalentCard` components. First 2 profiles are "featured" (spanning 2 columns), the rest fill a 3-column grid. Each card is wrapped in `motion.div` with layout animation and `scaleIn` preset.

#### `TalentCard` (Client Component)

**Props:** `{ id, display_name, avatar_url, roles, hourly_rate, bio, portfolio_thumbnails, avg_rating, review_count, isSaved?, featured? }`

The main profile card. Links to `/profile/{id}`. Features:
- `ThumbnailCycler` -- cycles through portfolio thumbnails on hover with a 1.5s interval and dot indicators.
- Lifts on hover via `whileHover: { y: -8 }`.
- "Stacking card" pseudo-element illusion.
- `SaveButton` on top-right corner.
- `PresenceIndicator` green dot on the avatar.
- Roles capped at 3 with a "+N" overflow badge.

---

### Profile

#### `ProfileHero` (Client Component -- 4 exports)

- **`GlowButton`** `{ talentId, talentName, isAuthenticated }` -- wraps `HireModal` in a pulsing gradient blur effect.
- **`AvailabilityDot`** -- standalone pinging emerald dot.
- **`PresenceStatus`** `{ userId }` -- online/offline indicator with text ("Online Now" / "Offline").
- **`CinematicPresenceStatus`** `{ userId }` -- compact variant for the cinematic hero.

#### `HireModal` (Client Component)

**Props:** `{ talentId, talentName, glowing?, isAuthenticated }`

Dialog modal for requesting a connection. Contains a form with Project Title, Budget Estimate (optional), and Initial Pitch. Uses `useActionState` bound to `requestConnection`. If the user is not authenticated, clicking the trigger redirects to `/login?redirect=...` instead of opening the modal. On success, shows a toast and redirects to `/inbox`.

#### `PortfolioGallery` (Client Component)

**Props:** `{ items: PortfolioItem[], creatorName? }`

Portfolio gallery on a creator's profile. Hero piece is full-width; remaining items use a CSS columns masonry layout. Handles three item types:
- `video_embed` -- play button overlay, opens in lightbox iframe
- `link` -- opens externally (no lightbox)
- `image` -- opens in lightbox

Includes a built-in `Lightbox` component with Esc-to-close, focus-trapped close button, and body scroll lock.

#### `ReviewsDisplay` (Client Component -- 2 exports)

- **`RatingSummary`** `{ avgRating, totalCount }` -- aggregate star rating display, or "No reviews yet".
- **`TestimonialsList`** `{ reviews }` -- individual review cards with a "Show all N reviews" toggle (initially shows 3). Amber left-border accent.

Internal helpers: `StarRow` (1--5 stars), `timeAgo` (relative time), `ReviewCard`.

#### `SaveButton` (Client Component)

**Props:** `{ creatorId, initialSaved, size? }`

Heart-shaped bookmark toggle with optimistic updates. Calls `toggleSaveCreator`. Reverts on error with a toast. Framer Motion `whileTap` press animation. Stops event propagation (sits inside link cards).

---

### Inbox

#### `InboxTabs` (Client Component)

**Props:** `{ connections: ConnectionWithProfiles[], currentUserId }`

Tabbed inbox view: Pending, Active, Past (declined + completed). Tab triggers show counts. Each connection renders as a `ConnectionCard` with avatar, project title, other user name, role label, and status badge. Cards link to `/inbox/{id}`.

#### `ChatInterface` (Client Component)

**Props:** `{ initialMessages, connectionId, currentUserId, currentUser, otherUser }`

Full real-time chat UI. Features:
- Subscribes to `postgres_changes` INSERT on `messages` for new incoming messages.
- Subscribes to `broadcast` channel for typing indicators.
- Calls `sendMessage` server action on form submit.
- Notification sound (Web Audio API, 800Hz, 80ms) for incoming messages.
- Typing indicator with bouncing dots (throttled to 2s broadcasts, 3s auto-hide).
- New messages animate in with `fadeUp`.
- Auto-scrolls to bottom.
- Enter sends, Shift+Enter for new line.

#### `MarkReadOnMount` (Client Component)

**Props:** `{ connectionId }`

Invisible component that calls `markConnectionRead` once on mount. Uses a ref guard to prevent double-fire in React StrictMode. Renders `null`.

#### `ReviewPrompt` (Client Component)

**Props:** `{ connectionId, otherName }`

Star-rating + comment form for reviewing a completed connection. Uses `useActionState` bound to `submitReview`. Custom `StarRating` sub-component with keyboard accessibility (ArrowLeft/Right, radio group role). `AnimatePresence` swaps the form for a success card after submission.

---

### AI

#### `AIConcierge` (Client Component)

**Props:** `{ profiles: TalentCardProfile[] }`

Orchestrator that manages open/closed state and renders either the `AIConciergeButton` (FAB) or the `AIConciergePanel` (sheet). Uses `AnimatePresence` for smooth transitions.

#### `AIConciergeButton` (Client Component)

**Props:** `{ onClick }`

Fixed-position floating action button (bottom-right) with Sparkles icon and "Ask AI" text. Uses `scaleIn` motion preset and `animate-glow` pulsing effect.

#### `AIConciergePanel` (Client Component)

**Props:** `{ open, onOpenChange, profiles }`

The AI chat sheet (slides in from the right). Uses `useChat` from `@ai-sdk/react` with `DefaultChatTransport` pointing to `/api/ai-chat`. Features:
- Pre-populates a welcome message from the assistant.
- Handles `showCreatorCards` tool invocations -- parses `profileIds` from tool parts and renders inline `AIConciergeCard` components (compact profile row with avatar, name, rating, rate, role badges, linking to `/profile/{id}`).
- Bouncing-dots loading indicator during streaming.
- Resets conversation when the sheet closes.
- Enter sends, Shift+Enter for new line.

---

### Landing Page

#### `FeaturedShowcase` (Server Component)

**Props:** `{ items: ShowcaseItem[] }`

Bento-grid layout for featured portfolio pieces on the homepage. First item is a large hero (2-col, 2-row span) with a `ken-burns` CSS animation (20s infinite). Remaining items fill a smaller grid. Hover reveals creator name on smaller thumbnails.

#### `FeaturedCreators` (Server Component)

**Props:** `{ creators: FeaturedCreator[] }`

Horizontal snap-scrolling carousel of featured creator cards on the homepage. Each card is 224px wide, links to the profile page. Fade gradient edges on left/right sides. Hidden scrollbar.

---

### Shared / Animation

#### `AnimateOnScroll` (Client Component)

**Props:** `{ children, delay?, className? }`

Generic scroll-triggered fade-up wrapper. Uses Framer Motion `whileInView` with `viewport: { once: true, margin: "-60px" }`.

#### `AnimatedCounter` (Client Component)

**Props:** `{ target: number, duration? (default 1200ms) }`

Counts up from 0 to `target` with cubic ease-out animation. Triggered by `IntersectionObserver` when the element is 50% visible. Uses `requestAnimationFrame` for smooth counting. Only animates once.

#### `PresenceProvider` (Client Component)

**Props:** `{ children }`

React context provider that manages Supabase Presence. Creates a channel `"online-users"`, subscribes, tracks the current user, and syncs the `onlineUsers` Set on `"sync"` events. Anonymous visitors skip subscription. Exports the `usePresence()` hook returning `{ onlineUsers: Set<string>, isActive: boolean }`.

#### `PresenceIndicator` (Client Component)

**Props:** `{ userId, size? }`

Small colored dot: green with a pinging animation and glow when online, gray when offline. Consumes `usePresence()`.

---

## 9. Utilities

### `lib/utils.ts`

#### `cn(...inputs: ClassValue[]): string`

Standard shadcn utility. Merges class names via `clsx` + `tailwind-merge` to handle Tailwind class conflicts.

#### `getInitials(name: string): string`

Takes a full name string, returns up to 2 uppercase initials. Used for avatar fallbacks throughout the app. Example: `"John Doe"` returns `"JD"`.

### `lib/motion.ts`

Centralized Framer Motion animation presets. Used across the codebase instead of inline animation configs.

| Export | Type | Config |
|---|---|---|
| `MOTION.spring` | Transition | `{ type: "spring", stiffness: 300, damping: 25 }` |
| `MOTION.duration` | Transition | `{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }` |
| `MOTION.stagger` | Number | `0.04` seconds between staggered children |
| `fadeUp` | Variant | Fade in from 12px below |
| `fadeIn` | Variant | Simple opacity fade |
| `scaleIn` | Variant | Scale from 0.95 + fade, with exit animation and spring transition |

### `lib/ai-context.ts`

#### `buildCreatorContext(): Promise<string>`

Async server-side function that constructs the creator database context for the AI concierge's system prompt.

Steps:
1. Fetches all discoverable `profiles` (id, display_name, bio, roles, hourly_rate).
2. Fetches aggregate ratings from the `profile_ratings` view.
3. Fetches individual `reviews` with comments and reviewer names (up to 5 per creator).
4. Formats everything as a Markdown string with `## Creator: Name (ID: ...)` sections including roles, rate, rating, bio, and review excerpts.

Returns `"No creators are currently available on the platform."` if no discoverable profiles exist.

---

## 10. Environment Variables

All environment variables are stored in `.env.local` (git-ignored).

| Variable | Public | Used In | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `client.ts`, `server.ts`, `middleware.ts` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `client.ts`, `server.ts`, `middleware.ts` | Supabase anonymous/public API key |
| `OPENAI_API_KEY` | No | Implicitly read by `@ai-sdk/openai` in `api/ai-chat/route.ts` | OpenAI API key for the AI concierge |
