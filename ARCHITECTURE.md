# Open House Tour App — Architecture Plan

## Problem

You have 16 open house listings across Brooklyn on March 22, spread across 7 time slots from 10am to 4pm. You need a mobile-friendly app that you and a friend can pull up on your phones to navigate the day efficiently — seeing what's next, comparing listings at a glance, and getting directions between stops.

---

## Data Model

Each listing will be represented as a static JSON object with this shape:

```typescript
interface Listing {
  id: string;                    // e.g., "508-ocean-ave-902"
  address: string;               // "508 Ocean Ave"
  unit: string;                  // "902"
  neighborhood: string;          // "Prospect Park South"

  // Time
  timeSlot: string;              // "10:00 AM – 11:00 AM"
  startTime: string;             // "10:00" (24h, for sorting)
  endTime: string;               // "11:00"

  // Listing details (from spreadsheet)
  priceK: number;                // 580 (in thousands)

  // Scraped from StreetEasy
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  rooms: number | null;
  propertyType: string;          // "Condo" | "Co-op"
  commonCharges: string | null;  // "$308/mo"
  taxes: string | null;          // "$10/mo"
  monthlyCost: string | null;    // estimated payment
  description: string;           // first ~200 chars of listing description
  features: string[];            // ["Central air", "Dishwasher", ...]
  amenities: string[];           // ["Elevator", "Roof deck", ...]
  petsAllowed: boolean | null;
  imageUrl: string;              // OG image from StreetEasy (hosted on Zillow CDN)

  // Links
  streetEasyUrl: string;

  // Geo (for map view — geocoded from address)
  lat: number;
  lng: number;
}

// Notes are stored in localStorage on each user's phone
interface ListingNote {
  listingId: string;
  text: string;
  updatedAt: string;            // ISO timestamp
}
```

**Listing data:** Static JSON file (`data/listings.json`) baked into the build. No database, no API. 16 listings don't change — this is a one-day tool.

**Notes — Phase 1 (localStorage):** Stored in `localStorage` under key `openhouse-notes` as a `Record<listingId, ListingNote>`. Each user's phone has its own independent notes — no sync needed, no backend. Notes persist across page refreshes and survive closing the browser. Auto-saved on every keystroke (debounced 500ms).

**Notes — Phase 2 (future expansion):** Swap localStorage for Vercel Postgres (free tier, 256MB). Add Auth.js (Google OAuth or magic link) so each user has an identity. The `useNotes` hook is the only layer that touches storage, so this is a one-file backend swap — no component changes. This unlocks shared notes, favoriting, and any other per-user state.

```
Phase 1:  ListingCard → useNotes → localStorage
Phase 2:  ListingCard → useNotes → /api/notes → Vercel Postgres + Auth.js
```

---

## Data Collection Strategy

### Source 1: Your spreadsheet (already parsed)
- Address, unit, time, price, StreetEasy URL

### Source 2: StreetEasy scraping via Chrome automation
For each of the 16 URLs, we'll visit the page and extract:

| Field | Source |
|-------|--------|
| beds, baths, rooms, sqft | Page text (rendered HTML) |
| price | Page text |
| common charges, taxes | Page text |
| description | JSON-LD `description` field |
| amenities | JSON-LD `amenityFeature` array |
| features | Page text (home features section) |
| photo | `og:image` meta tag → Zillow CDN URL |
| neighborhood | Page title parsing |
| property type | Page text ("Condo" / "Co-op") |

**Why Chrome automation, not HTTP scraping:** StreetEasy blocks direct HTTP requests (confirmed — WebFetch returns nothing). The page also hydrates client-side. Chrome automation gives us the fully rendered DOM.

### Source 3: Geocoding
Addresses → lat/lng coordinates via the OpenStreetMap Nominatim API (free, no key needed). Used for the map view.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 16 (App Router) | Required by project spec; latest stable, SSG for speed |
| **Styling** | Tailwind CSS | Fast to build mobile-first UI, no CSS files to manage |
| **Map** | Leaflet + OpenStreetMap tiles | Free, no API key, lightweight |
| **Hosting** | Vercel | Required by project spec |
| **Data** | Static JSON | 16 listings, no backend needed |

### What we're NOT using (and why)
- **No database** — 16 static listings, rebuild to update
- **No auth** — public URL, share with your friend directly
- **No Google Maps API** — Leaflet is free and sufficient; Google Maps links used only for tap-to-navigate
- **No React Native / Expo** — this is a web app optimized for mobile browsers, not a native app

---

## Project Structure

