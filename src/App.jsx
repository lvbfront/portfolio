import { useEffect, useState } from 'react'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa6'
import Contact from './components/Contact.jsx'
import ProfileCard from './components/ProfileCard.jsx'

const socials = [
  { label: 'GitHub', href: 'https://github.com/lvbfront', Icon: FaGithub },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abdullah-bukhari-366074270/', Icon: FaLinkedin },
  { label: 'Email', href: 'mailto:abdu44ll3ah55@gmail.com', Icon: FaEnvelope },
]

const experience = [
  {
    role: 'AI Safety Research Scholar (SUDS Program)',
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

// Edit projects here. `badge` is optional.
const projects = [
  {
    title: 'ClinicalDenoiseGuard (CDG)',
    badge: 'Research',
    description:
      'Detecting and correcting prompt-injection attacks on diffusion LLMs using linear probes and activation steering (≈0.96 AUC). Paper and poster co-authored.',
    tags: ['PyTorch', 'LLMs', 'Interpretability', 'AI Safety'],
  },
  {
    title: 'Recyclable Materials Classifier',
    badge: '1st Place',
    description: 'Image classification model for sorting recyclable materials; won 1st place in an AI competition.',
    tags: ['Computer Vision', 'Deep Learning', 'TensorFlow'],
  },
  {
    title: 'Laqta — Event Photo Delivery + Voice Assistant',
    description:
      'Platform where photographers upload event photos live and guests scan a QR code to get only their own photos via face matching, with a voice assistant that books photographers in Saudi Arabic.',
    tags: ['Face Recognition', 'AI Agents', 'Voice AI', 'Full-stack'],
  },
  {
    title: 'Baggage Monitoring System',
    description: 'Real-time YOLO object detection that flags unattended luggage in airports when no person is nearby.',
    tags: ['Computer Vision', 'YOLO', 'Real-time'],
  },
  {
    title: 'pgai — Open-Source Contribution',
    description:
      'Extended the open-source pgai framework to support more LLM providers, including Google Gemini, with docs and integration guides.',
    tags: ['LLMs', 'Open Source', 'PostgreSQL'],
  },
]

const skills = {
  AI: ['LLMs', 'Computer Vision', 'AI Agents', 'PyTorch', 'TensorFlow', 'Hugging Face', 'Scikit-learn'],
  'Languages & Data': ['Python', 'SQL', 'PostgreSQL', 'Pandas', 'NumPy'],
  'Web & Tools': ['Django', 'FastAPI', 'React', 'Tailwind', 'Docker', 'Git', 'AWS'],
}

const sections = ['about', 'experience', 'education', 'projects', 'skills', 'contact']

const Tag = ({ i, children }) => (
  <li style={{ '--d': i }} className="rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-xs font-medium text-sky-700">{children}</li>
)

const Timeline = ({ items }) => (
  <ol className="space-y-8 border-l border-sky-100">
    {items.map((x) => (
      <li key={x.role} className="relative pl-6">
        <span className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-sky-500 ring-4 ring-white" aria-hidden="true" />
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className="font-semibold text-slate-800">{x.role}</h3>
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

export default function App() {
  const [active, setActive] = useState('about')
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const noTimeline = !CSS.supports('animation-timeline: scroll()')
    const mobile = matchMedia('(max-width: 1023px)')
    const still = matchMedia('(prefers-reduced-motion: reduce)')
    const cards = [...document.querySelectorAll('.stack > li')]

    // One rAF-throttled pass per scroll: nav highlight, progress fallback, card stacking.
    let raf = 0
    const frame = () => {
      raf = 0
      // Nav highlight: last section whose top has passed 120px (just under scroll-mt-24, so nav
      // clicks always land on the clicked section, even short ones); at page bottom, the last section.
      const atBottom = innerHeight + scrollY >= root.scrollHeight - 2
      setActive(atBottom ? sections.at(-1)
        : sections.findLast((id) => document.getElementById(id).getBoundingClientRect().top <= 120) ?? sections[0])

      if (noTimeline) root.style.setProperty('--progress', scrollY / (root.scrollHeight - innerHeight || 1))

      // Stacked cards: shrink each card as the next one slides over it (reads first, then writes).
      if (mobile.matches && !still.matches) {
        const tops = cards.map((c) => c.getBoundingClientRect().top)
        cards.forEach((c, i) => {
          const covered = i < cards.length - 1 ? (tops[i] + c.offsetHeight - tops[i + 1]) / c.offsetHeight : 0
          c.style.setProperty('--s', 1 - 0.06 * Math.min(Math.max(covered, 0), 1))
        })
      }
    }
    const onScroll = () => { raf ||= requestAnimationFrame(frame) }

    // Equal card heights on mobile so a taller card never peeks out under a shorter one.
    const sizeCards = () => {
      root.style.removeProperty('--stack-h')
      cards.forEach((c) => c.style.removeProperty('--s'))
      if (mobile.matches) root.style.setProperty('--stack-h', Math.max(...cards.map((c) => c.offsetHeight)) + 'px')
      frame()
    }
    sizeCards()
    document.fonts.ready.then(sizeCards)
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', sizeCards)

    // Fade-in sections and tag lists: reveal once, then stop watching.
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target) }
      }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    document.querySelectorAll('.reveal, .tags').forEach((el) => reveal.observe(el))

    // Mobile mini bar: show once the hero card has slid up under where the bar sits (56px).
    const barIO = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' })
    barIO.observe(document.querySelector('.pc'))
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', sizeCards)
      cancelAnimationFrame(raf)
      reveal.disconnect()
      barIO.disconnect()
    }
  }, [])

  return (
    <>
      <div className="sky" aria-hidden="true"><span /><span /><span /></div>
      <div className="progress" aria-hidden="true" />
      {/* Mobile only: compact "me" bar once the hero card is off screen. inert while hidden so it isn't focusable. */}
      <div className={`minibar lg:hidden ${showBar ? 'on' : ''}`} inert={!showBar}>
        <button
          type="button"
          onClick={() => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
          className="flex h-14 items-center gap-3 rounded-lg text-left"
        >
          <img src="/me.webp" alt="" width="36" height="36" className="minibar-avatar size-9 rounded-full object-cover object-[50%_20%] ring-2 ring-sky-100" />
          <span className="leading-tight">
            <span className="block text-sm font-bold text-slate-800">Abdullah</span>
            <span className="block text-xs text-slate-500">AI Engineer</span>
            <span className="sr-only">, back to top</span>
          </span>
        </button>
      </div>
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg">
        Skip to content
      </a>

      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:flex lg:gap-16">
        <header className="pt-12 pb-12 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-5/12 lg:flex-col lg:justify-between lg:py-16">
          <div>
            <ProfileCard className="pc-desk mx-auto mb-10 w-[70%] max-w-xs lg:mx-0 lg:mb-8" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800">Abdullah</h1>
            <p className="mt-3 text-lg font-semibold text-slate-800 text-balance">AI Engineer — LLMs, Computer Vision &amp; AI&nbsp;Agents</p>
            <p className="mt-4 max-w-xs leading-relaxed">
              I build AI that reads, sees and acts, from language models and vision systems to voice agents.
            </p>

            <nav aria-label="Sections" className="mt-10 hidden lg:block">
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

          <Section id="projects" title="Projects">
            <ul className="stack space-y-5">
              {projects.map((p, i) => (
                <li key={p.title} style={{ '--i': i }} className="rounded-2xl border border-sky-100 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-sky-100">
                  <h3 className="font-semibold text-slate-800">
                    {p.title}
                    {p.badge && <span className="ml-2 inline-block align-middle rounded-full bg-sky-700 px-2.5 py-0.5 text-xs font-semibold text-white">{p.badge}</span>}
                  </h3>
                  <p className="mt-2 leading-relaxed">{p.description}</p>
                  <ul className="tags mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                    {p.tags.map((t, i) => <Tag key={t} i={i}>{t}</Tag>)}
                  </ul>
                </li>
              ))}
            </ul>
          </Section>

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
