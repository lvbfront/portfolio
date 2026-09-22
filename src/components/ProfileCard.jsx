import { useEffect, useRef, useState } from 'react'

const highlights = ['Research @ University of Toronto', 'AI Engineer Intern @ First City', 'KAUST Academy AI Specialization']

// Flips 0 → 180deg over the first 70vh of scrolling on desktop (sticky column), 25vh on mobile
// (the card scrolls away with the page, so the flip must finish while it's still on screen).
// CSS scroll-driven animation where supported (see .pc-inner in index.css); rAF fallback sets --flip otherwise.
// Tapping adds another 180deg on an outer layer, so tap and scroll combine.
export default function ProfileCard({ className = '' }) {
  const ref = useRef(null)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return
    const el = ref.current
    const desktop = matchMedia('(min-width: 1024px)')
    let raf = 0
    const update = () => {
      raf = 0
      el.style.setProperty('--flip', Math.min(scrollY / (innerHeight * (desktop.matches ? 0.7 : 0.25)), 1))
    }
    const onScroll = () => { raf ||= requestAnimationFrame(update) }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setFlipped(!flipped)}
      aria-pressed={flipped}
      className={`pc block aspect-[4/5] ${className}`}
    >
      <div className="pc-tap size-full">
        <div className="pc-inner relative size-full">
          <img
            src="/me.webp"
            srcSet="/me-200.webp 200w, /me.webp 400w"
            sizes="(min-width: 1024px) 160px, 70vw"
            alt="Abdullah"
            width="400"
            height="500"
            fetchPriority="high"
            className="pc-face size-full object-cover rounded-2xl border border-sky-100 shadow-xl shadow-sky-200/60"
          />
          <div className="pc-face pc-back flex flex-col justify-center overflow-hidden rounded-2xl text-left bg-gradient-to-br from-sky-700 via-sky-800 to-sky-900 shadow-xl shadow-sky-200/60">
            {highlights.map((h) => (
              <p key={h} className="rounded-xl bg-white/10 border border-white/20 font-semibold text-white">{h}</p>
            ))}
            <span className="sr-only">(tap to flip)</span>
          </div>
        </div>
      </div>
    </button>
  )
}