```
open-house/
├── app/
│   ├── layout.tsx          # Root layout: viewport meta, fonts, Tailwind
│   ├── page.tsx            # Main page: itinerary + map toggle
│   └── globals.css         # Tailwind directives + minimal custom CSS
├── components/
│   ├── TimeSlotGroup.tsx   # Group header ("10:00 – 11:00 AM") + listing cards
│   ├── PastSlotGroup.tsx   # Collapsed "Past" section for ended time slots
│   ├── ListingCard.tsx     # Individual apartment card
│   ├── NoteEditor.tsx      # Inline note input per listing (localStorage-backed)
│   ├── MapView.tsx         # Leaflet map with all 16 pins
│   ├── ViewToggle.tsx      # Tab bar: "Schedule" | "Map"
│   └── Header.tsx          # App title + date
├── hooks/
│   ├── useNotes.ts         # Read/write notes to localStorage by listing ID
│   └── useLiveClock.ts     # Re-renders every minute to update past/active status
├── data/
│   └── listings.json       # All 16 listings (generated by scraper)
├── lib/
│   └── types.ts            # TypeScript interfaces
├── public/
│   └── favicon.ico
├── scripts/
│   └── scrape.ts           # StreetEasy scraper (run once, not deployed)
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Page Architecture

Single page, two views toggled by a sticky tab bar at the top.

### View 1: Schedule (default)

```
┌─────────────────────────────┐
│  🏠 Open House Tour         │
│  Saturday, March 22         │
├─────────────────────────────┤
│  [Schedule]  [Map]          │  ← sticky tab bar
├─────────────────────────────┤
│                             │
│  10:00 – 11:00 AM          │  ← time slot header
│  ┌─────────────────────┐   │
│  │ 📷  508 Ocean #902  │   │  ← listing card
│  │ $580K · 1bd/1ba     │   │
│  │ Condo · — sqft      │   │
│  │ $308/mo + $10 tax   │   │
│  │ [Directions] [View] │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ 📷  608 Ocean #201  │   │
│  │ $699K · ...         │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ 📷  608 Ocean #401  │   │
│  │ $720K · ...         │   │
│  └─────────────────────┘   │
│                             │
│  11:30 AM – 12:30 PM       │  ← next time slot
│  ...                        │
└─────────────────────────────┘
```

**Card interactions:**
- Tap card → expands to show description, features, amenities, and **note editor**
- Tap "Directions" → opens Google Maps with address (works on iOS + Android)
- Tap "View Listing" → opens StreetEasy in new tab
- Note field → auto-saves to localStorage as you type (per listing)

**Time-aware behavior:**
The app checks the current time every 60 seconds via `useLiveClock`. Time slots are categorized as:

- **Active / Upcoming** — displayed normally at the top, sorted by start time
- **Past** — once a slot's end time has passed, its cards slide down into a "Past" section at the bottom. This section is collapsed by default (tap to expand). Nothing is deleted — you can always go back and review listings or read your notes.

```
┌─────────────────────────────┐
│                             │
│  1:00 – 2:00 PM  (NOW)     │  ← currently active, shown first
│  ┌─────────────────────┐   │
│  │ 📷  221 E 18th #2K  │   │
│  │ $575K · 1bd/1ba     │   │
│  │ 📝 "Loved the light │   │  ← your note, inline
│  │     but small kitch" │   │
│  └─────────────────────┘   │
│  ...                        │
│                             │
│  ▼ Past (3 time slots)      │  ← collapsed section, tap to expand
│                             │
└─────────────────────────────┘
```

### View 2: Map

Full-width Leaflet map with numbered markers for each listing. Tapping a marker shows a popup with address, price, and time. Past listings shown as dimmed markers. Map bounds auto-fit to show all pins.

---

## Build & Deploy Pipeline

```
1. Scrape data    →  scripts/scrape.ts outputs data/listings.json
2. Build app      →  next build (static export)
3. Deploy         →  vercel deploy (or Vercel MCP tool)
```

Since the data is static, the app is a pure SSG site — every page is pre-rendered HTML. Fast, cacheable, no server costs.

---

## Key Design Decisions

**Why static JSON instead of fetching StreetEasy at runtime?**
StreetEasy blocks automated requests. And even if it didn't, you don't want your tour app to break if their site is slow. Bake the data in — it won't change between now and tomorrow.

**Why Leaflet over Google Maps?**
Google Maps requires an API key with billing. Leaflet with OpenStreetMap tiles is free and works great for 16 pins on a Brooklyn map. For actual navigation, we deep-link to Google/Apple Maps.

**Why localStorage for notes instead of a shared database?**
Each person types their own impressions on their own phone — that's the natural flow. Syncing notes would require a backend, auth, and conflict resolution, all for a one-day tool. If you want to compare notes afterward, just scroll through them side by side over coffee.

**Why auto-move past listings instead of manual checkboxes?**
Manual check-off requires discipline during a busy day. Time-based categorization is automatic and accurate — if the open house ended at 11am, it's in the past at 11:01am. And since nothing is deleted, you can always expand the Past section to revisit anything.

**Why App Router?**
It's the standard for new Next.js projects. For a single-page app like this there's no meaningful difference vs Pages Router, but App Router gives us better defaults for metadata, loading states, and static generation.

---

## Execution Order

| Step | What | Time Est. |
|------|------|-----------|
| 1 | Scrape all 16 StreetEasy listings via Chrome | ~10 min |
| 2 | Geocode addresses via Nominatim | ~2 min |
| 3 | Scaffold Next.js + Tailwind project | ~5 min |
| 4 | Build ListingCard + TimeSlotGroup + PastSlotGroup | ~10 min |
| 5 | Build NoteEditor + useNotes hook (localStorage) | ~5 min |
| 6 | Build useLiveClock + past/active time logic | ~5 min |
| 7 | Build MapView with Leaflet | ~10 min |
| 8 | Wire up ViewToggle + layout | ~5 min |
| 9 | Deploy to Vercel | ~5 min |
| 10 | Mobile QA + fixes | ~5 min |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| StreetEasy blocks Chrome scraping | No listing details | Fall back to spreadsheet data only; manually add key details |
| Some listings missing sqft | Incomplete cards | Show "—" gracefully, common for new listings |
| Leaflet bundle size | Slower first load | Dynamic import (`next/dynamic`) with SSR disabled |
| Geocoding returns wrong location | Map pins off | Verify with known Brooklyn coordinates; manual override if needed |
| localStorage cleared by browser | Notes lost | Low risk for a single-day tool; Safari private browsing is the main concern — we'll show a small warning if localStorage is unavailable |
| Clock drift / timezone | Listings categorized wrong | Use `new Date()` which reads the phone's local clock; all times are ET and the user is in Brooklyn |
