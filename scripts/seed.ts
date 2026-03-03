import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { readFileSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// Load env vars from .env.local (lightweight, no dotenv dependency)
// ---------------------------------------------------------------------------
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const contents = readFileSync(envPath, "utf-8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local may not exist in CI — rely on actual env vars
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.\n" +
      "You can find it in the Supabase dashboard → Settings → API → service_role."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Talent definitions
// ---------------------------------------------------------------------------
interface TalentDef {
  name: string;
  roles: string[];
  bio: string;
  hourlyRate: number;
  portfolioItems: {
    title: string;
    description: string;
    type: "image" | "video_embed" | "link";
    url: string;
  }[];
}

const TALENT: TalentDef[] = [
  // ---- Directors (4) ----
  {
    name: "Maya Chen",
    roles: ["Director"],
    bio: "Award-winning director specializing in sci-fi and fantasy shorts. 10+ years crafting visual narratives that blur the line between reality and imagination.",
    hourlyRate: 275,
    portfolioItems: [
      { title: "Neon Requiem", description: "Cyberpunk short film — Official Selection, Tribeca 2025", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "Echoes of Light", description: "Experimental documentary on bioluminescence", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "The Glass Garden", description: "Fantasy short — Winner, Austin Film Festival", type: "link", url: "https://vimeo.com/286898202" },
      { title: "Production still — Neon Requiem", description: "Behind the scenes stills from the shoot", type: "image", url: "https://picsum.photos/seed/neon-requiem/800/600" },
    ],
  },
  {
    name: "Jordan Rivera",
    roles: ["Director"],
    bio: "Commercial and music video director with a bold, kinetic style. Clients include Nike, Spotify, and Red Bull.",
    hourlyRate: 350,
    portfolioItems: [
      { title: "Nike — Run Wild", description: "Global campaign spot, 60 sec", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Spotify Wrapped '25", description: "Animated campaign direction", type: "link", url: "https://vimeo.com/286898202" },
      { title: "Red Bull — Limitless", description: "Extreme sports mini-doc", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
  {
    name: "Aisha Patel",
    roles: ["Director"],
    bio: "Indie drama director focused on intimate, character-driven stories. Sundance Lab alumna with two features in development.",
    hourlyRate: 200,
    portfolioItems: [
      { title: "Half-Light", description: "Feature film — premiered at TIFF 2024", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Still Waters", description: "Short drama about generational trauma", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Behind the scenes — Half-Light", description: "Photo series from the set", type: "image", url: "https://picsum.photos/seed/half-light/800/600" },
      { title: "The Quiet Hours", description: "Proof of concept for upcoming feature", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "Director's reel 2025", description: "Compilation of recent work", type: "link", url: "https://vimeo.com/286898202" },
    ],
  },
  {
    name: "Leo Zhang",
    roles: ["Director"],
    bio: "Documentary filmmaker exploring technology, culture, and the human condition. Work featured on Netflix and PBS.",
    hourlyRate: 225,
    portfolioItems: [
      { title: "Silicon Dreams", description: "Feature doc on AI artists — Netflix 2025", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "The Last Typesetter", description: "Short doc on the dying art of letterpress", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Voices of the Valley", description: "PBS series on immigrant entrepreneurs", type: "link", url: "https://vimeo.com/286898202" },
    ],
  },

  // ---- Writers (4) ----
  {
    name: "Sam Okafor",
    roles: ["Writer"],
    bio: "Screenwriter and playwright. Specializes in thriller and horror scripts with layered social commentary. WGA member.",
    hourlyRate: 150,
    portfolioItems: [
      { title: "The Hollow", description: "Feature screenplay — optioned by A24", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Beneath the Floorboards", description: "Horror pilot script — finalist, Nicholl Fellowship", type: "link", url: "https://www.imdb.com/title/tt0468569/" },
      { title: "Writing sample — cold open", description: "First 10 pages of an original thriller", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
    ],
  },
  {
    name: "Elena Vasquez",
    roles: ["Writer"],
    bio: "Bilingual writer crafting stories at the intersection of Latinx identity and speculative fiction. Published in The New Yorker and Tor.com.",
    hourlyRate: 175,
    portfolioItems: [
      { title: "La Grieta", description: "Short story collection — Penguin Random House", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Mundo Roto", description: "Pilot script for sci-fi series", type: "link", url: "https://vimeo.com/286898202" },
      { title: "The Crossing", description: "Feature screenplay — Sundance Lab 2025", type: "link", url: "https://www.imdb.com/title/tt0468569/" },
      { title: "Essay — On Memory and Magic", description: "Published in The New Yorker, March 2025", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
    ],
  },
  {
    name: "Derek Huang",
    roles: ["Writer"],
    bio: "Comedy and animation writer. Credits on two Adult Swim shows and a Pixar short. Loves absurdist humor and heart.",
    hourlyRate: 200,
    portfolioItems: [
      { title: "Cosmic Lunch Break", description: "Adult Swim — Season 2 staff writer", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Tiny Titans", description: "Pixar SparkShorts script", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "Spec script — Office Odyssey", description: "Original workplace comedy pilot", type: "link", url: "https://www.imdb.com/title/tt0468569/" },
    ],
  },
  {
    name: "Priya Kapoor",
    roles: ["Writer"],
    bio: "Narrative designer and screenwriter bridging games and film. Wrote for two AAA titles and an Emmy-nominated series.",
    hourlyRate: 225,
    portfolioItems: [
      { title: "Echoes (game)", description: "Lead narrative designer — 2M+ copies sold", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Fractured Light", description: "Emmy-nominated limited series — episode 3", type: "link", url: "https://www.imdb.com/title/tt0468569/" },
      { title: "Interactive story demo", description: "Branching narrative prototype", type: "link", url: "https://vimeo.com/286898202" },
      { title: "GDC talk — Story as System", description: "Conference presentation on narrative design", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
    ],
  },

  // ---- Producers (3) ----
  {
    name: "Marcus Thompson",
    roles: ["Producer"],
    bio: "Line producer and production manager with 50+ credits across indie features and episodic TV. Expert at making every dollar count.",
    hourlyRate: 200,
    portfolioItems: [
      { title: "Whisper Creek", description: "Indie feature — $800K budget, Sundance premiere", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "The Night Shift", description: "Episodic TV — 8 episodes produced", type: "link", url: "https://www.imdb.com/title/tt0468569/" },
      { title: "Production breakdown reel", description: "Timelapse of set builds and logistics", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
  {
    name: "Nina Kowalski",
    roles: ["Producer"],
    bio: "Creative producer specializing in branded content and social-first video. Built a 10-person production studio from scratch.",
    hourlyRate: 250,
    portfolioItems: [
      { title: "Glossier — Feel Series", description: "12-part branded docuseries", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Studio build-out case study", description: "How I built a production studio on a startup budget", type: "link", url: "https://vimeo.com/286898202" },
      { title: "TikTok campaign — Duolingo", description: "Viral campaign producing 50M+ views", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Behind the scenes — Glossier shoot", description: "Photo documentation of the production", type: "image", url: "https://picsum.photos/seed/glossier-bts/800/600" },
    ],
  },
  {
    name: "Carlos Mendez",
    roles: ["Producer"],
    bio: "Executive producer focused on Latin American co-productions. Bridging Hollywood and emerging film markets across the Americas.",
    hourlyRate: 300,
    portfolioItems: [
      { title: "Río Oscuro", description: "Mexico-US co-production — Cannes Un Certain Regard", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "The Border Within", description: "Documentary series — HBO Max", type: "link", url: "https://www.imdb.com/title/tt0468569/" },
      { title: "Panel — Co-Production Masterclass", description: "TIFF Industry talk on cross-border financing", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },

  // ---- Editors (3) ----
  {
    name: "Taylor Kim",
    roles: ["Editor"],
    bio: "Film and trailer editor with a knack for pacing and emotional beats. ACE member. Clients include Lionsgate and A24.",
    hourlyRate: 175,
    portfolioItems: [
      { title: "A24 trailer — Moonlit", description: "Official theatrical trailer cut", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "Lionsgate sizzle reel", description: "Compilation reel for Lionsgate slate", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Before/after editing breakdown", description: "Side-by-side raw vs. final cut comparison", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "Short film — Liminal", description: "Editor and colorist — festival circuit 2025", type: "link", url: "https://vimeo.com/286898202" },
    ],
  },
  {
    name: "Robin Adeyemi",
    roles: ["Editor"],
    bio: "Documentary editor and story consultant. Comfortable shaping 200 hours of footage into a compelling 90-minute narrative.",
    hourlyRate: 150,
    portfolioItems: [
      { title: "The Weight of Water", description: "Feature doc — edited from 180hrs of footage", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Climate Voices", description: "6-part series — National Geographic", type: "link", url: "https://www.imdb.com/title/tt0468569/" },
      { title: "Editing demo reel", description: "Selected cuts from recent projects", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
    ],
  },
  {
    name: "Alex Moreau",
    roles: ["Editor"],
    bio: "Fast-turnaround editor for YouTube creators and podcasters. 500+ videos edited, 1B+ cumulative views across channels.",
    hourlyRate: 100,
    portfolioItems: [
      { title: "MrBeast-style edit sample", description: "High-energy edit with motion graphics", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "Podcast highlight reel", description: "Best-of cuts from a top-50 podcast", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "YouTube thumbnail gallery", description: "Thumbnails designed alongside edits", type: "image", url: "https://picsum.photos/seed/yt-thumbnails/800/600" },
      { title: "Full video edit — tech review", description: "Complete edit for a 2M-subscriber tech channel", type: "link", url: "https://vimeo.com/286898202" },
      { title: "Workflow breakdown", description: "My Premiere Pro / After Effects pipeline", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
    ],
  },

  // ---- Director + Writer (2) ----
  {
    name: "Zoe Nakamura",
    roles: ["Director", "Writer"],
    bio: "Writer-director making genre-bending films that defy easy categorization. Loves mixing horror, comedy, and social satire.",
    hourlyRate: 250,
    portfolioItems: [
      { title: "Haunted Brunch", description: "Horror-comedy short — 5M views on YouTube", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "The Algorithm", description: "Satirical short about social media addiction", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Feature script — Glitch", description: "Sci-fi horror screenplay in development", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Director's statement — Haunted Brunch", description: "Essay on mixing tones in genre film", type: "link", url: "https://vimeo.com/286898202" },
    ],
  },
  {
    name: "Idris Bankole",
    roles: ["Director", "Writer"],
    bio: "Afrofuturist filmmaker blending West African mythology with cutting-edge visual storytelling. Two shorts in the Criterion Channel.",
    hourlyRate: 275,
    portfolioItems: [
      { title: "Ọ̀run", description: "Short film — Criterion Channel, NYFF selection", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "The Weaver", description: "Animated short based on Yoruba folklore", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Concept art — Ọ̀run", description: "Visual development for the short film", type: "image", url: "https://picsum.photos/seed/orun-concept/800/600" },
    ],
  },

  // ---- Producer + Editor (2) ----
  {
    name: "Jasmine Lee",
    roles: ["Producer", "Editor"],
    bio: "One-stop shop for indie filmmakers. I produce and post-produce — from budget breakdowns to final color grade.",
    hourlyRate: 175,
    portfolioItems: [
      { title: "Daybreak", description: "Indie feature — produced and edited, $300K budget", type: "link", url: "https://www.imdb.com/title/tt0111161/" },
      { title: "Micro-budget masterclass", description: "Talk on producing and editing your own film", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Color grading showreel", description: "Before/after grades across 6 projects", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "Production photo — Daybreak set", description: "On-location photography", type: "image", url: "https://picsum.photos/seed/daybreak-set/800/600" },
    ],
  },
  {
    name: "Kai Andersen",
    roles: ["Producer", "Editor"],
    bio: "Hybrid producer-editor for branded content and short-form social video. From pitch deck to final delivery in one workflow.",
    hourlyRate: 150,
    portfolioItems: [
      { title: "Airbnb — Local Legends", description: "Branded series — produced and cut all 8 episodes", type: "video_embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { title: "Startup launch video", description: "End-to-end production for YC company", type: "video_embed", url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Social cuts — TikTok/Reels", description: "Vertical edits from branded campaigns", type: "link", url: "https://vimeo.com/286898202" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------
async function seed() {
  console.log(`\nSeeding ${TALENT.length} talent profiles...\n`);

  // Fetch any already-seeded profiles so we can skip auth creation
  const { data: existingProfiles } = await supabase
    .from("profiles")
    .select("id, display_name");
  const existingByName = new Map(
    (existingProfiles ?? []).map((p) => [p.display_name, p.id])
  );

  const allProfiles: { id: string; def: TalentDef }[] = [];

  // Step 1 — Create auth users + profiles (skip if already present)
  for (const def of TALENT) {
    const existingId = existingByName.get(def.name);
    if (existingId) {
      allProfiles.push({ id: existingId, def });
      console.log(`  ↩ ${def.name} already exists — skipping`);
      continue;
    }

    const email = faker.internet.email({
      firstName: def.name.split(" ")[0],
      lastName: def.name.split(" ")[1],
      provider: "creatorwood-seed.test",
    });

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: "seedpassword123",
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error(`  ✗ Auth user for ${def.name}: ${authError?.message}`);
      continue;
    }

    const userId = authData.user.id;
    const avatarSeed = def.name.toLowerCase().replace(/\s+/g, "-");

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: def.name,
      bio: def.bio,
      hourly_rate: def.hourlyRate,
      roles: def.roles,
      is_discoverable: true,
      avatar_url: `https://api.dicebear.com/7.x/personas/svg?seed=${avatarSeed}`,
    });

    if (profileError) {
      console.error(`  ✗ Profile for ${def.name}: ${profileError.message}`);
      continue;
    }

    allProfiles.push({ id: userId, def });
    console.log(`  ✓ ${def.name} (${def.roles.join(", ")}) — $${def.hourlyRate}/hr`);
  }

  // Step 2 — Insert portfolio items
  const portfolioRows = allProfiles.flatMap(({ id, def }) =>
    def.portfolioItems.map((item, idx) => {
      const thumbSeed = `${def.name}-${item.title}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      return {
        profile_id: id,
        type: item.type,
        url: item.url,
        thumbnail_url:
          item.type === "image"
            ? item.url
            : `https://picsum.photos/seed/${thumbSeed}/800/600`,
        title: item.title,
        description: item.description,
        sort_order: idx,
      };
    })
  );

  const { error: portfolioError } = await supabase
    .from("portfolio_items")
    .insert(portfolioRows);

  if (portfolioError) {
    console.error(`\n✗ Portfolio items: ${portfolioError.message}`);
  } else {
    console.log(`\n✓ Inserted ${portfolioRows.length} portfolio items across ${allProfiles.length} profiles`);
  }

  console.log("\nDone!\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
