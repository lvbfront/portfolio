# CLAUDE.md

Project memory for Claude Code. Read this first. Keep it true to the code — update it in the same
session as any change it describes.

## 1. Overview

- **Owner:** Abdullah Bukhari (AB) — AI Engineer: LLMs, Computer Vision & AI Agents.
  GitHub [lvbfront](https://github.com/lvbfront).
- **What this is:** a single-page personal portfolio plus two project pages (`/cdg`, `/sky-soarer`). Content is
  hard-coded in arrays — there is no CMS, database or backend.
- **Repo:** https://github.com/lvbfront/portfolio (this folder is the repo root).
- **Live URL:** deployed on Vercel from `main`; the production domain is not recorded in the repo
  (no `vercel.json`, no `.vercel/`) — **(unverified)**, fill it in here once confirmed.
- **Old site:** `../myApp` (outside this repo) is the previous portfolio — **read-only reference**.
  Never edit it. It is not deployed and not part of this repo.

## 2. Tech stack

From `package.json` (exact ranges there; versions below are the declared ranges):

- **React** ^19.2.8 + **react-dom** ^19.2.8
- **Vite** ^8.3.0 with `@vitejs/plugin-react` ^6.1.1
- **Tailwind CSS** ^4.3.3 via `@tailwindcss/vite` (no `tailwind.config.js`; theme lives in
  `src/index.css` under `@theme`)
- **@emailjs/browser** ^4.4.1 — contact form
- **react-icons** ^5.7.0 — only `fa6` icons (GitHub, LinkedIn, envelope)
- **@vercel/analytics** ^2.0.1 — Web Analytics
- **gsap** ^3.15.0 (+ its ScrollTrigger plugin) — `/cdg`, `/sky-soarer` and the Home projects (The Catch) and events sections, lazy-loaded everywhere
- **oxlint** ^1.81.0 — linter (`.oxlintrc.json`)

No router library. No CSS-in-JS.

**Animation rule:** GSAP + ScrollTrigger are allowed anywhere on the site. Do not migrate existing
effects that already work (mascot, timeline line fill, reveals, card flip) without a reason. All
other performance rules (§7) still apply. GSAP is **never in the initial bundle**: it is only
reached through dynamic `import('gsap')` / `import('gsap/ScrollTrigger')`, and every page uses those
exact specifiers so Vite emits one shared pair of chunks (a visit to one page caches them for the
other). In `Cdg.jsx` (and the same loader copied into `SkySoarer.jsx`) the import starts after the window `load` event (`motion` promise; effects
set up GSAP in `motion.then`) — a static import cost mobile Lighthouse 97 → 94. On Home, `loadGsap()`
in `Home.jsx` starts it when the page is idle after `load`, or when the projects or events section comes
within 1.5 viewports, whichever is first. Existing Home effects stay on `scroll.js` + CSS — don't migrate.

## 3. How to run

```bash
npm install          # install
npm run dev          # Vite dev server, http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve dist/, http://localhost:4173
npm run lint         # oxlint
```

- Tests: none. Verification in this project has been done by driving a real browser
  (puppeteer-core against the installed Chrome) plus Lighthouse against `npm run preview`.
- Lighthouse runs used `http://localhost:4173/`, `http://localhost:4173/#/cdg` and `http://localhost:4173/#/sky-soarer`.
- Screenshots of a specific story chapter: `http://localhost:4173/#/cdg?ch=N` or `#/sky-soarer?ch=N` (see §5);
  of a Home project's catch moment: `http://localhost:4173/#/?catch=N` (N = 1–6, see The Catch in §5).

## 4. Architecture and folder map

```
index.html              icons, title, meta description, font <link>, preload of /me.webp,
                        and an inline script that preloads the hero image on #/cdg and #/sky-soarer only
src/
  main.jsx              startFavicon() + React root + <Analytics />
  App.jsx               hash router (`pages` table); lazy-loads /cdg and /sky-soarer; document.title per route
  scroll.js             the single rAF loop (onFrame / requestFrame)
  favicon.js            animated favicon (data-URI frames)
  index.css             Tailwind import, @theme, and every custom rule (~330 lines)
  components/
    Shell.jsx           page chrome: sky blobs, progress bar, mobile bar, mood; exports useReveal()
    ProfileCard.jsx     hero flip card (photo front / highlights back)
    Blob.jsx            the mascot, inline SVG
    Contact.jsx         EmailJS contact form
  pages/
    Home.jsx            all homepage content arrays + homepage scroll logic
    Cdg.jsx             ClinicalDenoiseGuard page: hero, evidence, problem, scroll story, findings
    SkySoarer.jsx       Sky Soarer game page: hero, worlds, hand → flight story, privacy, figures, build notes
public/
  favicon.svg           simplified mascot icon
  favicon-32.png        PNG fallback
  apple-touch-icon.png  180px
  me.webp me-200.webp   hero photo (400px / 200px)
  cdg/                  poster.webp (1400w) + poster-700/-500.webp, team-toronto.webp, team-kaust.webp
                        (/cdg's own; the events section uses public/events/ only)
  projects/sky-soarer/  the game's screenshots, <name>.webp (≤1400w) + <name>-700.webp (+ hero-500) — see §5
  events/               event photos, <slug>-<n>.webp (+ -700 variant), gdg-uj-1…4, kaust-1…3 — see §5
  robots.txt
photo-source/           original uncropped photos — gitignored, never published
                        (events/<slug>/, projects/sky-soarer/ = the game repo's docs/screenshots originals)
```

**Routing** (`src/App.jsx`): hash-based, no library.

- `#/cdg` and `#/sky-soarer` → the project pages (the `pages` table in `App.jsx`: component + title); anything else → home. Only `#/…` counts as a route, so in-page
  anchors (`#about`, `#projects`) keep working.
- Each project page is `lazy()` + `<Suspense>`, so it is a separate chunk (CDG ~7.6 kB, Sky Soarer ~9.9 kB gzipped) and the
  homepage bundle does not carry it. GSAP (27.4 kB) and ScrollTrigger (17.5 kB) are two further
  chunks that the page loads after `load`.
- Route change scrolls to top and swaps `document.title`. Project pages pass `barTrigger={160}` to `Shell` (no `.pc` there).
- Hash routing was chosen so any static host works with no rewrite rules.

**Where content lives** — all in `src/pages/Home.jsx`, top of file:
`socials`, `experience`, `education`, `certifications`, `projects`, `events`, `skills`, `sections`.
The CDG page's own content (`tags`, `findings` with their `figure`s, `plates`, story data
`REQUEST`/`SCAFFOLD`/`OUTPUT`/`STEERED`/`chapters`) is at the top of `src/pages/Cdg.jsx`.

