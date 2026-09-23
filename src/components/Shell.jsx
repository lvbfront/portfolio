import { useEffect, useState } from 'react'
import Blob from './Blob.jsx'

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

// Fade sections and tag lists in, once each. Pages call this themselves: a lazy page mounts after
// Shell's effect has run, so observing from Shell would miss everything on it.
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    document.querySelectorAll('.reveal, .tags').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// Page chrome shared by every route: sky blobs, scroll progress, fade-ins, and the mobile bar.
// It also drives the mascots: scroll velocity is smoothed into --tilt/--eye-h/--eye-s, so the
// expression eases in and out instead of snapping between fixed states.
// `barTrigger` is a selector whose exit shows the bar, or a scroll distance in px.
export default function Shell({ route, barTrigger, children }) {
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const noTimeline = !CSS.supports('animation-timeline: scroll()')
    const still = matchMedia('(prefers-reduced-motion: reduce)')

    let raf = 0
    let lastY = scrollY
    let vel = 0 // smoothed px/frame; the smoothing is what keeps quick flips from flickering
    const frame = () => {
      raf = 0
      const dy = scrollY - lastY
      lastY = scrollY

      if (noTimeline) root.style.setProperty('--progress', scrollY / (root.scrollHeight - innerHeight || 1))
      if (typeof barTrigger === 'number') setShowBar(scrollY > barTrigger)

      if (!still.matches) {
        vel += (dy - vel) * 0.18
        root.style.setProperty('--tilt', clamp(vel * 0.45, -10, 10).toFixed(2))
        root.style.setProperty('--eye-h', clamp((vel - 3) / 12, 0, 1).toFixed(3))
        root.style.setProperty('--eye-s', clamp((-vel - 3) / 12, 0, 1).toFixed(3))
        // keep ticking while it settles, so the face eases back after scrolling stops
        if (Math.abs(vel) > 0.05) raf = requestAnimationFrame(frame)
      }
    }
    const onScroll = () => { raf ||= requestAnimationFrame(frame) }
    frame()
    addEventListener('scroll', onScroll, { passive: true })

    let barIO
    if (typeof barTrigger === 'string') {
      const el = document.querySelector(barTrigger)
      if (el) {
        barIO = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' })
        barIO.observe(el)
      }
    }
    return () => {
      removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      barIO?.disconnect()
    }
  }, [route, barTrigger])

  return (
    <>
      <div className="sky" aria-hidden="true"><span /><span /><span /></div>
      <div className="progress" aria-hidden="true" />
      {/* Mobile only: compact "me" bar. inert while hidden so it isn't focusable. */}
      <div className={`minibar flex items-center justify-between lg:hidden ${showBar ? 'on' : ''}`} inert={!showBar}>
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
        <Blob className="blob-react" size={28} />
      </div>
      {children}
    </>
  )
}
