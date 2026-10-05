import { useEffect, useLayoutEffect, useRef } from 'react'
import { useReveal } from '../components/Shell.jsx'

// Same loader as Cdg.jsx, same specifiers, so Vite emits one shared pair of GSAP chunks for both
// pages. Fetched only after `load`, so it never competes with the hero image.
let gsap, ScrollTrigger
const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))
const motion = loaded.then(() => Promise.all([import('gsap'), import('gsap/ScrollTrigger')])).then(([g, st]) => {
  gsap = g.gsap
  ScrollTrigger = st.ScrollTrigger
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })
})

// Every fact on this page comes from the game repo's CLAUDE.md (a private repo: never link to it);
// the section is noted next to each one. Re-check them there when the game changes.
const PLAY_URL = 'https://sky-soarer-3d-game.vercel.app/' // the button renders only when this is set

const tags = ['React', 'TypeScript', 'three.js', 'MediaPipe Hands', 'GSAP', 'Web Audio'] // §2
const stack = ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'three.js (vanilla)', 'MediaPipe Hands', 'GSAP + ScrollTrigger', 'simplex-noise', 'Web Audio API', 'Vitest'] // §2

const birds = ['Pigeon', 'Falcon', 'Greater Flamingo', 'Duck/Seabird'] // §1
const worlds = ['Mountain Valley', 'Tropical Ocean & Islands', 'Arabian Desert'] // §1
const skies = ['Sunny Morning', 'Sunset Gold', 'Starry Night'] // §1

const img = (name, w, h, alt, caption, spec) => ({
  src: `/projects/sky-soarer/${name}.webp`,
  srcSet: `/projects/sky-soarer/${name}-700.webp 700w, /projects/sky-soarer/${name}.webp ${w}w`,
  w, h, alt, caption, spec,
})

// Every screenshot on the page, once each (from the game repo's docs/screenshots/). plates[0] is
// the hero, the last one sits in Privacy, the rest are the Worlds gallery. Numbers derive from order.
const plates = [
  { ...img('hero', 1400, 788, 'The Sky Soarer landing page: the SKY SOARER title over a pink sunset sky and green low-poly hills, with a Quick start button and a dark low-poly bird flying below it'), srcSet: '/projects/sky-soarer/hero-500.webp 500w, /projects/sky-soarer/hero-700.webp 700w, /projects/sky-soarer/hero.webp 1400w' }, // + preload in index.html
  img('falcon', 1280, 720, 'The low-poly falcon wearing a red-and-white shemagh, on the landing page’s bird chapter at sunset, with the Shemagh switch turned on',
    'The Falcon in its Saudi shemagh, on by default.', [['Chapter', 'Choose your bird'], ['Bird', 'Falcon'], ['Sky', 'Sunset Gold']]),
  img('mountain', 1100, 620, 'Flying over green low-poly hills in Ring Challenge, with a highlighted next ring and an arrow pointing at it',
    'Ring Challenge: the next ring glows, and an arrow points at it.', [['World', 'Mountain Valley'], ['Sky', 'Sunny Morning'], ['Mode', 'Ring Challenge']]),
  img('ocean', 960, 540, 'The bird flying over turquoise sea toward small islands with palm trees',
    'Islands with beaches and palms over a shader-animated sea.', [['World', 'Tropical Ocean & Islands'], ['Sky', 'Sunny Morning'], ['Mode', 'Flight']]),
  img('seabed', 960, 540, 'Underwater: the bird swimming over a reef with coral, kelp and a school of fish',
    'Dive under open water into a reef with fish schools.', [['World', 'Tropical Ocean & Islands'], ['Sky', 'Sunset Gold'], ['Mode', 'Underwater']]),
  img('desert', 960, 540, 'The bird flying over orange dunes toward sandstone towers and a rock arch at sunset',
    'Sandstone towers and arches you can fly through.', [['World', 'Arabian Desert'], ['Sky', 'Sunset Gold'], ['Mode', 'Flight']]),
  img('skies', 1400, 788, 'The landing page’s sky chapter: a list of three skies, Sunny Morning, Sunset Gold and Starry Night, beside the flying bird',
    'Pick the sky; it crossfades live behind the page.', [['Chapter', 'Choose the sky'], ['Skies', '3'], ['Alt', '3,000 m']]),
  img('calibration', 1100, 640, 'The calibration screen: a green sensor feed with a dashed box and a hand skeleton, beside a checklist of five locked points',
    'The calibration feed is drawn on a canvas in the page, never read back.', [['Screen', 'Pre-flight 02'], ['Feed', '480×360'], ['Points', '5 locked']]),
]

