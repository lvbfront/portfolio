// One rAF loop for the whole page. Everything scroll-linked subscribes here, so the blob, the
// timeline and the nav all update in the same frame as the page instead of each running its own
// loop. Callbacks write to the DOM directly — no React state per frame.
const subs = new Set()
let raf = 0

const tick = () => {
  raf = 0
  for (const cb of subs) cb()
}

export const requestFrame = () => { raf ||= requestAnimationFrame(tick) }

export function onFrame(cb) {
  if (!subs.size) {
    addEventListener('scroll', requestFrame, { passive: true })
    addEventListener('resize', requestFrame)
  }
  subs.add(cb)
  requestFrame()
  return () => {
    subs.delete(cb)
    if (!subs.size) {
      removeEventListener('scroll', requestFrame)
      removeEventListener('resize', requestFrame)
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}
