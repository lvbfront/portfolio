import { useEffect, useState } from 'react'
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

// Edit projects here. `badge` and `href` are optional.
const projects = [
  {
    title: 'ClinicalDenoiseGuard (CDG)',
    badge: 'Research',
    href: '#/cdg',
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

export default function Home() {
  const [active, setActive] = useState('about')
  useReveal()

  useEffect(() => {
    const root = document.documentElement
    const mobile = matchMedia('(max-width: 1023px)')
    const still = matchMedia('(prefers-reduced-motion: reduce)')
    const cssTimelines = CSS.supports('animation-timeline: view()')
    const cards = [...document.querySelectorAll('.stack > li')]
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
      root.style.removeProperty('--stack-h')
      cards.forEach((c) => c.style.removeProperty('--s'))
      if (mobile.matches) root.style.setProperty('--stack-h', Math.max(...cards.map((c) => c.offsetHeight)) + 'px')
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
        cards: cards.map((c) => ({ el: c, top: docTop(c), h: c.offsetHeight, sticky: parseFloat(getComputedStyle(c).top) || 0 })),
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

      // Stacked cards: shrink each card as the next one slides over it. Writes only on change,
      // so a scroll that doesn't cover anything costs no style recalc.
      if (mobile.matches && !still.matches) {
        const tops = geo.cards.map((c) => Math.max(c.top - y, c.sticky))
        geo.cards.forEach((c, i) => {
          const covered = i < tops.length - 1 ? (tops[i] + c.h - tops[i + 1]) / c.h : 0
          const v = +(1 - 0.06 * Math.min(Math.max(covered, 0), 1)).toFixed(3)
          if (v !== c.s) { c.s = v; c.el.style.setProperty('--s', v) }
        })
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

          <Section id="projects" title="Projects">
            <ul className="stack space-y-5">
              {projects.map((p, i) => {
                const card = (
                  <>
                    <h3 className="font-semibold text-slate-800">
                      {p.title}
                      {p.badge && <span className="ml-2 inline-block align-middle rounded-full bg-sky-700 px-2.5 py-0.5 text-xs font-semibold text-white">{p.badge}</span>}
                    </h3>
                    <p className="mt-2 leading-relaxed">{p.description}</p>
                    <ul className="tags mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                      {p.tags.map((t, i) => <Tag key={t} i={i}>{t}</Tag>)}
                    </ul>
                    {p.href && <p className="mt-4 text-sm font-semibold text-sky-700">Read the write-up →</p>}
                  </>
                )
                return (
                  <li key={p.title} style={{ '--i': i }} className="rounded-2xl border border-sky-100 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-sky-100">
                    {p.href ? <a href={p.href} className="block hover:text-slate-800">{card}</a> : card}
                  </li>
                )
              })}
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
