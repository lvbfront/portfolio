import { useEffect, useId, useRef, useState } from 'react'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa6'
import Contact from '../components/Contact.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import Blob from '../components/Blob.jsx'
import { useReveal } from '../components/Shell.jsx'
import { onFrame, requestFrame } from '../scroll.js'

const socials = [
  { label: 'GitHub', href: 'https://github.com/lvbfront', Icon: FaGithub },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abdullah-bukhari-366074270/', Icon: FaLinkedin },
  { label: 'Email', href: 'mailto:abdu44ll3ah55@gmail.com', Icon: FaEnvelope },
]

// `link` turns that part of the role into a link.
const experience = [
  {
    role: 'AI Safety Research Scholar (SUDS Program)',
    link: { label: 'SUDS Program', href: 'https://datasciences.utoronto.ca/suds-cohort-program/' },
    place: 'HIVE Lab, Data Sciences Institute — University of Toronto',
    date: 'Jun–Aug 2026',
    description:
      'Researched prompt-injection attacks on masked diffusion LLMs (LLaDA-8B) in medical settings. Built linear probes and SVD activation analysis that detect attacks at ≈0.96 AUC, and co-authored the resulting paper and poster.',
  },
  {
    role: 'AI Engineer Intern, R&D Team',
    place: 'First City, Saudi Arabia',
    date: 'Mar–Aug 2025',
    description:
      'Built full-stack apps with Django and React, and automation tools that turn documents into structured datasets for AI pipelines.',
  },
  {
    role: 'Independent Full-Stack Developer',
    place: 'School Management Platform',
    date: '2025–Present',
    description:
      'Built and deployed a school management platform (Django, React) with a custom grading system and analytics dashboards.',
  },
]

const education = [
  {
    role: 'B.S. in Artificial Intelligence',
    place: 'Umm Al-Qura University',
    date: '2022–2026',
  },
  {
    role: 'AI Specialization',
    place: 'KAUST Academy',
    date: 'Jan–Sep 2026',
    description:
      'Selected through a competitive four-stage national AI program; placed in the research track at the University of Toronto.',
  },
]

const certifications = 'AWS Certified Cloud Practitioner · IBM (Chatbots, Computer Vision, Data Fundamentals)'

// Edit projects here. `badge` and `href` are optional; `fish` is the short name on its fish in The Catch.
const projects = [
  {
    title: 'ClinicalDenoiseGuard (CDG)',
    fish: 'CDG',
    badge: 'Research',
    href: '#/cdg',
    description:
      'Detecting and correcting prompt-injection attacks on diffusion LLMs using linear probes and activation steering (≈0.96 AUC). Paper and poster co-authored.',
    tags: ['PyTorch', 'LLMs', 'Interpretability', 'AI Safety'],
  },
  {
    title: 'Sky Soarer',
    fish: 'Sky Soarer',
    badge: 'Game',
    href: '#/sky-soarer',
    description:
      'A relaxing, endless 3D flight game: steer a low-poly bird with your bare hand in front of a webcam, tracked by MediaPipe Hands in the browser. Fully bilingual, English and Arabic.',
    tags: ['Computer Vision', 'MediaPipe', 'three.js', 'React'],
  },
  {
    title: 'Recyclable Materials Classifier',
    fish: 'Recycling',
    badge: '1st Place',
    description: 'Image classification model for sorting recyclable materials; won 1st place in an AI competition.',
    tags: ['Computer Vision', 'Deep Learning', 'TensorFlow'],
  },
  {
    title: 'Laqta — Event Photo Delivery + Voice Assistant',
    fish: 'Laqta',
    description:
      'Platform where photographers upload event photos live and guests scan a QR code to get only their own photos via face matching, with a voice assistant that books photographers in Saudi Arabic.',
    tags: ['Face Recognition', 'AI Agents', 'Voice AI', 'Full-stack'],
  },
  {
    title: 'Baggage Monitoring System',
    fish: 'Baggage',
    description: 'Real-time YOLO object detection that flags unattended luggage in airports when no person is nearby.',
    tags: ['Computer Vision', 'YOLO', 'Real-time'],
  },
  {
    title: 'pgai — Open-Source Contribution',
    fish: 'pgai',
    description:
      'Extended the open-source pgai framework to support more LLM providers, including Google Gemini, with docs and integration guides.',
    tags: ['LLMs', 'Open Source', 'PostgreSQL'],
  },
]

