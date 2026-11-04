import uqu from '../assets/logos/uqu.webp'
import kaust from '../assets/logos/kaust.webp'

const raster = {
  uqu: { src: uqu, alt: 'Umm Al-Qura University' },
  kaust: { src: kaust, alt: 'KAUST' },
}

const icon = 'size-[70%]'

// `logo` in the Experience/Education arrays picks one of these. Colour behaviour is in index.css (.logo-*).
export default function LogoChip({ logo }) {
  const r = raster[logo]
  return (
    <span className="relative grid size-8 flex-none place-items-center rounded-xl border border-sky-100 bg-white text-sky-700 sm:size-10">
      {r && (
        <>
          <span aria-hidden="true" className="logo-mono absolute inset-[15%]" style={{ WebkitMaskImage: `url(${r.src})`, maskImage: `url(${r.src})` }} />
          <img src={r.src} alt={r.alt} width="28" height="28" loading="lazy" decoding="async" className="logo-color absolute inset-[15%] size-[70%]" />
        </>
      )}
      {logo === 'maple' && (
        // The 11-point leaf from Wikimedia's Flag_of_Canada.svg (public domain), leaf subpath only.
        <svg role="img" aria-label="Canada" viewBox="2785 400 4030 4030" width="28" height="28" className={`logo-leaf ${icon}`}>
          <path fill="currentColor" d="M4890 4430l-45-863a95 95 0 0 1 111-98l859 151-116-320a65 65 0 0 1 20-73l941-762-212-99a65 65 0 0 1-34-79l186-572-542 115a65 65 0 0 1-73-38l-105-247-423 454a65 65 0 0 1-111-57l204-1052-327 189a65 65 0 0 1-91-27l-332-652-332 652a65 65 0 0 1-91 27l-327-189 204 1052a65 65 0 0 1-111 57l-423-454-105 247a65 65 0 0 1-73 38l-542-115 186 572a65 65 0 0 1-34 79l-212 99 941 762a65 65 0 0 1 20 73l-116 320 859-151a95 95 0 0 1 111 98l-45 863z" />
        </svg>
      )}
      {logo === 'building' && (
        <svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" className={icon} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V4h9v17M14 10h5v11M8.5 8h2M8.5 12h2M8.5 16h2" />
        </svg>
      )}
      {logo === 'code' && (
        <svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" className={icon} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
        </svg>
      )}
    </span>
  )
}
