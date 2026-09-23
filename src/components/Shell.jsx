import { useEffect, useState } from 'react'
import Blob from './Blob.jsx'
import { onFrame } from '../scroll.js'

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
// It also sets the mascots' mood from scroll direction (see [data-mood] in index.css).
// `barTrigger` is a selector whose exit shows the bar, or a scroll distance in px.
export default function Shell({ route, barTrigger, children }) {
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const noTimeline = !CSS.supports('animation-timeline: scroll()')
    const still = matchMedia('(prefers-reduced-motion: reduce)')

    // Expression: any scroll movement of a couple of px flips the mood, held for a moment after
    // scrolling stops. Written as a data attribute, not React state, so it costs nothing per frame.
    let lastY = scrollY
    let mood = 'normal'
    let hold = 0
    let barOn = false
    let maxScroll = root.scrollHeight - innerHeight
    const remeasure = () => { maxScroll = root.scrollHeight - innerHeight }
    addEventListener('resize', remeasure)
    const setMood = (m) => { if (m !== mood) { mood = m; root.dataset.mood = m } }

    const stop = onFrame(() => {
      const dy = scrollY - lastY
      if (noTimeline) root.style.setProperty('--progress', scrollY / (maxScroll || 1))
      if (typeof barTrigger === 'number') {
        const on = scrollY > barTrigger
        if (on !== barOn) { barOn = on; setShowBar(on) } // only touch React when it changes
      }
      // small moves accumulate until they cross the threshold, so slow scrolling still triggers
      if (Math.abs(dy) >= 2) {
        lastY = scrollY
        if (!still.matches) {
          setMood(dy > 0 ? 'happy' : 'surprised')
          clearTimeout(hold)
          hold = setTimeout(() => setMood('normal'), 700)
        }
      }
    })

    let barIO
    if (typeof barTrigger === 'string') {
      const el = document.querySelector(barTrigger)
      if (el) {
        barIO = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' })
        barIO.observe(el)
      }
    }
    return () => {
      stop()
      clearTimeout(hold)
      removeEventListener('resize', remeasure)
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