// Events & Competitions: one panel per stop on the route. Only `title` is required; every other
// field renders only when present. `images` (1–4): { src, w, h, alt, srcSet?, pos? } or { placeholder: true };
// `pos` replaces the default crop focus (an object-position class) for a photo whose subject sits on an edge;
// the first is the main photo; one more sits smaller on its corner, two or three form a row under it.
// `wide` makes the panel span two; `stop` overrides the city label under its dot on the route.
const events = [
  {
    title: 'Visionthon',
    date: '',
    place: 'Wadi Makkah',
    organizer: 'Elvira',
    result: '1st Place',
    project: 'Recyclable Materials Classifier',
    line: projects.find((p) => p.title === 'Recyclable Materials Classifier').description,
    images: [{ placeholder: true }],
  },
  {
    title: 'X-thon — University of Tabuk × NEOM',
    date: '',
    place: 'Tabuk',
    result: 'Team project',
    project: 'Road Sense',
    line: 'An IoT and TinyML platform that turns vehicle fleets into mobile road sensors: an ESP32-C3 with an MPU6050 detects potholes and cracks on-device, geo-tags them, and feeds a city road-condition heatmap.',
    tags: ['ESP32-C3', 'MPU6050', 'TinyML', 'IoT'],
    images: [{ placeholder: true }, { placeholder: true }],
  },
  {
    title: 'SUDS Program — University of Toronto',
    wide: true,
    label: 'AI Safety Research · HIVE Lab',
    date: 'Jun–Aug 2026',
    place: 'Toronto',
    result: 'Best Poster, SUDS 2026',
    line: 'Presented our research poster on template-injection jailbreaks in diffusion language models.',
    link: { label: 'Read the research →', href: '#/cdg' },
    images: [
      { src: '/cdg/team-toronto.webp', w: 1000, h: 1333, alt: 'Presenting the poster with the team in Toronto' },
      { src: '/cdg/poster.webp', srcSet: '/cdg/poster-700.webp 700w, /cdg/poster.webp 1400w', w: 1400, h: 1820, alt: 'Research poster: Mechanistic Analysis of Template-Injection Jailbreaks in Diffusion Language Models' },
    ],
  },
  {
    title: 'KAUST Academy Showcase',
    wide: true,
    stop: 'Toronto → KAUST',
    label: 'KAUST Academy · AI Specialization',
    date: '',
    place: 'KAUST',
    line: 'Presented the same research again at the KAUST Academy showcase.',
    images: [
      { src: '/events/kaust-1.webp', srcSet: '/events/kaust-1-700.webp 700w, /events/kaust-1.webp 1400w', w: 1400, h: 936, pos: 'object-right-top', alt: 'A large auditorium full of seated attendees, with the KAUST Academy logo on the wall' },
      { src: '/events/kaust-2.webp', srcSet: '/events/kaust-2-700.webp 700w, /events/kaust-2.webp 1200w', w: 1200, h: 1600, alt: 'Presenting the poster at the KAUST Academy showcase' },
      { src: '/events/kaust-3.webp', srcSet: '/events/kaust-3-700.webp 700w, /events/kaust-3.webp 1206w', w: 1206, h: 906, alt: 'A colourful "I love KAUST" sign on a waterfront promenade' },
    ],
  },
  {
    title: 'You Direct | AI Executes',
    wide: true,
    label: 'Workshop',
    date: '26 Sep 2026',
    place: 'Wadi Jeddah',
    stop: 'Jeddah',
    organizer: 'GDG On Campus | UJ',
    line: 'A workshop on turning an idea into a real tech project with generative AI tools like Codex and Claude: you direct, the AI executes. I built parts of Sky Soarer there.',
    link: { label: 'Sky Soarer →', href: 'https://sky-soarer-3d-game.vercel.app/' },
    images: [
      { src: '/events/gdg-uj-1.webp', srcSet: '/events/gdg-uj-1-700.webp 700w, /events/gdg-uj-1.webp 1400w', w: 1400, h: 1053, alt: 'A presenter in a white thobe speaks beside a large screen showing Arabic calligraphy, facing a seated audience' },
      { src: '/events/gdg-uj-2.webp', srcSet: '/events/gdg-uj-2-700.webp 700w, /events/gdg-uj-2.webp 1400w', w: 1400, h: 933, alt: 'Attendees seated at tables with laptops, watching the session' },
      { src: '/events/gdg-uj-3.webp', srcSet: '/events/gdg-uj-3-700.webp 700w, /events/gdg-uj-3.webp 1400w', w: 1400, h: 765, alt: 'Screenshot of Sky Soarer, my web game: a low-poly bird flying over islands and water' },
      { src: '/events/gdg-uj-4.webp', srcSet: '/events/gdg-uj-4-700.webp 700w, /events/gdg-uj-4.webp 1400w', w: 1400, h: 994, alt: 'Certificate of attendance for You Direct | AI Executes, Google Developer Group on Campus, University of Jeddah' },
    ],
  },
  { title: 'More stops soon' },
]

const skills = {
  AI: ['LLMs', 'Computer Vision', 'AI Agents', 'PyTorch', 'TensorFlow', 'Hugging Face', 'Scikit-learn'],
  'Languages & Data': ['Python', 'SQL', 'PostgreSQL', 'Pandas', 'NumPy'],
  'Web & Tools': ['Django', 'FastAPI', 'React', 'Tailwind', 'Docker', 'Git', 'AWS'],
}

const sections = ['about', 'experience', 'education', 'projects', 'events', 'skills', 'contact']

const Tag = ({ i, children }) => (
  <li style={{ '--d': i }} className="rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-xs font-medium text-sky-700">{children}</li>
)

// Links the `link.label` part of a role, leaving the rest as plain text.
const Role = ({ role, link }) => {
  if (!link || !role.includes(link.label)) return role
  const [before, after] = role.split(link.label)
  return (
    <>
      {before}
      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:text-sky-600 hover:underline">
        {link.label}
      </a>
      {after}
    </>
  )
}