## 5. How each system works

### Shared scroll loop — `src/scroll.js`
- One `requestAnimationFrame` loop for the whole page. `onFrame(cb)` subscribes and returns an
  unsubscribe; the first subscriber attaches the passive `scroll` and `resize` listeners.
- Subscribers: `Shell` (mood, progress fallback, bar threshold), `Home` (nav highlight, timeline
  item reveals), `ProfileCard` (flip fallback only).
- Rules: callbacks write to the DOM directly, never read layout, and never set React state per
  frame.

### Scroll-driven animations + rAF fallback
Where the browser supports scroll-driven animations, CSS does the work and JS is not involved:

- **Progress bar** — `.progress`, `animation-timeline: scroll(root)`; fallback sets `--progress`.
- **Timeline mascot + line fill** — `.timeline` declares `view-timeline: --tl block` with
  `view-timeline-inset: 72% 28%`, which collapses the scrollport to a line at 72% of the viewport.
  `.tl-cursor` translates by `var(--tl-h)` (the list height, set by `Home` on layout) and
  `.tl-fill` scales 0→1. Fallback writes both transforms per frame.
- **Profile card flip** — `.pc-inner`, `animation-timeline: scroll(root)`, range `0 25vh` on mobile
  and `0 70vh` at `lg`; fallback sets `--flip`.
- Feature detection: `CSS.supports('animation-timeline: scroll()' | 'view()')`. iOS Safari supports
  these from version 26; older iPhones take the fallback.

### Mascot — `src/components/Blob.jsx` + `.blob*` in `index.css`
- Inline SVG, 48×48 viewBox, no dependencies. `useId()` gives each instance its own gradient ids —
  duplicate ids break the fill.
- **Layer order matters** (bottom → top): ghutra → side folds → face circle → front drape → igal →
  eyes. The face is drawn *over* the cloth so the forehead stays visible, and the igal is drawn
  *last* so it sits on the cloth.
- **Igal rule:** it's a ring seen head-on, so it must read as a nearly straight, thick black band
  with ends slightly lower than the middle. A tall arc makes the whole thing read as headphones —
  this was re-done several times.
- **Cloth rule:** the cloth is the dominant shape. A thinner drape stops reading below ~28px. Three
  broad hem scallops; more blur at 20px.
