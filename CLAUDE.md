# CLAUDE.md

Project memory for Claude Code. Read this first. Keep it true to the code — update it in the same
session as any change it describes.

## 1. Overview

- **Owner:** Abdullah Bukhari (AB) — AI Engineer: LLMs, Computer Vision & AI Agents.
  GitHub [lvbfront](https://github.com/lvbfront).
- **What this is:** a single-page personal portfolio plus one project write-up page. Content is
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
- **oxlint** ^1.81.0 — linter (`.oxlintrc.json`)

No animation library. No router library. No CSS-in-JS.

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
- Lighthouse runs used `http://localhost:4173/` and `http://localhost:4173/#/cdg`.

## 4. Architecture and folder map

```
index.html              icons, title, meta description, font <link>, preload of /me.webp
src/
  main.jsx              startFavicon() + React root + <Analytics />
  App.jsx               hash router; lazy-loads the /cdg page; sets document.title per route
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
    Cdg.jsx             ClinicalDenoiseGuard write-up + the static demo
public/
  favicon.svg           simplified mascot icon
  favicon-32.png        PNG fallback
  apple-touch-icon.png  180px
  me.webp me-200.webp   hero photo (400px / 200px)
  cdg/                  poster.webp, team-toronto.webp, team-kaust.webp
  robots.txt
photo-source/           original uncropped photos — gitignored, never published
```

**Routing** (`src/App.jsx`): hash-based, no library.

- `#/cdg` → the project page; anything else → home. Only `#/…` counts as a route, so in-page
  anchors (`#about`, `#projects`) keep working.
- The project page is `lazy()` + `<Suspense>`, so it is a separate chunk (~4.7 kB gzipped) and the
  homepage bundle does not carry it.
- Route change scrolls to top and swaps `document.title`.
- Hash routing was chosen so any static host works with no rewrite rules.

**Where content lives** — all in `src/pages/Home.jsx`, top of file:
`socials`, `experience`, `education`, `certifications`, `projects`, `skills`, `sections`.
The CDG page's own content (`tags`, `findings`, demo `tabs`) is at the top of `src/pages/Cdg.jsx`.

## 5. How each system works

### Shared scroll loop — `src/scroll.js`
- One `requestAnimationFrame` loop for the whole page. `onFrame(cb)` subscribes and returns an
  unsubscribe; the first subscriber attaches the passive `scroll` and `resize` listeners.
- Subscribers: `Shell` (mood, progress fallback, bar threshold), `Home` (nav highlight, timeline
  item reveals, stacked cards), `ProfileCard` (flip fallback only).
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
  scrolling triggers it. Only elements with `.blob-react` react (mobile bar + timeline mascot); the
  card-back mascot does not.
- `.blob-calm` disables the idle bob and blink (used by the timeline mascot).
- Instances: mobile bar (28px, reactive), card back (24px, idle), timeline cursor (22px, calm +
  reactive) — the timeline renders once per list, so there are 4 on the homepage.
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

### Stacked project cards (mobile only)
- `.stack > li` are `position: sticky` with increasing top offsets below `--bar-h`, so they stack.
- `Home` writes `--s` (scale down to 0.94) as the next card covers one, computed from cached
  geometry, and only when the value changes.
- All cards get an equal `--stack-h` so a taller card never peeks out under a shorter one.

### Reveals
- `useReveal()` (exported from `Shell.jsx`) fades in `.reveal` sections and staggers `.tags` items.
- **Each page calls it itself.** A lazy page mounts after `Shell`'s effect has run, so observing
  from `Shell` missed the whole CDG page (it rendered at opacity 0). Do not move it back.

### `/cdg` page — `src/pages/Cdg.jsx`
- Sections: hero, The problem (links the DIJA paper, arXiv 2507.11097), What we found (3 cards),
  the demo, gallery, then "Best Poster, SUDS 2026 · Paper in preparation".
- **The demo is entirely static** — fixed numbers, no model, no API. Its labelling says so, and it
  must keep saying so.
- Three tabs share one identical request; only the wrapper changes (none / DIJA scaffold / held-out
  format). Mask chips render as `mask` pills with `aria-label="masked token"`.
- A 6-frame denoising stepper (5/10/20/35/50/100%) reveals output tokens progressively while the
  probe score is already high at 5% — that is the point the page makes.
- Three-way intervention control: none / steering (partial fix, one step stays redacted) /
  detection-gated (output withheld).
- Filled blanks are **redacted placeholders in brackets** — never write real unsafe instructions.
- Poster opens full size in a native `<dialog>` (`.lightbox`).
- Autoplay is suppressed under `prefers-reduced-motion` (manual stepping only).

### Contact form — `src/components/Contact.jsx`
- `@emailjs/browser`; service id, template id and public key are inline in that file. The public key
  is meant to be public. Do not add a private key to the client.
- **EmailJS "Use Private Key" must stay OFF** for the service — browser calls fail when it is on.
  **(unverified — not reproduced in this repo's history; treat as a standing instruction.)**
- **Gmail "Invalid grant" lesson (verified):** the dashboard can still say "Connected" while Google
  has revoked the token. Symptom: HTTP 412 `Gmail_API: Invalid grant`. Fix: disconnect, revoke
  EmailJS at `myaccount.google.com/permissions`, reconnect and **tick "Send email on your behalf"** —
  leaving it unticked gives HTTP 412 `insufficient authentication scopes`. A fresh service was
  created to resolve it; the old one can be deleted.
- Errors are logged to the console and surfaced as a generic failure message; `aria-live` announces
  status.

## 6. Design language

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

Targets: Lighthouse ≥95 on both routes. Current: home 100/100/100/100; `/cdg` 97–100 mobile,
100 desktop. Home JS ≈81.6 kB gzipped, CDG chunk ≈4.7 kB.

Rules learned the hard way — breaking these caused real regressions:

1. **No CSS transition on a scroll-linked transform.** A 150ms transition on `.tl-cursor` made the
   mascot permanently chase the page. Transitions are for the expression only.
2. **One rAF loop.** Two loops (Shell + Home) wrote in different frames.
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
perfectly smooth on a real iPhone, accept it rather than stripping the flip card, stacked cards or
travelling mascot. (Remaining suspects if it is ever revisited: the five sticky scaled cards, the
3D flip with its shadow, and the fixed bar over a scrolling page.)

## 8. Conventions

- **Git author** is set **repo-locally** to `Lvb99 <141593549+lvbfront@users.noreply.github.com>`
  (GitHub's noreply address, so the personal email stays out of history). Don't change it, don't set
  a global one.
- **`.gitignore`** covers: logs, `node_modules`, `dist`/`dist-ssr`, `*.local`, editor dirs,
  `.DS_Store`, `.env` and `.env.*`, and `photo-source/` (original uncropped photos — they contain
  people and UI chrome that shouldn't be published).
- **`dist/` is never committed.** Vercel builds from source.
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
  CPU throttling.

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