const figures = [
  { figure: '307', label: 'unit tests', body: 'Vitest, for the pure modules: tracking math, the flick detector, rings, the cloth, the desert and more.' }, // §3, latest run recorded
  { figure: '0', label: 'third-party requests', body: 'Fonts and the MediaPipe files are self-hosted, under a strict Content-Security-Policy.' }, // §1, §12
  { figure: '3', label: 'lazy-loaded chunks', body: 'Hand tracking, the flight engine and the Arabian Desert load only when they’re about to be used.' }, // §5
  { figure: '2', label: 'languages', body: 'English and Arabic (right to left), switchable on the landing, in pre-flight, the guide and the pause menu.' }, // §1, §13
]

const privacy = [ // §1, §12
  ['Frames and landmarks never leave the browser.', 'MediaPipe Hands runs in the tab; the preview canvases are drawn and never read back.'],
  ['Zero third-party requests.', 'Fonts and MediaPipe are self-hosted. Every request is a same-origin GET: no analytics, no CDNs.'],
  ['Only a few small localStorage settings.', 'Five keys, all prefixed bird-flight-. No cookies, and never an image or landmarks.'],
  ['A Privacy panel with “Clear my data”.', 'On the landing and the camera step, it lists each stored key with its value and can remove them all.'],
]

// ---- Story: the six gestures, illustrated. Fixed drawings, no camera, no model.
// [caption, HUD readout, extra detail for the screen-reader list] — numbers from §6.3 and §6.12.
const chapters = [
  ['The camera frame stays in the browser. Your camera never leaves your device: nothing is recorded or uploaded.', 'CAMERA 480×360 · IN THIS TAB', 'MediaPipe Hands runs on each frame inside the page.'],
  ['MediaPipe finds 21 landmarks on the hand. Steering follows one point: the palm centre, the mean of landmarks 0, 5, 9, 13 and 17.', 'PALM = MEAN(0, 5, 9, 13, 17)', 'Landmark 0 is the wrist; 5, 9, 13 and 17 are the knuckles.'],
  ['You capture 5 points: the centre and four corners. Inside that box the palm maps to pitch and roll, past a deadzone and through an expo curve.', 'DEADZONE 0.07 · EXPO 0.65v + 0.35v³', 'The deadzone is 7% of the calibrated half-range; small offsets turn gently.'],
  ['Close a fist to boost. Every boost fires a 0.8 s barrel roll.', 'FIST < 0.62 · OPEN > 0.8', 'The fist ratio is the mean fingertip-to-palm distance over the wrist-to-middle-knuckle distance, with 3 frames of hysteresis.'],
  ['Flick your hand up, about half your box in under 0.2 s, for a 0.9 s backflip.', 'RISE ≥ 0.35 BOX · ≥ 3.5 BOX/s · 250 ms', 'It fires when, within 250 ms, the palm rises 0.35 of the box height and peaks at 3.5 box-heights per second; 1.2 s cooldown.'],
  ['Push your open palm toward the camera for the air brake: half of cruise speed and much tighter turns.', 'PALM SIZE ≥ 1.25× · 150 ms', 'It engages at 1.25 times the calibrated palm size held for 150 ms, and releases below 1.15 times.'],
]
const BADGES = ['CRUISE', 'BOOST · BARREL ROLL', 'BACKFLIP', 'BRAKE']

// MediaPipe's 21 hand landmarks (0 wrist, then 4 per finger), a schematic open hand and a fist.
const OPEN = [[100, 200], [72, 185], [52, 165], [40, 145], [30, 128], [78, 128], [72, 96], [68, 74], [65, 54], [100, 124], [100, 88], [100, 64], [100, 42], [121, 128], [126, 96], [129, 74], [132, 56], [139, 138], [147, 114], [152, 98], [156, 82]]
const FIST = [[100, 200], [72, 185], [62, 165], [72, 150], [88, 148], [78, 128], [74, 108], [82, 118], [86, 132], [100, 124], [98, 104], [104, 116], [106, 130], [121, 128], [122, 108], [124, 120], [124, 132], [139, 138], [142, 122], [140, 132], [136, 142]]
const LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]]
const PALM = [0, 5, 9, 13, 17]
const [PX, PY] = PALM.reduce(([x, y], i) => [x + OPEN[i][0] / 5, y + OPEN[i][1] / 5], [0, 0])
const BOX = { x: PX - 50, y: PY - 40, w: 100, h: 80 } // the calibrated box, drawn around the palm centre

const Skeleton = ({ pts, ...rest }) => (
  <g {...rest}>
    {LINKS.map(([a, b]) => <line key={`${a}-${b}`} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} />)}
    {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.2" className="fill-white" />)}
  </g>
)