const Timeline = ({ items }) => (
  <ol className="timeline relative space-y-8 border-l border-slate-200">
    <span className="tl-fill" aria-hidden="true" />
    <span className="tl-cursor" aria-hidden="true"><Blob className="blob-calm blob-react" size={22} /></span>
    {items.map((x) => (
      <li key={x.role} className="relative pl-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className="font-semibold text-slate-800"><Role role={x.role} link={x.link} /></h3>
          <p className="text-sm text-slate-500">{x.date}</p>
        </div>
        <p className="text-sm font-medium text-sky-700">{x.place}</p>
        {x.description && <p className="mt-2 leading-relaxed">{x.description}</p>}
      </li>
    ))}
  </ol>
)

const Section = ({ id, title, reveal = true, children }) => (
  <section id={id} aria-labelledby={`${id}-h`} className={`${reveal ? 'reveal ' : ''}lg:scroll-mt-24 mb-24`}>
    <h2 id={`${id}-h`} className="mb-8 text-sm font-bold uppercase tracking-widest text-slate-800">{title}</h2>
    {children}
  </section>
)

// GSAP stays out of the initial bundle: fetched once the page is idle after load, or when the
// events section comes within 1.5 viewports. Same specifiers as /cdg, so the chunks are shared.
let gsapReady
const loadGsap = () => (gsapReady ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })
  return { gsap, ScrollTrigger }
}))
const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))

const Photo = ({ img, className = '' }) => img.placeholder ? (
  <div className={`grid aspect-[4/3] short:aspect-[2/1] place-content-center justify-items-center gap-2 rounded-xl bg-linear-to-br from-sky-50 to-sky-200 text-sky-700 ${className}`}>
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M3 8h4l2-3h6l2 3h4v11H3Z" /><circle cx="12" cy="13" r="3.5" />
    </svg>
    <span className="px-2 text-center font-mono text-[11px] leading-tight text-balance">Photo coming soon</span>
  </div>
) : (
  <img
    src={img.src} srcSet={img.srcSet} sizes={img.srcSet && '(min-width: 1024px) 40vw, 90vw'} alt={img.alt}
    width={img.w} height={img.h} loading="lazy"
    className={`aspect-[4/3] short:aspect-[2/1] rounded-xl object-cover ${img.pos ?? 'object-[50%_60%] short:object-[50%_45%]'} ${className}`}
  />
)

// One leg of the route: its content centred in the stage, then its dot and city on the route line
// (data-dot is measured by Events).
const Leg = ({ className, place, children }) => (
  <div className={`flex shrink-0 snap-start flex-col ${className}`}>
    {children}
    <div aria-hidden="true" className="h-10 text-center font-mono text-[11px] uppercase tracking-wider text-slate-500">
      <span data-dot className="relative mx-auto mb-2 block size-2.5 rounded-full bg-sky-500 ring-4 ring-white" />
      {place}
    </div>
  </div>
)

