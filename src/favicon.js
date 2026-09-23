// Animated favicon: four faces, each pre-built once as a data URI at load. Switching is a single
// href assignment — no canvas, no redraw, and the only timer is a blink every 4-6s. While the tab
// is hidden the mascot sleeps and every timer is cleared, so a backgrounded tab does no work.
const face = (eyes) => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">` +
  `<circle cx="24" cy="24" r="24" fill="#0ea5e9"/>` +
  `<path d="M24 6c10 0 15 8 15 18v15H9V24C9 14 14 6 24 6Z" fill="#fff"/>` +
  `<rect x="14" y="19" width="20" height="20" rx="9" fill="#075985"/>` +
  `<rect x="9" y="15" width="30" height="4.5" rx="2.25" fill="#0b1220"/>` +
  eyes +
  `</svg>`,
)}`

const frames = {
  normal: face('<g fill="#fff"><rect x="17.75" y="25" width="5" height="8.5" rx="2.5"/><rect x="25.25" y="25" width="5" height="8.5" rx="2.5"/></g>'),
  blink: face('<g fill="#fff"><rect x="17.75" y="28.5" width="5" height="2.5" rx="1.25"/><rect x="25.25" y="28.5" width="5" height="2.5" rx="1.25"/></g>'),
  // sleeping: closed, curved downward
  sleep: face('<g fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M16.5 29.5q2.9 3 5.8 0"/><path d="M25.7 29.5q2.9 3 5.8 0"/></g>'),
  // welcome back: curved upward
  happy: face('<g fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M16.5 31q2.9-4 5.8 0"/><path d="M25.7 31q2.9-4 5.8 0"/></g>'),
}

export function startFavicon() {
  const link = document.querySelector('link[rel="icon"][type="image/svg+xml"]')
  if (!link || matchMedia('(prefers-reduced-motion: reduce)').matches) return // static icon

  let timer = 0
  const show = (name) => { link.href = frames[name] }
  const stop = () => { clearTimeout(timer); timer = 0 }

  const blinkLater = () => {
    timer = setTimeout(() => {
      show('blink')
      timer = setTimeout(() => { show('normal'); blinkLater() }, 160)
    }, 4000 + Math.random() * 2000)
  }

  document.addEventListener('visibilitychange', () => {
    stop()
    if (document.hidden) {
      show('sleep') // and nothing else runs until the tab is visible again
    } else {
      show('happy')
      timer = setTimeout(() => { show('normal'); blinkLater() }, 2000)
    }
  })

  show('normal')
  blinkLater()
}