const Stack = ({ items, attr, className = '' }) => (
  <span className={`grid ${className}`}>
    {items.map((x, i) => <span key={i} {...{ [attr]: '' }} className="[grid-area:1/1]">{x}</span>)}
  </span>
)

// The visual stage. Every state is in the DOM from the start; story() only moves transforms and
// opacity. Rendered once for the scroll version and six times for the reduced-motion storyboard.
const Stage = ({ caption = true }) => (
  <div>
    <p className="mb-3 flex justify-between gap-3 font-mono text-[11px] text-slate-500">
      <span>HAND → FLIGHT</span>
      <span className="flex gap-1">GESTURE <Stack items={chapters.map((_, i) => `0${i + 1}`)} attr="data-count" /> / 06</span>
    </p>
    <div className="grid gap-3 lg:grid-cols-2 lg:gap-6">
      {/* the hand: a schematic of the 21 landmarks, not a drawing */}
      <svg viewBox="0 0 200 220" className="mx-auto h-[min(30svh,15rem)] w-auto overflow-visible rounded-xl bg-slate-50 lg:h-[44svh] lg:max-h-96">
        <g data-frame className="fill-none stroke-sky-600" strokeWidth="2">
          <path d="M8 26V8h18M174 8h18v18M192 194v18h-18M26 212H8v-18" />
        </g>
        <text x="14" y="206" className="fill-slate-500 font-mono text-[9px]">LIVE · 480×360</text>
        <g data-box>
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx="2" className="fill-sky-100/60 stroke-sky-600" strokeDasharray="4 3" />
          {[[PX, PY], [BOX.x, BOX.y], [BOX.x + BOX.w, BOX.y], [BOX.x, BOX.y + BOX.h], [BOX.x + BOX.w, BOX.y + BOX.h]].map(([x, y], i) => (
            <circle key={i} data-pt cx={x} cy={y} r="4" className="fill-none stroke-amber-500" strokeWidth="2" />
          ))}
        </g>
        <g data-hand className="stroke-slate-400" strokeWidth="2">
          <Skeleton data-open pts={OPEN} />
          <Skeleton data-fist pts={FIST} />
          <g data-palm>
            {PALM.map((i) => <circle key={i} cx={OPEN[i][0]} cy={OPEN[i][1]} r="4" className="fill-sky-600 stroke-white" />)}
            {PALM.map((i) => <text key={i} x={OPEN[i][0] + (i ? 0 : 8)} y={OPEN[i][1] + (i ? -8 : 4)} textAnchor={i ? 'middle' : 'start'} className="fill-sky-800 stroke-none font-mono text-[9px]">{i}</text>)}
          </g>
          <g data-center className="stroke-sky-700" strokeWidth="2">
            <path d={`M${PX - 9} ${PY}h18M${PX} ${PY - 9}v18`} />
            <circle cx={PX} cy={PY} r="5" className="fill-white" />
          </g>
        </g>
      </svg>

      {/* the bird: a side-view silhouette, nose to the right */}
      <div className="relative">
        <svg viewBox="0 0 200 120" className="mx-auto h-[min(15svh,8rem)] w-auto overflow-visible lg:h-[30svh] lg:max-h-64">
          <line x1="0" y1="104" x2="200" y2="104" className="stroke-slate-300" strokeDasharray="2 4" />
          <g data-arc className="fill-none stroke-sky-600" strokeWidth="2">
            <circle cx="100" cy="56" r="44" strokeDasharray="3 5" />
            <path d="m94 6 8 6-8 6" />
          </g>
          <g data-bird>
            <path d="M68 60 46 50l5 12-5 12 22-8z" className="fill-slate-500" />
            <ellipse cx="100" cy="62" rx="34" ry="11" className="fill-slate-700" />
            <circle cx="133" cy="55" r="9" className="fill-slate-700" />
            <path d="m140 52 15 4-15 5z" className="fill-amber-500" />
            <path d="M92 58 78 24l38 32z" className="fill-slate-500" />
          </g>
        </svg>
        <Stack attr="data-badge" className="mt-1 justify-items-center font-mono text-[11px] font-semibold"
          items={BADGES.map((b, i) => <span key={b} className={`rounded px-2 py-0.5 ${i ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{b}</span>)} />
      </div>
    </div>
    <Stack items={chapters.map(([, r]) => r)} attr="data-readout" className="mt-4 font-mono text-[11px] text-sky-800" />
    {caption && <Stack items={chapters.map(([c]) => c)} attr="data-caption" className="mt-2 text-sm font-medium leading-relaxed text-slate-800 sm:text-base lg:text-lg" />}
  </div>
)

// The whole story as one timeline over a Stage: a label per chapter (ch1–ch6), each followed by a
// flat hold so a scrolling thumb can rest on it (longest at ch5, the backflip). Transforms/opacity only.
function story(root, scrollTrigger) {
  const q = gsap.utils.selector(root)
  const hand = q('[data-hand]'), bird = q('[data-bird]')
  const show = (attr, i, at) => tl.to(q(`[data-${attr}]`), { opacity: (j) => +(j === i), duration: 0.4 }, at)
  gsap.set(q('[data-count], [data-caption], [data-readout], [data-badge]'), { opacity: (i, el) => +!el.previousSibling })
  gsap.set(q('[data-fist], [data-palm], [data-center], [data-box], [data-pt], [data-arc]'), { opacity: 0 })
  gsap.set(q('[data-open]'), { opacity: 0.35 })
  gsap.set(hand, { svgOrigin: `${PX} ${PY}` })
  gsap.set(bird, { transformOrigin: '50% 50%' })

  const tl = gsap.timeline({ defaults: { ease: 'none', duration: 1 }, scrollTrigger })
  const chapter = (n, d, hold, fn) => {
    const at = `go${n}`
    tl.addLabel(at)
    ;['count', 'caption', 'readout'].forEach((a) => show(a, n - 1, at))
    fn(at)
    tl.addLabel(`ch${n}`, `${at}+=${d}`).to({}, { duration: hold })
  }

  tl.addLabel('ch1').to({}, { duration: 0.6 })
  chapter(2, 1, 0.6, (at) => tl
    .to(q('[data-open]'), { opacity: 1, duration: 0.5 }, at)
    .to(q('[data-palm]'), { opacity: 1, duration: 0.4 }, `${at}+=0.3`)
    .to(q('[data-center]'), { opacity: 1, duration: 0.4 }, `${at}+=0.6`))
  chapter(3, 1.2, 0.6, (at) => tl
    .to(q('[data-palm]'), { opacity: 0, duration: 0.3 }, at)
    .to(q('[data-box]'), { opacity: 1, duration: 0.3 }, at)
    .to(q('[data-pt]'), { opacity: 1, duration: 0.15, stagger: 0.12 }, at)
    .to(hand, { x: 30, y: -24, duration: 0.6, ease: 'power1.inOut' }, `${at}+=0.6`)
    .to(bird, { rotation: -16, y: -8, duration: 0.6, ease: 'power1.inOut' }, `${at}+=0.6`))
  chapter(4, 1.2, 0.6, (at) => tl
    .to(hand, { x: 0, y: 0, duration: 0.4 }, at)
    .to(bird, { rotation: 0, y: 0, duration: 0.4 }, at)
    .to(q('[data-open]'), { opacity: 0, duration: 0.3 }, `${at}+=0.3`)
    .to(q('[data-fist]'), { opacity: 1, duration: 0.3 }, `${at}+=0.3`)
    .to(bird, { scaleY: -1, duration: 0.25, ease: 'power1.in' }, `${at}+=0.6`)
    .to(bird, { scaleY: 1, duration: 0.25, ease: 'power1.out' }, `${at}+=0.85`))
  show('badge', 1, 'go4')
  chapter(5, 1.4, 1.8, (at) => tl
    .to(q('[data-fist]'), { opacity: 0, duration: 0.2 }, at)
    .to(q('[data-open]'), { opacity: 1, duration: 0.2 }, at)
    .to(hand, { y: -BOX.h / 2, duration: 0.25, ease: 'power2.out' }, `${at}+=0.2`)
    .to(bird, { rotation: -360, y: -10, duration: 0.9, ease: 'power1.inOut' }, `${at}+=0.4`)
    .to(q('[data-arc]'), { opacity: 1, duration: 0.3 }, `${at}+=0.4`))
  show('badge', 2, 'go5')
  chapter(6, 1, 0.4, (at) => tl
    .to(q('[data-arc]'), { opacity: 0, duration: 0.3 }, at)
    .set(bird, { rotation: 0 }, at)
    .to(hand, { y: 0, scale: 1.25, duration: 0.6, ease: 'power1.inOut' }, at)
    .to(bird, { rotation: -18, x: -16, y: 0, duration: 0.6, ease: 'power1.inOut' }, at))
  show('badge', 3, 'go6')
  return tl
}

function Story() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    // QA helper: #/sky-soarer?ch=N jumps to chapter N and freezes it there (for screenshots).
    const ch = +(location.hash.match(/[?&]ch=([1-6])/)?.[1] ?? 0)
    let mm, dead = false
    motion.then(() => {
      if (dead) return
      mm = gsap.matchMedia(ref.current)
      // one of motion/reduce always matches — gsap.matchMedia skips the callback when none does
      mm.add({ desktop: '(min-width: 1024px)', motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
        if (conditions.reduce) {
          const cards = gsap.utils.toArray('[data-card]', ref.current)
          cards.forEach((card, i) => story(card).pause(`ch${i + 1}`))
          if (ch) cards[ch - 1].scrollIntoView({ block: 'start', behavior: 'instant' })
          return
        }
        const wrap = ref.current.querySelector('[data-story]')
        const tl = story(wrap, {
          trigger: wrap,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          snap: conditions.desktop && { snapTo: 'labelsDirectional', duration: { min: 0.2, max: 0.5 }, delay: 0.1, ease: 'power1.inOut' },
        })
        let live = true
        document.fonts.ready.then(() => {
          if (!live) return
          ScrollTrigger.refresh()
          if (!ch) return
          const st = tl.scrollTrigger
          const top = st.labelToScroll(`ch${ch}`)
          st.disable(false)
          scrollTo({ top, behavior: 'instant' })
          tl.pause(`ch${ch}`)
        })
        return () => { live = false }
      })
    })
    return () => { dead = true; mm?.revert() }
  }, [])

  return (
    <div ref={ref}>
      <div data-story aria-hidden="true" className="relative h-[600svh] motion-reduce:hidden">
        {/* CSS sticky, not a ScrollTrigger pin: steadier on iOS Safari. Below lg it clears the mini bar. */}
        <div className="sticky top-[var(--bar-h)] flex h-[calc(100svh-var(--bar-h))] flex-col justify-center lg:top-0 lg:h-svh">
          <Stage />
        </div>
      </div>
      <ol aria-hidden="true" className="hidden space-y-4 motion-reduce:block">
        {chapters.map(([c], i) => (
          <li key={i} data-card className="scroll-mt-[calc(var(--bar-h)+1rem)] rounded-2xl border border-sky-100 bg-white p-4 lg:scroll-mt-4">
            <p className="mb-3 text-sm font-medium leading-relaxed text-slate-800">{c}</p>
            <Stage caption={false} />
          </li>
        ))}
      </ol>
      <ol className="sr-only">
        {chapters.map(([c, , d], i) => <li key={i}>Gesture {i + 1}: {c} {d}</li>)}
      </ol>
    </div>
  )
}

// ---- Page chrome: reading the page is a climb, like the game's own landing ("The Ascent").
// Altitudes 0 / 300 / 1,200 / 3,000 / 5,000 m are the game's chapters; 4,000 and 4,500 are decorative.
const ALTS = [0, 300, 1200, 3000, 4000, 4500, 5000]
const fmt = (m) => m.toLocaleString('en-US')

const Label = ({ n, name, as: H = 'h2' }) => (
  <H data-alt={ALTS[+n]} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-sky-700">
    <span>{n} — {fmt(ALTS[+n])} m · {name}</span>
    <span aria-hidden="true" className="h-px flex-1 bg-sky-200" />
  </H>
)

const Hairline = ({ left, right, ...rest }) => (
  <div {...rest} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-slate-600">
    <span>{left}</span>
    <span aria-hidden="true" className="h-px flex-1 bg-slate-300" />
    {right && <span aria-hidden="true">{right}</span>}
  </div>
)

const pad = (n) => String(n).padStart(2, '0')

// A screenshot as a "plate": thin border, opens the lightbox. Space is reserved by width/height.
const Plate = ({ p, onOpen, hero }) => (
  <button type="button" onClick={() => onOpen(p)} className="group block w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
    <img
      src={p.src}
      srcSet={p.srcSet}
      sizes={hero ? '(min-width: 1024px) 28rem, 86vw' : '(min-width: 1024px) 28rem, 78vw'}
      alt={p.alt}
      width={p.w}
      height={p.h}
      loading={hero ? undefined : 'lazy'}
      fetchPriority={hero ? 'high' : undefined}
      decoding={hero ? undefined : 'async'}
      style={{ aspectRatio: `${p.w} / ${p.h}` }}
      className="w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
  </button>
)

const Spec = ({ rows }) => (
  <dl className="mt-2 grid grid-cols-[4.5rem_1fr] gap-y-0.5 font-mono text-[11px] text-slate-600">
    {rows.map(([k, v]) => (
      <div key={k} className="contents"><dt className="uppercase tracking-wider">{k}</dt><dd className="text-slate-800">{v}</dd></div>
    ))}
  </dl>
)

const btn = 'inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold'

export default function SkySoarer() {
  useReveal()
  const root = useRef(null)
  const dialog = useRef(null)
  const full = useRef(null)
  const strip = useRef(null)
  const counter = useRef(null)
  const alt = useRef([])
  const marker = useRef(null)
  const hero = plates[0], calib = plates.at(-1), gallery = plates.slice(1, -1)
  const no = (p) => pad(plates.indexOf(p) + 1)

  const open = (p) => {
    full.current.src = p.src
    full.current.alt = p.alt
    dialog.current.showModal()
  }

  useLayoutEffect(() => {
    let mm, live = true
    motion.then(() => {
      if (!live) return
      mm = gsap.matchMedia(root.current)
      mm.add({ animate: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' }, ({ conditions: { animate, desktop } }) => {
        if (!animate) return // reduced motion: everything static and visible
        gsap.utils.toArray(desktop ? '[data-drift]' : '[data-drift]:not([data-lg])').forEach((el) => {
          gsap.to(el, { y: +el.dataset.drift, ease: 'none', scrollTrigger: { trigger: el, start: 'clamp(top bottom)', end: 'bottom top', scrub: true } })
        })
        gsap.utils.toArray('[data-countup]').forEach((el) => {
          gsap.from(el, { textContent: 0, snap: { textContent: 1 }, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        })
      })

      // The altimeter: one trigger over the whole page, in all conditions (it's a position readout,
      // not motion). Anchors (each [data-alt] reaching 60% of the viewport) are measured on refresh
      // only; updates are arithmetic plus text/transform writes, and only when the text changes.
      mm.add('all', () => {
        const els = [...root.current.querySelectorAll('[data-alt]')]
        const vals = els.map((el) => +el.dataset.alt)
        let ys = [], last = ''
        const write = (y) => {
          if (!ys.length) return
          const i = Math.max(0, ys.findLastIndex((a) => y >= a))
          const t = i < ys.length - 1 ? Math.min(1, (y - ys[i]) / (ys[i + 1] - ys[i] || 1)) : 0
          const m = Math.round((vals[i] + ((vals[i + 1] ?? vals[i]) - vals[i]) * t) / 10) * 10
          const text = `ALT ${fmt(m)} m`
          if (text !== last) { last = text; alt.current.forEach((n) => n && (n.textContent = text)) }
          marker.current.style.transform = `translateY(${-((i + t) / (ys.length - 1)) * 100}%)`
        }
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onRefresh: (self) => {
            ys = els.map((el, i) => (i ? Math.min(self.end, el.getBoundingClientRect().top + scrollY - innerHeight * 0.6) : 0))
            ys[ys.length - 1] = self.end // the footer is the top of the climb
            write(scrollY)
          },
          onUpdate: (self) => write(self.scroll()),
        })
      })

      const imgs = [...root.current.querySelectorAll('img[src]')].map((img) => img.complete || new Promise((r) => { img.onload = img.onerror = r }))
      Promise.all([document.fonts.ready, ...imgs]).then(() => live && ScrollTrigger.refresh())
    })
    return () => { live = false; mm?.revert() }
  }, [])

  // swipe-strip counter: native scroll-snap does the scrolling; this only writes the number
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) counter.current.textContent = e.target.dataset.n }),
      { root: strip.current, threshold: 0.6 },
    )
    ;[...strip.current.children].forEach((li) => io.observe(li))
    return () => io.disconnect()
  }, [])

  return (
    <main ref={root} className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:px-12">
      {/* the altimeter: a readout on phones, a rail at lg. Decorative; the page reads the same without it.
          The phone pill sits in the mini bar's band (left of its mascot, above it: z 45 vs 40), so a
          section label never passes under it — labels only reach that band once the opaque bar is on.
          It shows only with the bar (Shell's .minibar precedes <main>), so it never sits over the hero. */}
      <div aria-hidden="true" className="pointer-events-none fixed right-[calc(max(1.5rem,env(safe-area-inset-right))+2.75rem)] top-[calc(env(safe-area-inset-top)+0.95rem)] z-[45] transition-opacity duration-200 delay-[350ms] [.minibar:not(.on)~main_&]:opacity-0 [.minibar:not(.on)~main_&]:delay-0 rounded-full border border-sky-100 bg-white/90 px-2.5 py-1 font-mono text-[11px] text-sky-800 shadow-sm lg:hidden">
        <span ref={(n) => (alt.current[0] = n)}>ALT 0 m</span>
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed bottom-[20vh] right-5 top-[20vh] z-10 hidden w-24 lg:block">
        <div className="absolute inset-y-0 right-0 w-px bg-sky-200">
          {ALTS.map((a, i) => (
            <span key={a} style={{ bottom: `${(i / (ALTS.length - 1)) * 100}%` }} className="absolute right-0 flex translate-y-1/2 items-center gap-1 font-mono text-[10px] leading-none text-slate-500">
              {fmt(a)}<span className="h-px w-1.5 bg-current" />
            </span>
          ))}
          <div ref={marker} className="absolute inset-0 will-change-transform">
            <span className="absolute -right-[5px] bottom-0 size-2.5 translate-y-1/2 rounded-full bg-sky-600 ring-2 ring-white" />
          </div>
        </div>
        <span ref={(n) => (alt.current[1] = n)} className="absolute -bottom-8 right-0 whitespace-nowrap font-mono text-[11px] font-semibold text-sky-800">ALT 0 m</span>
      </div>

      <a href="#/" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-600 hover:underline">
        ← Back to home
      </a>

      {/* 00 — Takeoff */}
      <header data-alt="0" className="mt-8">
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-mono text-[11px] text-slate-600">
          <span>GAME · WEBCAM · 3D</span>
          <span>English + العربية</span>
        </div>

        <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:gap-14 xl:grid-cols-[minmax(0,1fr)_28rem]">
          <div>
            <h1 className="text-[clamp(3.25rem,16vw,7rem)] font-extrabold leading-[0.92] tracking-tighter text-slate-800">
              <span className="sr-only">Sky Soarer</span>
              <span aria-hidden="true">
                {['SKY', 'SOARER'].map((w, i) => (
                  <span key={w} className="block overflow-hidden pb-[0.06em]"><span style={{ '--i': i }} className="rise block">{w}</span></span>
                ))}
              </span>
            </h1>
            <p lang="ar" dir="rtl" className="mt-3 text-left text-2xl font-bold text-sky-800 sm:text-3xl">محلّق السماء</p>
            <p className="mt-6 max-w-xl text-xl leading-snug text-slate-700 sm:text-2xl">
              A relaxing, endless 3D flight game. You steer a low-poly bird <em className="pr-[0.1em]">with your bare hand</em> in front of a webcam.
            </p>
            <ul className="tags mt-6 flex flex-wrap gap-2" aria-label="Technologies">
              {tags.map((t, i) => (
                <li key={t} style={{ '--d': i }} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{t}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              {PLAY_URL && <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className={`${btn} bg-sky-700 text-white hover:bg-sky-800`}>Play it →</a>}
            </div>
            <p className="mt-3 max-w-md text-sm text-slate-600">
              Best on a laptop or desktop with a webcam (or play with the keyboard). Phones show the game’s landing page only.
            </p>
          </div>

          <figure data-drift="50" className="mx-auto w-[86%] max-w-md will-change-transform lg:w-full">
            <div className="-rotate-2">
              <Plate p={hero} onOpen={open} hero />
              <figcaption className="mt-3 font-mono text-[11px] text-slate-600">PLATE 01 · THE ASCENT, 0 m</figcaption>
            </div>
          </figure>
        </div>

        <div className="mt-14"><Hairline left="ALT 0 m — Ground" right="Scroll to climb ↓" /></div>
      </header>

      {/* 01 — The worlds */}
      <section className="reveal mt-20 lg:mt-28">
        <Label n="01" name="The worlds" as="p" />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          Four birds, three worlds, <em className="font-semibold">three skies.</em>
        </h2>
        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          {[['Birds', birds], ['Worlds', worlds], ['Skies', skies]].map(([k, list]) => (
            <div key={k} className="border-t border-slate-200 pt-3">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-slate-600">{k} · {list.length}</dt>
              {list.map((v) => <dd key={v} className="mt-1 font-semibold text-slate-800">{v}</dd>)}
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-2xl leading-relaxed">
          With the Falcon, a <bdi lang="ar">شماغ</bdi> switch (on by default) dresses it in a Saudi red-and-white shemagh with a black agal.
          New players start over the Tropical Ocean &amp; Islands.
        </p>
        <ul ref={strip} aria-label="Screenshots of the birds, worlds and skies" className="-mx-6 mt-10 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:-mx-12 md:scroll-px-12 md:px-12 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10 lg:overflow-visible lg:px-0 lg:pb-0">
          {gallery.map((p, i) => (
            <li key={p.src} data-n={no(p)} className={`w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto ${i % 2 ? 'lg:mt-32' : ''}`}>
              <figure data-drift={i % 2 ? -40 : 40} data-lg className="will-change-transform">
                <Plate p={p} onOpen={open} />
                <figcaption className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-sm text-slate-600">{p.caption}</p>
                  <Spec rows={[['Plate', no(p)], ...p.spec]} />
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p aria-hidden="true" className="mt-4 font-mono text-[11px] text-slate-600 lg:hidden">
          <span ref={counter}>{no(gallery[0])}</span> / {no(gallery.at(-1))} · swipe →
        </p>
      </section>

      {/* 02 — Hand → flight: the scroll story. No .reveal on the section: its translateY would skew
          ScrollTrigger's measurements. */}
      <section className="mx-auto mt-24 max-w-4xl lg:mt-32">
        <div className="reveal">
          <Label n="02" name="Hand → flight" />
          <p className="mb-6 mt-3 font-mono text-[11px] text-slate-500">Schematic illustration. The thresholds are the game’s real constants.</p>
        </div>
        <Story />
      </section>

      {/* 03 — Privacy by design */}
      <section className="reveal mt-24 lg:mt-32">
        <Label n="03" name="Privacy by design" as="p" />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          Your camera never leaves <em className="font-semibold">your device.</em>
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
          <ol className="space-y-5">
            {privacy.map(([h, b], i) => (
              <li key={h} className="grid grid-cols-[2rem_1fr] border-t border-slate-200 pt-4">
                <span aria-hidden="true" className="font-mono text-[11px] text-sky-700">{pad(i + 1)}</span>
                <div>
                  <h3 className="font-semibold text-slate-800">{h}</h3>
                  <p className="mt-1 leading-relaxed">{b}</p>
                </div>
              </li>
            ))}
          </ol>
          <figure className="self-start">
            <Plate p={calib} onOpen={open} />
            <figcaption className="mt-3 border-t border-slate-200 pt-3">
              <p className="text-sm text-slate-600">{calib.caption}</p>
              <Spec rows={[['Plate', no(calib)], ...calib.spec]} />
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 04 — Under the hood */}
      <section className="reveal mt-24 lg:mt-32">
        <Label n="04" name="Under the hood" />
        <ol className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {figures.map((f, i) => (
            <li key={f.label} className="border-t border-sky-200 pt-5">
              <p aria-hidden="true" className="font-mono text-[11px] text-sky-700">{pad(i + 1)}</p>
              <p aria-hidden="true" className="mt-2 text-6xl font-extrabold tabular-nums tracking-tighter text-slate-800"><span data-countup>{f.figure}</span></p>
              <h3 className="mt-3 font-semibold text-slate-800"><span className="sr-only">{f.figure} </span>{f.label}</h3>
              <p className="mt-2 leading-relaxed">{f.body}</p>
            </li>
          ))}
        </ol>
        <ul className="tags mt-14 flex flex-wrap gap-2" aria-label="Tech stack">
          {stack.map((t, i) => (
            <li key={t} style={{ '--d': i }} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{t}</li>
          ))}
        </ul>
      </section>

      {/* 05 — How it was built */}
      <section className="reveal mt-24 lg:mt-32">
        <Label n="05" name="How it was built" />
        <div className="mt-8 max-w-3xl space-y-5 text-lg leading-relaxed">
          <p className="text-2xl font-bold leading-tight tracking-tight text-slate-800 sm:text-3xl">
            Replit first, <em className="font-semibold">then Claude Code.</em>
          </p>
          <p>
            Sky Soarer was built on Replit with Replit Agent. It was then cleaned into a standalone repo on GitHub that builds on any OS and
            deploys to Vercel as a static site, and developed with Claude Code: every change on a branch, then a pull request, a Vercel
            preview, and a merge.
          </p>
          <p>
            Parts of it were built at the “You Direct | AI Executes” workshop (GDG On Campus | UJ, 26 Sep 2026).
          </p>
        </div>
        <p aria-hidden="true" className="mt-8 font-mono text-[11px] uppercase tracking-widest text-slate-600">
          Replit Agent → GitHub → branch → PR → Vercel preview → merge
        </p>
      </section>

      {/* the top of the climb */}
      <footer className="mt-24 lg:mt-32">
        <Hairline data-alt="5000" left="ALT 5,000 m — Above the clouds" />
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
          {PLAY_URL && <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-sky-700 hover:text-sky-600 hover:underline">Play it →</a>}
          <a href="#/" className="text-sm font-semibold text-sky-700 hover:text-sky-600 hover:underline">← Back to home</a>
        </div>
      </footer>

      <dialog ref={dialog} onClick={(e) => e.target === dialog.current && dialog.current.close()} className="lightbox">
        {/* no src until opened: an eager full-size download here would compete with the hero image */}
        <img ref={full} alt="" className="max-h-[90vh] w-auto max-w-[92vw] rounded-lg" />
        <button type="button" onClick={() => dialog.current.close()} className="mt-3 block w-full rounded-lg bg-white/90 py-2 text-sm font-semibold text-slate-700">
          Close
        </button>
      </dialog>
    </main>
  )
}