// One event as an open spread: no card, photos beside the text on lg, above it on phones.
const Stop = ({ e }) => {
  const id = useId()
  const [main, ...rest] = e.images ?? []
  const row = rest.length > 1 // photo row: under the main photo on phones, straddling its bottom edge on lg
  const meta = [e.date, e.place, e.organizer].filter(Boolean).join(' · ')
  // the end stop mirrors the heading: it fills the right column, and its extra margin pushes the
  // previous spread off-screen, so the left column can fade back in over empty space
  const width = !main ? 'w-[88cqw] lg:ml-(--bl) lg:w-[calc(100cqw-var(--bl)-var(--br))]' : e.wide ? 'w-[88cqw] lg:w-[70cqw]' : 'w-[88cqw] lg:w-[62cqw]'
  return (
    <Leg className={width} place={e.stop ?? e.place}>
      <article
        tabIndex={0}
        aria-labelledby={id}
        className={`my-auto grid gap-5 short:gap-3 rounded-2xl ${main ? `${row ? 'lg:grid-cols-[1.7fr_1fr]' : 'lg:grid-cols-[1.2fr_1fr]'} lg:items-center lg:gap-x-12` : 'text-center'}`}
      >
        {meta && <p className="col-span-full font-mono text-xs uppercase tracking-wider text-slate-500">{meta}</p>}
        {main && (
          <div className={`relative ${row ? 'lg:mr-4 lg:mb-[12%]' : rest.length ? 'mr-4 mb-8' : ''}`}>
            <Photo img={main} className="w-full" />
            {rest.length > 0 && (
              <div className={`flex gap-2 ${row ? 'mt-2 lg:absolute lg:-right-4 lg:bottom-0 lg:left-8 lg:mt-0 lg:translate-y-1/2' : 'absolute -right-4 -bottom-8 w-2/5'}`}>
                {rest.map((img, i) => <Photo key={i} img={img} className="min-w-0 flex-1 ring-4 ring-white" />)}
              </div>
            )}
          </div>
        )}
        <div className={row ? 'max-lg:-mt-2' : undefined}>
          {e.label && <p className="mb-2 font-mono text-xs uppercase tracking-wider text-sky-700">{e.label}</p>}
          <h3 id={id} className={main ? 'text-2xl font-bold text-slate-800 short:text-xl lg:text-4xl' : 'text-3xl font-medium text-slate-500 lg:text-5xl'}>{e.title}</h3>
          {e.result && <p className="mt-3"><span className="inline-block rounded-full bg-sky-700 px-3 py-1 text-sm font-semibold text-white">{e.result}</span></p>}
          {e.project && <p className="mt-3 font-semibold text-slate-800 lg:text-lg">{e.project}</p>}
          {e.line && <p className="mt-1 leading-relaxed short:text-[15px] short:leading-snug lg:text-xl">{e.line}</p>}
          {e.tags && <ul className="tags mt-4 flex flex-wrap gap-2" aria-label="Technologies">{e.tags.map((t, i) => <Tag key={t} i={i}>{t}</Tag>)}</ul>}
          {e.link && <a href={e.link.href} target={e.link.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="mt-4 inline-block font-semibold text-sky-700 hover:underline lg:text-lg">{e.link.label}</a>}
        </div>
      </article>
    </Leg>
  )
}

// "The Route": a CSS-sticky stage whose track moves right to left as the page scrolls through a
// wrapper as tall as the travel plus one viewport. The wrapper height is measured here (no GSAP
// needed), so layout is final before GSAP arrives; one scrubbed timeline then drives the track,
// the route fill and the mascot. On lg the stage breaks out to the full viewport width and the
// left column fades out while it is stuck (data-chapter on <html>, see .sidecol in index.css).
// Reduced motion: a native swipe strip, blob parked at the first dot.
function Events() {
  const wrap = useRef(null)
  const stage = useRef(null)
  const track = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    const w = wrap.current, s = stage.current, t = track.current
    let ST, mm, started = false, dead = false
    const ro = new ResizeObserver(() => {
      const r = w.getBoundingClientRect()
      w.style.setProperty('--bl', r.left + 'px') // lg: the stage bleeds out by these, to the viewport edges
      w.style.setProperty('--br', root.clientWidth - r.right + 'px')
      const dots = t.querySelectorAll('[data-dot]')
      const x = (d) => d.offsetLeft + d.offsetWidth / 2
      t.style.setProperty('--r0', x(dots[0]) + 'px')
      t.style.setProperty('--rw', x(dots[dots.length - 1]) - x(dots[0]) + 'px')
      w.style.setProperty('--dist', t.offsetWidth - s.clientWidth + 'px')
      dispatchEvent(new Event('resize')) // the page below moved: Home and Shell re-measure
      ST?.refresh()
    })
    ro.observe(t)

    const go = () => {
      if (started || dead) return
      started = true
      io.disconnect()
      loadGsap().then(({ gsap, ScrollTrigger }) => {
        if (dead) return
        ST = ScrollTrigger
        mm = gsap.matchMedia(w)
        // one of motion/reduce always matches — gsap.matchMedia skips the callback when none does
        mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ({ conditions: { reduce } }) => {
          const onToggle = (st) => root.toggleAttribute('data-chapter', st.isActive)
          // reduced motion: the strip is full width too, so the left column hides while it's on screen
          if (reduce) ScrollTrigger.create({ trigger: w, start: 'top bottom', end: 'bottom top', onToggle })
          else gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: w, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true, onToggle } })
            .to(t, { x: () => s.clientWidth - t.offsetWidth }, 0)
            .to('[data-fill]', { scaleX: 1 }, 0)
            .to('[data-blob]', { x: () => w.querySelector('[data-fill]').offsetWidth }, 0)
          return () => root.removeAttribute('data-chapter')
        })
        Promise.all([document.fonts.ready, loaded]).then(() => dead || ScrollTrigger.refresh())
      })
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && go(), { rootMargin: '150% 0px' })
    io.observe(w)
    loaded.then(() => (window.requestIdleCallback ?? setTimeout)(go))
    return () => { dead = true; ro.disconnect(); io.disconnect(); mm?.revert() }
  }, [])

  // Tab: scroll the page to where the focused spread is centred (the swipe strip scrolls itself).
  const onFocus = (e) => {
    const col = e.target.closest('article')?.parentElement
    if (!col || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const w = wrap.current, t = track.current, sw = stage.current.clientWidth
    const p = Math.min(Math.max((col.offsetLeft + col.offsetWidth / 2 - sw / 2) / (t.offsetWidth - sw), 0), 1)
    scrollTo({ top: w.getBoundingClientRect().top + scrollY + p * (w.offsetHeight - innerHeight) })
  }

  const line = 'absolute bottom-[calc(2.5rem-5px)]'
  return (
    <section id="events" aria-labelledby="events-h" className="mb-24 scroll-mt-(--bar-h) lg:scroll-mt-0">
      <div ref={wrap} className="h-[calc(var(--dist,0px)+100svh-var(--bar-h))] lg:h-[calc(var(--dist,0px)+100svh)] motion-reduce:h-auto">
        <div
          ref={stage}
          className="events-stage @container sticky top-(--bar-h) -mx-6 h-[calc(100svh-var(--bar-h))] overflow-clip py-6 md:-mx-12 lg:top-0 lg:-mr-(--br) lg:-ml-(--bl) lg:h-svh motion-reduce:static motion-reduce:h-auto motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:overflow-x-auto motion-reduce:scroll-px-6 md:motion-reduce:scroll-px-12 lg:motion-reduce:scroll-pl-(--bl)"
        >
          <div ref={track} onFocus={onFocus} className="relative flex h-full w-max gap-[8cqw] px-6 md:px-12 lg:gap-[9cqw] lg:pr-(--br) lg:pl-(--bl)">
            <span aria-hidden="true" className={`${line} inset-x-0 h-px bg-sky-200 lg:right-(--br) lg:left-(--bl)`} />
            <span data-fill aria-hidden="true" className={`${line} left-(--r0) h-px w-(--rw) origin-left bg-sky-500 motion-reduce:hidden`} style={{ transform: 'scaleX(0)' }} />
            <span data-blob aria-hidden="true" className={`${line} left-(--r0) z-10 -translate-x-1/2 translate-y-1/2 rounded-full bg-white p-0.5 will-change-transform`}>
              <Blob className="blob-calm blob-react" size={22} />
            </span>
            <Leg className="w-[88cqw] lg:w-[calc(100cqw-var(--bl)-var(--br))]">
              <div className="my-auto">
                <p className="font-mono text-sm uppercase tracking-widest text-sky-700 lg:text-base">On the road</p>
                <h2 id="events-h" className="mt-3 text-5xl font-extrabold tracking-tight text-balance text-slate-800 lg:text-7xl">Events &amp; Competitions</h2>
                <p aria-hidden="true" className="mt-6 font-mono text-sm text-slate-500"><span className="motion-reduce:hidden">scroll</span><span className="hidden motion-reduce:inline">swipe</span> →</p>
              </div>
            </Leg>
            {events.map((e) => <Stop key={e.title} e={e} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

// --- The Catch (Projects): each project is a fish, hooked and reeled up; at the surface it becomes
// its card. A CSS-sticky stage inside a tall wrapper (same technique as Events and the /cdg story),
// one scrubbed timeline. All positions are percentages of the water, so nothing is measured.
const DEPTH = 50 // metres at the bottom of the water, for the depth meter
const depthOf = (i) => 0.18 + (0.66 * i) / Math.max(projects.length - 1, 1) // each fish a little deeper
const fishX = [-32, 5, -24, 8, -36, 3] // fish mouth, in % of the water's width from the line
const fishColor = ['#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd']
const STEP = 4.7 // timeline time per project: drop 1, bite 0.4, reel 1, catch 0.5, hold 1.6, release 0.5 (overlaps the next drop)

// Facing left, mouth at x = 0.
const Fish = ({ color, className = '' }) => (
  <svg aria-hidden="true" viewBox="0 0 32 16" width="32" height="16" className={className}>
    <path fill={color} d="M0 8C6 1 18 1 24 8 18 15 6 15 0 8Zm23 0 9-6-2 6 2 6Z" />
    <circle cx="6" cy="7" r="1.3" fill="#fff" />
  </svg>
)

function catchTimeline(gsap, root, scrollTrigger) {
  const q = gsap.utils.selector(root)
  const hook = q('[data-hook]'), line = q('[data-line]'), meter = q('[data-meter]')[0], glad = q('[data-glad]')
  gsap.set(q('[data-card]'), { y: 16, scale: 0.94, transformOrigin: '50% 100%' }) // opacity 0 comes from CSS
  gsap.set(q('[data-ring]'), { scale: 0.3 })
  gsap.set(q('[data-pos]'), { transformOrigin: '0% 50%' })
  let shown = 0
  const tl = gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger,
    onUpdate() { // the meter follows the hook; text is written only when the number changes
      const m = Math.round((gsap.getProperty(hook[0], 'yPercent') / 100) * DEPTH)
      if (m !== shown) meter.textContent = `DEPTH ${(shown = m)} m`
    },
  })
  const sink = (f, t, d = 1) => tl
    .to(hook, { yPercent: f * 100, duration: d, ease: 'power1.inOut' }, t)
    .to(line, { scaleY: f, duration: d, ease: 'power1.inOut' }, t)

  projects.forEach((_, i) => {
    const t = i * STEP, f = depthOf(i)
    const fish = q(`[data-fish="${i}"]`), pos = q(`[data-fish="${i}"] [data-pos]`)
    sink(f, t) // 1. the line drops
    tl.to(q('[data-rig]'), { keyframes: { x: [5, -4, 0] }, duration: 0.4 }, t + 1) // 2. the bite: one tug
      .to(q(`[data-fish="${i}"] [data-ring]`), { keyframes: { opacity: [0.9, 0], scale: [1.2, 2] }, duration: 0.5 }, t + 1)
      .to(q(`[data-fish="${i}"] [data-tag]`), { opacity: 0, duration: 0.2 }, t + 1)
      .to(fish, { xPercent: -fishX[i], duration: 0.4, ease: 'power2.out' }, t + 1)
      .to(pos, { rotation: 70, duration: 0.4 }, t + 1)
    sink(0, t + 1.4) // 3. the reel: the fish rises with the hook
    tl.to(fish, { yPercent: -f * 100, duration: 1, ease: 'power1.inOut' }, t + 1.4)
      .to(pos, { opacity: 0, scale: 1.6, duration: 0.4 }, t + 2.4) // 4. the catch: fish → card
      .to(q('[data-card]')[i], { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }, t + 2.4)
      .set(glad, { attr: { 'data-glad': 1 } }, t + 2.4)
      .addLabel(`catch${i}`, t + 2.9)
      .to(q('[data-card]')[i], { opacity: 0, x: -60, duration: 0.5, ease: 'power1.in' }, t + 4.5) // 5. release
      .set(glad, { attr: { 'data-glad': 0 } }, t + 4.5)
  })
  const t = projects.length * STEP + 0.3 // end beat: the line rests, a quiet line of text
  sink(0.1, t, 0.6)
  return tl.to(q('[data-end]'), { opacity: 1, duration: 0.4 }, t + 0.4).addLabel('end').to({}, { duration: 0.6 })
}

function Catch() {
  const wrap = useRef(null)
  const timeline = useRef(null)

  useEffect(() => {
    const w = wrap.current, stage = w.firstElementChild
    // QA helper: #/?catch=N freezes project N at its catch moment (for screenshots). Inert without it.
    const n = +(location.hash.match(/[?&]catch=(\d+)/)?.[1] ?? 0)
    const pick = n >= 1 && n <= projects.length ? n : 0
    let mm, started = false, dead = false
    // the idle drift, waves and bubbles run only while the section is on screen
    const idle = new IntersectionObserver(([e]) => stage.classList.toggle('on', e.isIntersecting))
    idle.observe(w)

    const go = () => {
      if (started || dead) return
      started = true
      near.disconnect()
      loadGsap().then(({ gsap, ScrollTrigger }) => {
        if (dead) return
        mm = gsap.matchMedia(w)
        // one of motion/reduce always matches — gsap.matchMedia skips the callback when none does
        mm.add({ desktop: '(min-width: 1024px)', motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
          if (conditions.reduce) {
            if (pick) w.querySelectorAll('[data-card]')[pick - 1].scrollIntoView({ block: 'center', behavior: 'instant' })
            return
          }
          const tl = timeline.current = catchTimeline(gsap, w, {
            trigger: w, start: 'top top', end: 'bottom bottom', scrub: 0.5,
            // phones rely on the holds: snapping fights a flicking thumb. No inertia, or a Tab jump
            // (instant scroll = huge velocity) would be projected several catches further.
            snap: conditions.desktop && { snapTo: 'labelsDirectional', inertia: false, duration: { min: 0.2, max: 0.5 }, delay: 0.1, ease: 'power1.inOut' },
          })
          let live = true
          Promise.all([document.fonts.ready, loaded]).then(() => {
            if (!live) return
            ScrollTrigger.refresh()
            if (!pick) return
            const st = tl.scrollTrigger
            const top = st.labelToScroll(`catch${pick - 1}`)
            st.disable(false)
            scrollTo({ top, behavior: 'instant' })
            tl.pause(`catch${pick - 1}`)
          })
          return () => { live = false; timeline.current = null }
        })
      })
    }
    const near = new IntersectionObserver(([e]) => e.isIntersecting && go(), { rootMargin: '150% 0px' })
    near.observe(w)
    loaded.then(() => (window.requestIdleCallback ?? setTimeout)(go))
    return () => { dead = true; idle.disconnect(); near.disconnect(); mm?.revert() }
  }, [])

  // Tab: scroll the page to the focused project's catch, so its card is the one on screen.
  const onFocus = (e) => {
    const i = [...e.currentTarget.children].indexOf(e.target.closest('li'))
    const st = timeline.current?.scrollTrigger
    if (i >= 0 && st) scrollTo({ top: st.labelToScroll(`catch${i}`), behavior: 'instant' }) // smooth would race the desktop snap
  }

  return (
    <div ref={wrap} style={{ '--n': projects.length }} className="h-[calc(var(--n)*80svh)] lg:h-[calc(var(--n)*65svh)] motion-reduce:h-auto">
      <div className="catch sticky top-(--bar-h) -mx-6 flex h-[calc(100svh-var(--bar-h))] flex-col pt-4 [--lx:58%] md:-mx-12 lg:top-0 lg:mx-0 lg:h-svh lg:py-10 motion-reduce:static motion-reduce:h-auto">
        {/* above the water: the cards surface here, one at a time (all in one grid cell) */}
        <div className="relative px-6 pb-4 md:px-12 lg:px-0 motion-reduce:order-last motion-reduce:pt-8 motion-reduce:pb-0">
          <ol onFocus={onFocus} className="grid items-end motion-reduce:block motion-reduce:space-y-5">
            {projects.map((p, i) => (
              <li key={p.title} className="[grid-area:1/1]">
                <article
                  data-card
                  tabIndex={p.href ? undefined : 0}
                  aria-labelledby={`catch-${i}`}
                  className="rounded-2xl border border-sky-100 bg-white p-6 short:p-5 transition-shadow hover:shadow-lg hover:shadow-sky-100 motion-safe:opacity-0"
                >
                  <h3 id={`catch-${i}`} className="font-semibold text-slate-800">
                    <Fish color={fishColor[i]} className="mr-2 inline-block align-[-2px]" />
                    {p.title}
                    {p.badge && <span className="ml-2 inline-block align-middle rounded-full bg-sky-700 px-2.5 py-0.5 text-xs font-semibold text-white">{p.badge}</span>}
                  </h3>
                  <p className="mt-2 leading-relaxed">{p.description}</p>
                  <ul className="tags mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                    {p.tags.map((t, i) => <Tag key={t} i={i}>{t}</Tag>)}
                  </ul>
                  {p.href && <a href={p.href} className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline">Open the project →</a>}
                </article>
              </li>
            ))}
          </ol>
          <p data-end className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-slate-500 motion-safe:opacity-0 motion-reduce:static motion-reduce:mt-8">That&rsquo;s the catch for now.</p>
        </div>

        {/* the boat on the waterline: Blob, rod, and the line from the rod tip to the water */}
        <div aria-hidden="true" className="relative z-10 h-16 flex-none">
          <span data-glad="0" className="catch-blob absolute bottom-2 left-[calc(var(--lx)-106px)]"><Blob className="blob-react" size={36} /></span>
          <svg viewBox="0 0 70 44" width="70" height="44" className="absolute bottom-3.5 left-[calc(var(--lx)-70px)] overflow-visible" fill="none" stroke="#334155" strokeLinecap="round">
            <path d="M0 40 69 2" strokeWidth="2" /><circle cx="9" cy="35" r="3" strokeWidth="1.5" />
          </svg>
          <span className="absolute bottom-0 left-(--lx) h-[54px] w-px bg-slate-700" />
          <svg viewBox="0 0 80 22" width="80" height="22" className="absolute -bottom-2 left-[calc(var(--lx)-128px)]">
            <path d="M2 3h76l-11 17H13Z" fill="#fff" stroke="#0369a1" strokeWidth="2" strokeLinejoin="round" /><path d="M8 9h64" stroke="#7dd3fc" strokeWidth="2" />
          </svg>
        </div>

        {/* underwater */}
        <div aria-hidden="true" className="relative min-h-40 flex-1 overflow-clip bg-linear-to-b from-sky-100 to-sky-700 lg:rounded-b-2xl motion-reduce:h-56 motion-reduce:flex-none">
          <svg viewBox="0 0 200 8" preserveAspectRatio="none" className="catch-wave absolute -top-1 left-0 h-2 w-[200%]">
            <path d="M0 4q6.25-4 12.5 0t12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0" fill="none" stroke="#38bdf8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          {[12, 30, 78, 90].map((x, i) => (
            <span key={x} className="catch-bubble absolute inset-0" style={{ '--d': `${7 + i * 1.7}s`, '--w': `${-i * 2.3}s` }}>
              <span className="absolute -bottom-2 size-1.5 rounded-full border border-white/70" style={{ left: `${x}%` }} />
            </span>
          ))}
          {projects.map((p, i) => (
            <div key={p.title} data-fish={i} className="absolute inset-0">
              <div data-pos className="absolute" style={{ top: `${depthOf(i) * 100}%`, left: `calc(var(--lx) + ${fishX[i]}%)` }}>
                <span data-ring className="absolute -top-3 -left-3 size-6 rounded-full border-2 border-white opacity-0" />
                <div className="catch-drift -mt-2 flex items-center gap-1.5" style={{ '--d': `${5 + (i % 3)}s` }}>
                  <Fish color={fishColor[i]} />
                  <span data-tag className="rounded-full bg-white px-1.5 font-mono text-[10px] leading-4 text-sky-800">{p.fish}</span>
                </div>
              </div>
            </div>
          ))}
          <div data-rig className="absolute inset-0">
            <span data-line className="absolute top-0 left-(--lx) h-full w-px origin-top bg-slate-700" style={{ transform: 'scaleY(0)' }} />
            <div data-hook className="absolute inset-0">
              <svg viewBox="0 0 10 16" width="10" height="16" className="absolute top-0 left-[calc(var(--lx)-6px)]" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 0v10a3 3 0 0 1-6 0V8" />
              </svg>
            </div>
          </div>
          <p data-meter className="absolute bottom-3 left-4 font-mono text-xs tracking-wider text-white">DEPTH 0 m</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [active, setActive] = useState('about')
  useReveal()

  useEffect(() => {
    const root = document.documentElement
    const still = matchMedia('(prefers-reduced-motion: reduce)')
    const cssTimelines = CSS.supports('animation-timeline: view()')
    const lists = [...document.querySelectorAll('.timeline')].map((ol) => ({
      ol,
      fill: ol.querySelector('.tl-fill'),
      cursor: ol.querySelector('.tl-cursor'),
      items: [...ol.querySelectorAll('li')],
    }))
    let lastActive = null
    let geo = null

    // Everything the loop needs, measured once per layout change. Reading geometry inside the
    // loop forces a layout every frame, which is what makes phones drop frames.
    const docTop = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y }
    const measure = () => {
      geo = {
        maxScroll: root.scrollHeight - innerHeight,
        line: innerHeight * 0.72,
        sections: sections.map((id) => ({ id, top: docTop(document.getElementById(id)) })),
        lists: lists.map((l) => {
          const top = docTop(l.ol)
          const h = l.ol.offsetHeight
          l.ol.style.setProperty('--tl-h', h + 'px') // how far the mascot travels, for the CSS animation
          l.items.forEach((li) => { li.dataset.at = (docTop(li) + 12 - top) / h })
          return { ...l, top, h, next: 0 }
        }),
      }
      requestFrame()
    }

    // Pure arithmetic on cached geometry, then writes. No layout reads, no React state.
    const frame = () => {
      if (!geo) return
      const y = scrollY
      const atBottom = y >= geo.maxScroll - 2
      const current = atBottom
        ? sections.at(-1)
        : geo.sections.findLast((s) => s.top - y <= 120)?.id ?? sections[0]
      if (current !== lastActive) { lastActive = current; setActive(current) }

      // Timeline. Position is a CSS scroll-driven animation where supported, so the only work
      // here is lighting the next item as the line passes it — arithmetic, no layout, and it
      // stops touching the list once everything is lit.
      if (!still.matches) for (const l of geo.lists) {
        if (l.next >= l.items.length && cssTimelines) continue
        const p = Math.min(Math.max((geo.line - (l.top - y)) / l.h, 0), 1)
        if (!cssTimelines) {
          l.fill.style.transform = `scale3d(1, ${p.toFixed(4)}, 1)`
          l.cursor.style.transform = `translate3d(0, ${(p * l.h).toFixed(1)}px, 0)`
        }
        while (l.next < l.items.length && p >= +l.items[l.next].dataset.at) l.items[l.next++].classList.add('lit')
      }

    }
    const stop = onFrame(frame)

    measure()
    document.fonts.ready.then(measure)
    addEventListener('resize', measure)
    return () => {
      stop()
      removeEventListener('resize', measure)
    }
  }, [])

  return (
    <>
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg">
        Skip to content
      </a>

      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:flex lg:gap-16">
        <header className="sidecol pt-12 pb-12 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-5/12 lg:flex-col lg:justify-between lg:py-16">
          <div className="flex flex-col">
            <h1 className="order-1 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800">Abdullah</h1>
            <ProfileCard className="pc-desk order-2 mx-auto my-8 w-[80%] max-w-[300px] lg:order-first lg:mx-0 lg:mb-8 lg:mt-0" />
            <p className="order-3 text-lg font-semibold text-slate-800 text-balance lg:mt-3">AI Engineer — LLMs, Computer Vision &amp; AI&nbsp;Agents</p>
            <p className="order-4 mt-4 max-w-xs leading-relaxed">
              I build AI that reads, sees and acts, from language models and vision systems to voice agents.
            </p>

            <nav aria-label="Sections" className="sidenav order-5 mt-10 hidden lg:block">
              <ul className="space-y-1">
                {sections.map((id) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={active === id ? 'true' : undefined}
                      className={`group flex items-center gap-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        active === id ? 'text-sky-700' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className={`h-px transition-all ${active === id ? 'w-16 bg-sky-600' : 'w-8 bg-slate-300 group-hover:w-16 group-hover:bg-slate-500'}`} />
                      {id}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <ul className="mt-8 flex gap-5 text-2xl text-slate-500">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} aria-label={label} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="hover:text-sky-600 transition-colors">
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </header>

        <main className="pb-16 lg:w-7/12 lg:py-24">
          {/* no fade: About is the LCP element */}
          <Section id="about" title="About" reveal={false}>
            <div className="space-y-4 leading-relaxed">
              <p>I'm an AI engineer working across large language models, computer vision and AI agents.</p>
              <p>I've done research at the HIVE Lab at the University of Toronto and studied artificial intelligence at Umm Al-Qura University.</p>
              <p>I care about models that work in practice, and about clean, fast interfaces that let people actually use them.</p>
            </div>
          </Section>

          <Section id="experience" title="Experience">
            <Timeline items={experience} />
          </Section>

          <Section id="education" title="Education">
            <Timeline items={education} />
            <p className="mt-8 text-sm leading-relaxed"><span className="font-semibold text-slate-800">Certifications:</span> {certifications}</p>
          </Section>

          <Section id="projects" title="Projects" reveal={false}>
            <Catch />
          </Section>

          <Events />

          <Section id="skills" title="Skills">
            <dl className="space-y-6">
              {Object.entries(skills).map(([group, items]) => (
                <div key={group}>
                  <dt className="mb-3 text-sm font-semibold text-slate-800">{group}</dt>
                  <dd><ul className="tags flex flex-wrap gap-2">{items.map((s, i) => <Tag key={s} i={i}>{s}</Tag>)}</ul></dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="contact" title="Contact">
            <Contact />
          </Section>

          <footer className="text-sm text-slate-500">© {new Date().getFullYear()} Abdullah</footer>
        </main>
      </div>
    </>
  )
}
