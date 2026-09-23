import { lazy, Suspense, useEffect, useState } from 'react'
import Shell from './components/Shell.jsx'
import Home from './pages/Home.jsx'

// Hash routing: no server rewrites needed, and in-page anchors (#about) still work because only
// "#/..." counts as a route. The project page is lazy so it stays out of the homepage bundle.
const Cdg = lazy(() => import('./pages/Cdg.jsx'))

const routeOf = () => (location.hash.startsWith('#/cdg') ? 'cdg' : 'home')

export default function App() {
  const [route, setRoute] = useState(routeOf)

  useEffect(() => {
    const onHash = () => {
      const next = routeOf()
      setRoute((prev) => {
        if (prev !== next) scrollTo({ top: 0, behavior: 'auto' })
        return next
      })
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.title = route === 'cdg'
      ? 'ClinicalDenoiseGuard — Abdullah'
      : 'Abdullah — AI Engineer: LLMs, Computer Vision & AI Agents'
  }, [route])

  return (
    <Shell route={route} barTrigger={route === 'cdg' ? 160 : '.pc'}>
      {route === 'cdg' ? (
        <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-24 text-slate-500">Loading…</div>}>
          <Cdg />
        </Suspense>
      ) : (
        <Home />
      )}
    </Shell>
  )
}