- Three eye sets in the SVG (`eyes-normal`, `eyes-happy`, `eyes-surprised`), crossfaded by CSS.
- **Moods:** `Shell` sets `data-mood` on `<html>` — `happy` scrolling down, `surprised` scrolling
  up, back to `normal` 700ms after movement stops. Threshold is 2px and *accumulates*, so slow
  scrolling triggers it. Only elements with `.blob-react` react (mobile bar, timeline mascot,
  events route blob, The Catch's fisher); the
  card-back mascot does not.
- `.blob-calm` disables the idle bob and blink (used by the timeline and events route mascots).
- Instances: mobile bar (28px, reactive), card back (24px, idle), timeline cursor (22px, calm +
  reactive) — the timeline renders once per list — the events route blob (22px, calm +
  reactive) and the fisher in The Catch's boat (36px, reactive), so there are 6 on the homepage.
- **Favicon variant** is a separate, simplified drawing in `public/favicon.svg` and duplicated in
  `src/favicon.js`: no folds, no hem, no outlines — they turn to mush at 16px. Sky disc behind it so
  it reads on light and dark browser themes. **If the mascot changes, both copies must be updated.**

### Animated favicon — `src/favicon.js`
- Four faces (`normal`, `blink`, `sleep`, `happy`) built once at load as `data:image/svg+xml` URIs.
  Switching = one `link.href` assignment. No canvas, no per-frame work.
- Blink every 4–6s for 160ms. Tab hidden → `sleep` face and **every timer cleared**. Tab visible →
  `happy` for 2s, then back to normal blinking.
- Static (returns early) under `prefers-reduced-motion`.
- Measured cost: ~41ms of script per 20s idle; 0.0000s while hidden.

### Experience / Education timeline — `Timeline` in `src/pages/Home.jsx`
- Gray track (`border-l`), sky fill (`.tl-fill`), one travelling mascot (`.tl-cursor`).
- Items light up (`.lit`) when the 72% line passes them; `Home` walks a per-list pointer in the
  loop, which is arithmetic only.
- **Do not replace this with an IntersectionObserver:** an anchor jump can skip past items without
  firing an intersection, leaving them permanently invisible. This was tried and reverted.
- Under reduced motion the animations are switched off, the line shows full, the cursor is hidden
  and all items are visible.

### Profile card — `src/components/ProfileCard.jsx`
- A real `<button>`, so Enter/Space and focus styling come free; `aria-pressed` tracks the flip.
- Tap adds 180° on `.pc-tap`, which composes with the scroll flip on `.pc-inner`.
- One-time wobble on `.pc-wobble` 900ms after load, to hint it's interactive; "tap to flip" badge on
  the front only.
- Back face sizes its text with container query units (`cqw`) so it fits the 160px desktop card and
  the ~274px mobile one; below 130px wide only the first highlight shows.
- Desktop card is a fixed 10rem; short viewports tighten the column (`.sidecol`, `.sidenav`) instead
  of shrinking the card.

### Projects — "The Catch" — `Catch` / `catchTimeline` / `Fish` in `src/pages/Home.jsx`
- **Replaced the stacked project cards on purpose** (owner's explicit decision, Oct 2026): the old
  mobile sticky stack (`.stack`, `--s`, `--stack-h`) and the plain card list are gone. Content is
  unchanged (`projects` array; the new `fish` field is only the short name on each fish). Only CDG
  (`#/cdg`) and Sky Soarer (`#/sky-soarer`) have `href`; their card shows "Open the project →".
- **Scene** (all `aria-hidden`): above the water the cards surface one at a time (all six stacked in
  one grid cell, so the slot is as tall as the tallest card and nothing shifts); the Blob (36px,
  `blob-react`) in a small SVG boat on the waterline with a rod (separate SVG) whose tip is at
  `--lx` (58% of the stage); the fishing line (a fixed segment from the tip to the water, then a
  `scaleY` segment in the water) and an amber hook. Underwater: a `sky-100 → sky-700` gradient, a
  waving SVG line (`.catch-wave`, translateX loop), 4 rising bubbles (`.catch-bubble`), one SVG fish
  per project at `depthOf(i)` (18% → 84% of the water, each deeper) offset by `fishX[i]` % from the
  line, drifting (`.catch-drift`) with a white label, and a `DEPTH 0 m` meter (bottom-left, white
  mono). **Every position is a percentage of the water**, so the timeline uses `yPercent`/`xPercent`
  /`scaleY` on `inset: 0` layers and nothing is measured.
- **Story per project** (`STEP` = 4.7 timeline units): drop (hook layer `yPercent` + line `scaleY`
  to the fish's depth) → bite (the rig shakes once, a splash ring, the fish moves onto the line and
  turns nose-up, its label fades) → reel (hook, line and fish rise together to 0) → catch (fish
  scales/fades out, the card fades/scales in; label `catchN`; the Blob shows happy eyes) → hold 1.6
  (the longest) → release (card slides left and fades; the next drop overlaps). End beat: the line
  rests at 10% and "That's the catch for now." fades in (label `end`).
- **Happy at the catch:** the timeline sets `data-glad="1"` on `.catch-blob` (an `attr` set, so it
  reverses with scroll); a scoped rule in `index.css` shows `.eyes-happy` there. Otherwise the Blob
  follows `data-mood` as usual. `Blob.jsx` and its rules are untouched.
- **Depth meter:** the timeline's `onUpdate` reads the hook's `yPercent` and writes `DEPTH n m`
  (`DEPTH` = 50 m at the bottom) only when the number changes. No React state.
- **Mechanics:** wrapper `--n` (projects) × `80svh` (`65svh` at `lg`), CSS-sticky stage (`top:
  var(--bar-h)`, `calc(100svh - var(--bar-h))` below `lg`; `top: 0`, `100svh` at `lg`), full-bleed on
  phones (`-mx-6`), inside the right column on `lg` (not a full-screen chapter: the left column stays,
  scroll-spy keeps Projects active). The section has **no `.reveal`** (its transform would skew
  ScrollTrigger). One `gsap.matchMedia()` (`desktop`/`motion`/`reduce`, one of the last two always
  matches) with one timeline on one ScrollTrigger (`top top` → `bottom bottom`, `scrub: 0.5`);
  `labelsDirectional` snap on `lg` only, with **`inertia: false`** — with inertia, a Tab jump
  (instant scroll = huge velocity) was projected several catches further. Reverted on unmount.
  `ScrollTrigger.refresh()` after fonts + `load`. GSAP comes from the shared `loadGsap()`.
- **Before GSAP:** the pre-GSAP DOM is the timeline's start state (cards `motion-safe:opacity-0`,
  line `scaleY(0)`, hook at the surface, fish idle), so there is no jump when it takes over.
- **Idle animations** run only while the section is on screen: an IntersectionObserver toggles
  `.on` on `.catch`; otherwise `animation-play-state: paused`.
- **Reduced motion:** wrapper `h-auto`, stage static; the scene is a static illustration (water
  `h-56`) above a plain list of the white cards (`order-last`), each card with its small fish icon
  (the icon is in the card's `h3` in both modes); the end line follows the list. No timeline.
- **Accessibility:** a real `<ol>` of `<article>`s labelled by their `h3`, in reading order. Articles
  without a link are `tabIndex=0`; linked ones are reached by their link. On focus inside the list
  the page jumps (instant) to that project's `catchN`, so the focused card is the one on screen.
- **Fit:** checked at 360×740, 375×667, 390×844, 430×932, 1280×720, 1366×768 with no horizontal
  scroll. The tallest card (CDG / Laqta, ~330–350px at 375) leaves ~173px of water at 375×667;
  under `short` only the card padding drops to `p-5` — the scene (water) shrinks first, the card
  text never does. A longer description needs re-checking at 375×667.
- **QA helper:** `#/?catch=N` (N = 1–6) scrolls to project N's catch and freezes it (disables the
  trigger, pauses at `catch{N-1}`); under reduced motion it scrolls that card into view. Inert
  without the query; the router treats `#/?…` as home.

### Reveals
- `useReveal()` (exported from `Shell.jsx`) fades in `.reveal` sections and staggers `.tags` items.
- **Each page calls it itself.** A lazy page mounts after `Shell`'s effect has run, so observing
  from `Shell` missed the whole CDG page (it rendered at opacity 0). Do not move it back.

### `/cdg` page — `src/pages/Cdg.jsx`
The whole page reads as a **descent beneath the surface**: `±0.00 — SURFACE` hairline, then
numbered sections going down (`01`…`04`, depth `−01.00`…), then `±0.00 — BACK TO SURFACE`.

- **Hero ("Surface")** — meta strip (`RESEARCH · N°01` / `HIVE Lab · University of Toronto ·
  SUDS 2026`, the last part links the SUDS page), a three-line title (`Clinical / Denoise / Guard`,
  the h1 has the unsplit name as `sr-only`), the pitch as a lede with *hijacked?* in italic, tags,
  the "Best Poster, SUDS 2026" badge, and the poster as `PLATE 01 · POSTER` (rotated −2°, parallax
  drift). Mobile: title first, poster peeking below. `lg`: two columns.
- **Title reveal** is the CSS `.rise` keyframe in `index.css` (transform only, opacity stays 1,
  off under reduced motion) — **not GSAP**, because GSAP arrives after `load` and would flash.
- **`01 — Evidence`** ("Presented, *not just written.*") — the gallery plates with a spec-sheet
  `<dl>` under each (caption first, then Plate/Type/Place/Event).
  - Phones: a **native CSS scroll-snap strip** (`snap-x snap-mandatory`, 78% wide items, so the
    next plate peeks). The `02 / 03` counter is written by an IntersectionObserver (root = the
    strip, threshold 0.6) straight to the DOM — no JS scrolling, no React state.
  - `lg`: two plates side by side, the second offset lower (`lg:mt-32`), each drifting with scroll.
  - **One data array, `plates`:** `plates[0]` is the hero poster, the rest are the gallery. Plate
    numbers and the counter derive from it, so a new photo is one new entry. Each photo appears
    once on the page. Future option: with ≥4 gallery plates, desktop could switch to a GSAP
    horizontal scroll (CSS-sticky pin, like the story). Not built.
- **`02 — The problem`** — first sentence as a pull line, the rest as body, and a margin note
  (`Note · DIJA`, Wen et al., 2025, arXiv link). The note is a citation only; no new wording.
- **`03 — Beneath the output`** — the scroll story (next section), unchanged apart from its label.
- **`04 — What we found`** — three numbered stages, each topped by a figure quoted from its own
  body (`5%`, `~30%` for "roughly 30%", `~97%`), then the card title and body verbatim. Figures count
  up once on entry (GSAP `textContent` + `snap`, landing on the markup value) and are `aria-hidden`.
  Mobile: stacked on a thin line; `lg`: three columns. Then the takeaway as a large statement with
  *detection-gated containment* in italic.
- **Footer** — `±0.00 — BACK TO SURFACE`, "Paper in preparation", "← Back to home" (also at top).
- **Lightbox:** every plate is a `<button>` that opens the native `<dialog>` (`.lightbox`) with that
  photo. The dialog `<img>` has **no `src` until opened** — an eager full-size poster download there
  competed with the LCP image.
- **Hero poster = LCP.** Not lazy, `fetchpriority="high"`, `srcset` 500/700/1400w with
  `sizes="(min-width: 1024px) 24rem, 68vw"`, and preloaded from `index.html` on `#/cdg` loads —
  **keep that preload's srcset/sizes identical to the `<img>`**.
- **Animations** other than the story live in **one `gsap.matchMedia()`** in `Cdg()` (drift,
  count-up), reverted on unmount; reduced motion gets none of them. After fonts and images load,
  it calls `ScrollTrigger.refresh()`. Images reserve space with width/height + `aspect-ratio`.
- **Attribute names are shared:** story and page effects both query by `data-*` inside the page.
  `data-count` belongs to the story's chapter counter; the findings use `data-countup`. A clash
  here once turned "03 / 06" into "3 / 06".
- **The story is entirely static** — fixed numbers, no model, no API. Its disclaimer ("Illustrative
  example with fixed numbers…") sits above the stage and must keep saying so.
- Filled blanks are **redacted placeholders in brackets** — never write real unsafe instructions.
- Research sentences on this page must stay **word for word**; layout may split and restyle them.

### `/cdg` scroll story ("Beneath the Output") — `Story` / `Stage` / `story()` in `Cdg.jsx`
- One example (the DIJA template attack), told by scrolling alone — no controls.
- **Structure:** `[data-story]` is a `600svh` wrapper; inside it a **CSS `position: sticky`** stage
  (`top: var(--bar-h)`, `height: calc(100svh - var(--bar-h))` below `lg` so it clears the mini bar;
  `top: 0; height: 100svh` at `lg`). Not a ScrollTrigger `pin` — CSS sticky is steadier on iOS.
- **One ScrollTrigger** on the wrapper (`start "top top"`, `end "bottom bottom"`, `scrub: 0.6`)
  drives one timeline built by `story(root)`. Labels `ch1`…`ch6` mark each chapter's settled state;
  each label is followed by a flat **hold** (longest at ch3). Desktop (`lg`) also snaps
  (`labelsDirectional`); phones don't snap and rely on the holds.
- `ScrollTrigger.config({ ignoreMobileResize: true })`; `ScrollTrigger.refresh()` after
  `document.fonts.ready` (and again from the page effect after images load; images above the stage
  have reserved sizes, so chapter positions don't move).
- The "Try the idea" **section has no `.reveal`** (its `translateY` would skew ScrollTrigger's
  measurements); only its heading block does.
- **Chapters:** 1 request only · 2 scaffold slides in · 3 gauge to 5%, outputs all masked, probe
  bar to 99% + "Injection detected" · 4 gauge 5→100%, tokens reveal one by one (bracketed = rose) ·
  5 "Steering applied", steps 1 and 3 crossfade to safe text, step 2 stays rose · 6 rose shutter
  (`scaleY` from the top) "Flagged by probe: response held for review.", caption = the takeaway.
- **Stage layout:** meta strip (`SAMPLE 01 · LLaDA-8B · DIJA`, chapter counter), depth gauge
  (ticks 0/5/10/20/35/50/100 evenly spaced, 5 emphasised; the marker is an `inset: 0` layer moved by
  `yPercent`, so no measuring), prompt + amber scaffold (a block `<mark>` with flex-wrap, so it
  never fragments), probe meter (`scaleX`), output, caption. Fits 360×740 with nothing below the
  fold.
- **Rendering rules:** every state is in the DOM from the start — each output word sits in place at
  opacity 0 with its mask chip absolutely on top; steering is two layers in one grid cell
  (`grid-area: 1/1`); captions, counter, pill and score are stacked the same way. The timeline only
  touches `transform`/`opacity`. No React state during scroll, no text swapping, nothing shifts.
- **Cleanup/variants:** everything is created inside `gsap.matchMedia()` scoped to the component
  and reverted on unmount. Its conditions are `desktop`, `motion` and `reduce` — **one of
  motion/reduce must always match**, because gsap.matchMedia skips the callback when no condition
  matches (that bug left phones with no animation at all).
- **Reduced motion:** the sticky wrapper is `motion-reduce:hidden` and a storyboard of six cards
  (`[data-card]`) shows instead; each card runs `story(card)` paused at its label, so it shows that
  chapter's final state. No sticky, no scrub.
- **Accessibility:** the stage and storyboard are `aria-hidden`; an `sr-only` `<ol>` describes the
  six chapters in plain text. No `aria-live`.
- **QA helper:** `#/cdg?ch=N` (N = 1–6) scrolls to chapter N and freezes it there (disables the
  trigger and pauses the timeline at `chN`) — for screenshots. Inert without the query; the router
  ignores it (`startsWith('#/cdg')`).

### `/sky-soarer` page — `src/pages/SkySoarer.jsx`
The game page reads as a **climb** ("Flight Log", echoing the game's own landing, "The Ascent"):
`ALT 0 m — GROUND` hairline, numbered sections going up, then `ALT 5,000 m — ABOVE THE CLOUDS`.

- **The game repo (`lvbfront/Sky-Soarer`) is private.** No rendered page may link to it (not
  /sky-soarer, not the Home events stop, nowhere); link the live game
  (`https://sky-soarer-3d-game.vercel.app/`) instead. Reading it needs git access to that private repo
  (e.g. an authenticated `gh repo clone lvbfront/Sky-Soarer`); without it, use only the facts already
  recorded in this section and in the code's data arrays (each notes its source section).
- **Facts come only from the game repo**: its `CLAUDE.md` (and, for the
  tagline-level copy, its code). Each data array notes its section (§1, §2, §3, §5, §6.3, §6.12, §12,
  §13). The unit-test count (307) is the latest run recorded in its §3 — re-read it there when the game
  changes; no other source. `PLAY_URL` is `https://sky-soarer-3d-game.vercel.app/` (given by the owner;
  not recorded in the game repo); "Play it →" (hero and footer) renders only when it is non-empty.
- **Altitudes:** labels are `NN — ALT m · NAME` (`Label`): 01 300 m, 02 1,200 m, 03 3,000 m (the game's
  real chapter altitudes), 04 4,000 m and 05 4,500 m (decorative), footer 5,000 m. Every label (and the
  header/footer) carries `data-alt`.
- **Altimeter:** phones get a fixed `ALT 0 m` pill **inside the mini bar's band** (left of its mascot,
  `z-[45]` over the bar's 40, under the progress bar's 50). It is visible only while the bar is on: a
  `[.minibar:not(.on)~main_&]:opacity-0` variant (Shell renders `.minibar` before `<main>`; Shell is
  untouched), fading in 350 ms late so the bar has finished sliding down. Section labels only reach that
  band once the opaque bar is on, so the pill can never cover a label (checked by scrolling the page in
  20 px steps at 360/375/390/430 px: the pill was always inside the bar); `lg` gets a fixed rail at the right
  edge (ticks = `ALTS`, evenly spaced; marker in an `inset: 0` layer moved by `translateY %`). One
  ScrollTrigger (`start 0`, `end max`, created in `mm.add('all')`, so it reverts on unmount) measures each
  `[data-alt]` reaching 60% of the viewport **on refresh only**, then interpolates piecewise per scroll:
  text written only when it changes (rounded to 10 m), marker transform. Decorative, `aria-hidden`.
- **Hero ("Takeoff")** — meta strip, `SKY / SOARER` with the `.rise` reveal (sr-only "Sky Soarer" in the
  h1), «محلّق السماء» (`lang="ar" dir="rtl"`), the §1 description as the lede, tags, "Play it →" (only if
  `PLAY_URL`, new tab; no "Source" link: the repo is private), the desktop/webcam note (§6.18), and the hero screenshot as
  `PLATE 01` (−2°, drift). **Hero image = LCP:** not lazy, `fetchpriority="high"`, `srcset`
  500/700/1400w, `sizes="(min-width: 1024px) 28rem, 86vw"`, preloaded from `index.html` — keep both
  identical.
- **`01 — The worlds`** — birds/worlds/skies as a `<dl>`, the shemagh line (`<bdi lang="ar">` keeps the
  bidi right), then the gallery: same as /cdg Evidence (scroll-snap strip + IO counter on phones,
  staggered 2-column drift at `lg`, spec `<dl>`s). **One array, `plates`:** `[0]` hero, last = the
  calibration screen (in Privacy), the rest the gallery.
- **`02 — Hand → flight`** — the scroll story, same technique as /cdg (`Story`/`Stage`/`story()`): 600svh
  wrapper, CSS-sticky stage, one scrubbed timeline with labels `ch1`…`ch6` and flat holds (longest at ch5,
  the backflip), `labelsDirectional` snap on `lg` only, the `motion`/`reduce` matchMedia, a storyboard of
  six static cards under reduced motion, `aria-hidden` stage + an `sr-only` list, and the QA helper
  `#/sky-soarer?ch=N`. Visual: an SVG hand of the 21 MediaPipe landmarks (`OPEN`/`FIST` point sets
  crossfaded; the palm landmarks 0/5/9/13/17 and the computed palm centre), the calibrated box with 5
  reticles, and a side-view bird that pitches (ch3), barrel-rolls (`scaleY` −1, ch4), backflips (−360°
  with a dashed loop, ch5) and flares for the brake (ch6, the hand scales 1.25× = the real engage ratio).
  Captions, HUD readouts, counter and badges are `[data-…]` stacks in one grid cell. Disclaimer above:
  "Schematic illustration. The thresholds are the game's real constants."
- **`03 — Privacy by design`** (§1, §12), **`04 — Under the hood`** (figures `307 / 0 / 3 / 2` count up via
  `data-countup`, same as /cdg; the stack as tags), **`05 — How it was built`** (Replit + Replit Agent →
  GitHub → Claude Code: branch → PR → Vercel preview → merge; the GDG On Campus | UJ workshop).
- **Lightbox, drift, count-up, refresh after fonts/images:** same as /cdg, in one `gsap.matchMedia()`.
- **Media:** originals in `photo-source/projects/sky-soarer/` (copied from the game repo's
  `docs/screenshots/`: landing, shemagh, ring-guidance, ocean, desert, hand-controls); exported with the
  §5 photo convention to `public/projects/sky-soarer/` (+ `hero-500.webp` for the srcset).
- **Shared code:** Label/Hairline/Plate/Stack and the GSAP loader are small copies of the /cdg ones —
  `Cdg.jsx` was deliberately left untouched.

### Events & Competitions ("The Route") — `Events` / `Leg` / `Stop` / `Photo` in `src/pages/Home.jsx`
- Between Projects and Skills; `events` is in `sections`, so the desktop nav and scroll-spy include
  it. There is no heading above the stage: the **first spread of the track is the heading** (mono
  `On the road`, big `h2` "Events & Competitions", a `scroll →` / `swipe →` hint). The section has
  no `.reveal` (a transform would skew ScrollTrigger); `scroll-mt` lands anchor jumps on the stuck
  stage.
- **Open layout, no cards:** each event is a spread floating on the page background (no white,
  border or shadow). Phones: `88cqw`, photo above text. `lg`: `62cqw` (SUDS `wide` → `70cqw`), photos
  and text side by side, title `text-4xl`, description `text-xl`. Gaps `8cqw` / `9cqw`. Each spread
  is vertically centred (`my-auto`) above its dot. The end stop ("More stops soon") is large, quiet
  `slate-500` type.
- **Data — `events` array.** Only `title` is required; every other field renders only if present
  (empty strings count as absent): `date`, `place`, `organizer` (joined as the mono meta line above
  the photos), `label` (mono kicker), `result` (badge), `project`, `line`, `tags`,
  `link: { label, href }`, `images`, `wide` (a wider spread on `lg`), `stop` (overrides the city
  label under the dot, e.g. `Toronto → KAUST`). `images` holds 1–4 entries:
  `{ src, w, h, alt, srcSet?, pos? }` or `{ placeholder: true }`. `pos` is an object-position class
  that replaces the default crop focus for a photo whose subject sits on an edge (kaust-1 uses
  `object-right-top`: the logo is in its top-right corner, so 4:3 slots trim the left and 2:1 slots
  trim the bottom seats). The first is the main photo (full width,
  4:3). **One extra** sits smaller (`w-2/5`) offset over its bottom-right corner. **Two or three
  extras** (`row` in `Stop`) form a row of equal 4:3 photos (white ring), each ≈⅓ of the main
  photo: on phones a plain row under it (no overlap, and the gap above the text is 8px shorter so
  it fits 360×740), on `lg` straddling its bottom edge (`translate-y-1/2`, `mb-[12%]` reserves the
  overhang); the spread's photo column also gets more of the width (`1.7fr` vs `1.2fr`). Use
  `wide: true` with a photo row. Pick the main photo so the row doesn't cover anyone's head.
  `link` hrefs starting with `http` open in a new tab.
- **Short phones — the `short` variant** (`@custom-variant` in `index.css`: below `lg` and
  `max-height: 760px`, e.g. iPhone SE 375×667, 360×740). There a phone leaves only ~520–600px above
  the route, and the tallest spreads (X-thon, GDG) used to push their dot and city label below the
  stage. Under `short`, in this order: photos go 2:1 (focus 50% 45% so heads stay in frame), the
  spread's row gap 20→12px, then the title `text-xl` and the description 15px `leading-snug`. The
  description and link are never cut. Tall phones and desktop are pixel-identical (every `short:`
  rule sits inside that media query). Headroom: X-thon 510/523px at 375×667. A longer description
  on a stop may need re-checking at 375×667 — every spread plus its dot must fit. Placeholder plates are pure CSS (sky gradient, camera icon, "Photo coming
  soon"). Visionthon's `line` reads the Recyclable Materials Classifier project's description, so
  the two stay in sync. A stop with no images is the end spread.
- **Structure:** a wrapper (`--dist` + one stage height tall) holding a **CSS `position: sticky`**
  stage (`top: var(--bar-h)`, `height: calc(100svh - var(--bar-h))` below `lg`; `top: 0; 100svh` at
  `lg`) with the horizontal track inside. Same technique as the `/cdg` story; not a ScrollTrigger pin.
  The stage is a size container (widths in `cqw`). Phones: full-bleed via `-mx-6`/`md:-mx-12`.
- **Full-screen chapter (`lg`):** the stage breaks out of the right column with negative margins
  `--bl`/`--br` (the wrapper's distance to the viewport's left/right edge, measured), so it spans
  exactly `clientWidth` — no `100vw`, no horizontal page scroll. While the ScrollTrigger is active,
  its `onToggle` sets **`data-chapter` on `<html>`**; `.sidecol` then fades out (300ms opacity,
  `pointer-events: none`, `visibility: hidden` after the fade so it can't be focused) and fades back
  in on release in either direction. A state toggle, not per-frame work, so the transition is fine.
  The heading and end spreads are exactly the right column's width, the track's padding is
  `--bl`/`--br`, and the end spread has an extra `--bl` margin — so at the stick and release points
  content sits only where the right column is, and the previous spread is off-screen. Outside the
  chapter `.events-stage` is clipped to `inset(0 0 0 var(--bl))`, so the route line never runs
  under the visible left column. Nothing changes layout, so scroll positions never jump. Phones keep
  the slim top bar (the attribute is set there too, but the CSS is `lg`-only).
- **Measurement (no GSAP):** a ResizeObserver on the track sets `--bl`/`--br` and `--dist`
  (track − stage width) on the wrapper, and `--r0`/`--rw` (first dot centre, first→last dot span) on
  the track. It then dispatches a `resize` event so `Home`/`Shell` re-measure the sections below, and
  refreshes ScrollTrigger if loaded. Layout is final before GSAP arrives; until then the stage shows
  the heading spread.
- **Motion:** one `gsap.matchMedia()` with `motion`/`reduce` conditions (one always matches). Motion:
  one timeline on one ScrollTrigger (`start "top top"`, `end "bottom bottom"`, `scrub: 0.5`,
  `invalidateOnRefresh`, `onToggle` → `data-chapter`): track `x` → `-(track − stage)`, route fill
  `scaleX` 0→1, blob `x` → route span, all `ease: "none"`. Breakpoints need no branch (CSS + function
  values). The cleanup removes `data-chapter`; everything is reverted on unmount (the /cdg round trip
  works). `ScrollTrigger.refresh()` after fonts + `load`.
- **Route:** a gray line along the bottom of the stage across the whole track (on `lg` inset by
  `--bl`/`--br`), a sky fill from the first dot (under the heading) to the blob, a dot and mono city
  label under each spread, and the Blob (22px, calm + reactive, white disc) riding the fill's tip.
  The heading and end spreads mirror each other, so the blob stays fixed on screen (centre of the
  right column on `lg`, centre of the screen on phones) while the road moves under it and each dot
  passes beneath it. All `aria-hidden`.
- **Reduced motion:** wrapper `h-auto`, stage `static`, a full-width native `snap-x` swipe strip; no
  timeline, fill hidden, blob parked on the first dot. On `lg` the left column is hidden while the
  strip is on screen: a plain ScrollTrigger (`top bottom` → `bottom top`, same `onToggle`) — GSAP is
  already loaded by then, so no separate IntersectionObserver is needed.
- **Accessibility:** a `<section>` labelled by its `h2`; each event is an `<article tabIndex=0>`
  labelled by its `h3`. On focus inside the track, the page scrolls to where that spread is centred
  in the stage (motion only — the swipe strip scrolls itself).
- **Photo convention:** originals go in `photo-source/events/` (gitignored). Export each to
  `public/events/<slug>-<n>.webp` at max 1400px wide plus a ~700px variant `<slug>-<n>-700.webp`,
  then replace the stop's `{ placeholder: true }` with
  `{ src: '/events/<slug>-<n>.webp', srcSet: '/events/<slug>-<n>-700.webp 700w, /events/<slug>-<n>.webp 1400w', w, h, alt }`.
  Images are 4:3 `object-cover` (focus 50% 60%), lazy, with width/height set.
  **One folder per event:** all of an event's originals live together in `photo-source/events/<slug>/`
  (gdg-uj, kaust). The KAUST folder also holds a copy of the original behind `/cdg/team-kaust.webp`
  (`team-kaust-original.jpeg`); `/cdg` still uses its own file, and the events stop uses
  `kaust-2.webp`, exported from that copy, so the photo is published twice on purpose — one per
  page. If a photo's subject runs edge to edge, export a full-width band no wider than 4:3 (so the
  4:3 slots never crop the sides), placed so the short-phone 2:1 crop (focus 45%) only trims sky and
  ground — kaust-3, the "I love KAUST" sign, is the 1206×906 band from y=515 of the original.
  Exports so far were made with the already-installed ImageMagick (no npm dependency):
  `magick <in> -auto-orient -strip -resize '1400x>' -quality 78 <out>.webp` (and `'700x>'` for the
  variant); `-strip` removes EXIF/GPS (check with `webpinfo`: only a `VP8` chunk). macOS screenshot
  names contain a narrow no-break space before "PM" — use globs, not typed names. Alt texts describe
  what is visible; never guess names.

### Contact form — `src/components/Contact.jsx`
- `@emailjs/browser`; service id, template id and public key are inline in that file. The public key
  is meant to be public. Do not add a private key to the client.
- **EmailJS "Use Private Key" must stay OFF** for the service — browser calls fail when it is on.
  **(verified — the failure happened in an earlier session with it switched on.)**
- **Gmail "Invalid grant" lesson (verified):** the dashboard can still say "Connected" while Google
  has revoked the token. Symptom: HTTP 412 `Gmail_API: Invalid grant`. Fix: disconnect, revoke
  EmailJS at `myaccount.google.com/permissions`, reconnect and **tick "Send email on your behalf"** —
  leaving it unticked gives HTTP 412 `insufficient authentication scopes`. A fresh service was
  created to resolve it; the old one can be deleted.
- Errors are logged to the console and surfaced as a generic failure message; `aria-live` announces
  status.

## 6. Design language

- **Section labels (`/cdg`, `/sky-soarer`):** one system (Sky Soarer shows altitudes, `NN — 300 m · NAME`) — `Label` in `Cdg.jsx`: monospace 11px, uppercase,
  `sky-700`, `NN — NAME`, a hairline, and a decorative depth `−NN.00` (`aria-hidden`). It renders
  the section's `h2` unless the section has its own heading (Evidence). Headings are bold with one
  italic accent phrase. `Hairline` draws the `±0.00` surface lines.
- **Palette:** white → `sky-50` page background, `slate-800` headings, `slate-600` body,
  `sky-700` accents, `sky-100` borders.
- **Contrast rule:** `sky-500`/`sky-600` text fails AA on white. Links, tags, pills and buttons use
  **`sky-700`** (or darker). `sky-500`/`600` are only for non-text: dots, lines, rings, hovers.
- **Font:** Plus Jakarta Sans from Google Fonts, loaded **non-blocking**
  (`media="print"` + `onload`, with a `<noscript>` fallback) — a blocking font link cost ~1.2s of
  FCP. Set as `--font-sans` in `@theme`.
- **Cards:** white, `rounded-2xl`, `border-sky-100`, shadow only on hover (lighter below `lg`).
- **Layout:** desktop (`lg+`) is two columns — a sticky left column (name, card, title, intro, nav,
  socials) and a scrolling right column. Mobile is one column: name → profile card → title → intro,
  with a sticky top bar appearing once the hero card leaves the screen.
- Accessibility baseline to keep: AA contrast, visible focus rings, keyboard-navigable controls,
  `prefers-reduced-motion` honoured everywhere.

## 7. Performance rules (and why)

Targets: Lighthouse ≥95 on every route. **Sky Soarer PR measurements (this machine, Lighthouse from the
npx cache, simulated throttling):** home 100 (mobile + desktop, unchanged); `/sky-soarer` mobile
94/100/96/100 (LCP 3.1 s, the hero image; the image itself lands early, the delay is the main bundle →
page chunk waterfall), desktop 100/100/96/100; `/cdg` on an unmodified `main` build measured 91 mobile in
the same run, so this environment reads lower than the figures below. Home JS 85.06 → 85.25 kB gz, CSS
10.24 → 10.69 kB gz (the page's utilities in the shared stylesheet); SkySoarer chunk 9.9 kB gz; GSAP and
ScrollTrigger chunks shared with /cdg and Home (same files). **The Catch PR:** home 100/100/96/100 mobile and
desktop (LCP 1.7 s / 0.43 s, CLS 0, TBT 0); Home JS 85.26 → 87.29 kB gz, CSS 10.84 → 11.37 kB gz; GSAP and
ScrollTrigger chunk hashes unchanged. Current (local preview): home 100/100/96/100; `/cdg`
mobile 97–98/100/96/100 (LCP ≈2.3–2.4s, the hero poster), desktop 100/100/96/100. Home JS
≈84.0 kB gzipped (81.6 before the events section); CDG chunk ≈7.6 kB + GSAP 27.4 kB + ScrollTrigger 17.5 kB (both after `load`).

Rules learned the hard way — breaking these caused real regressions:

1. **No CSS transition on a scroll-linked transform.** A 150ms transition on `.tl-cursor` made the
   mascot permanently chase the page. Transitions are for the expression only.
2. **One rAF loop.** Two loops (Shell + Home) wrote in different frames. (GSAP's ticker is a
   second loop, but it only drives the GSAP effects: the project pages, The Catch and the events track.)
3. **No React state per frame.** `setActive`/`setShowBar` only fire when the value changes.
4. **No layout reads inside the loop.** Section tops, list geometry and card offsets are cached in
   `measure()` and recomputed on resize / after fonts load. The loop is arithmetic plus writes.
5. **No `backdrop-filter` on the mobile bar.** Blurring a fixed layer over a scrolling page was the
   single biggest phone cost — at 20× CPU throttle, removing it (with the other fixes) took frame
   p95 from 50.1ms → 17.6ms, worst frame 83.4 → 17.7ms, dropped frames 27 → 0, style recalc
   1.656s → 0.046s.
6. **Lighter effects below `lg`:** one still gradient instead of three drifting ones, smaller card
   shadow.
7. **Prefer CSS scroll-driven animations** over JS for anything scroll-linked; keep the rAF fallback.
8. **Images:** WebP only, explicit `width`/`height`, `loading="lazy"` below the fold. The hero photo
   is preloaded with `imagesrcset`.
9. **Minifier gotcha:** write `-webkit-backdrop-filter` *before* the standard property — Lightning
   CSS keeps only the last of the pair, and the prefixed one alone does nothing in Chrome.

**Decision on the remaining iPhone jank:** do **not** disable the mobile effects to chase it. The
scroll-linked animation path no longer touches JavaScript on supported browsers; if it is still not
perfectly smooth on a real iPhone, accept it rather than stripping the flip card or travelling
mascot. (Remaining suspects if it is ever revisited: the 3D flip with its shadow, and the fixed bar
over a scrolling page. The stacked cards are gone — replaced by The Catch.)

## 8. Conventions

- **Git author** is set **repo-locally** to `Lvb99 <141593549+lvbfront@users.noreply.github.com>`
  (GitHub's noreply address, so the personal email stays out of history). Don't change it, don't set
  a global one.
- **`.gitignore`** covers: logs, `node_modules`, `dist`/`dist-ssr`, `*.local`, editor dirs,
  `.DS_Store`, `.env` and `.env.*`, and `photo-source/` (original uncropped photos — they contain
  people and UI chrome that shouldn't be published).
- **`dist/` is never committed.** Vercel builds from source.
- **Screenshot branches (`pr-assets/*`) must contain a `vercel.json` with
  `{"git":{"deploymentEnabled":false}}`.** Without it, Vercel tries to build the branch (it has no
  app) and emails a failure.
- **Vercel auto-deploys from `main`.** Web Analytics is enabled in the dashboard; `<Analytics />`
  renders in `src/main.jsx`. In local `preview` it 404s on `/_vercel/insights/script.js` — expected,
  and it drops local best-practices to 96.
- **No secrets in the repo.** EmailJS public ids live in `src/components/Contact.jsx` and are
  public by design; never add a private key.
- Prompts to Claude Code are written in English.
- **Ask before large redesigns** or before deleting existing features.

## 9. Workflow

- One task = one Claude Code session = one PR.
- Test on the Vercel Preview deployment for that PR (a real phone is the only way to judge scroll
  smoothness — local Chrome and CPU throttling do not model iOS Safari's compositor).
- Merge the PR before starting the next session, so `main` is always the base.
- **Every session updates this file before opening its PR.**
- Commit messages: imperative, plain, no scope prefixes (see `git log`).
- Verify claims in the browser before reporting them. Several bugs here were found only because
  screenshots were checked after the change (the invisible CDG page, unrevealed timeline items).

## 10. Known issues and tech debt

- **AUC wording is inconsistent.** `src/pages/Home.jsx` says "≈0.96 AUC" (experience entry and the
  CDG project card) while `src/pages/Cdg.jsx` says "near-perfect AUC". **The owner decides** which
  is correct; then make both match.
- **Preload `imagesizes` mismatch:** `index.html` preloads `/me.webp` with
  `imagesizes="(min-width: 1024px) 160px, 70vw"`, but `ProfileCard.jsx` uses `sizes="… 80vw"`. Same
  candidate wins today, so it's cosmetic, but they should agree.
- **Mascot drawing is duplicated** in `Blob.jsx` and `favicon.js` (plus `public/favicon.svg`).
  A change to the face means editing all three.
- **`public/apple-touch-icon.png` is 43 kB** for a 180px icon — could be optimised.
- No tests and no CI. Lint is not run automatically.
- `.DS_Store` files exist locally (gitignored).
- **Prose on `/cdg` was written by Claude from the owner's brief** and describes real research —
  it should be re-read by the owner whenever it changes.
- iPhone scroll smoothness is not fully verified from this machine; all numbers are Chrome +
  CPU throttling. This includes the `/cdg` scroll story, The Catch, the Home events track, and iOS
  address-bar show/hide behaviour.
- **`/cdg` has a 0.03–0.06 CLS from the web-font swap**: when Plus Jakarta Sans lands, the glyphs
  of the huge title and the lede move within their boxes (box heights don't change, and it happens
  with animation off too). It was ~0.04 on `main` before the redesign. Still "good" (<0.1). Fix if
  wanted: a metric-matched fallback `@font-face` (`size-adjust` / `ascent-override` over Arial)
  in `--font-sans`, a site-wide change.

## 11. Open items / improvement list

1. **Resolve the AUC wording** (owner decision) and make Home and `/cdg` consistent.
2. **Confirm the production URL** and record it in §1; check Web Analytics is receiving data and
   that best-practices is back to 100 on the deployment.
3. Consider updating the CDG card blurb on the homepage to match the sharper framing of the write-up
   (detection easy / correction hard).
4. Fix the `imagesizes` / `sizes` mismatch.
5. Shrink `apple-touch-icon.png`.
6. Factor the mascot into one source of truth if it changes again.
7. Optional: add `og:`/`twitter:` meta tags and a small OG image for link previews.
8. Optional: a lightweight CI (`npm run build && npm run lint`) on pull requests.
