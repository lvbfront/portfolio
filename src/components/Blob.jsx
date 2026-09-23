import { useId } from 'react'

// Decorative mascot: inline SVG, no deps. White ghutra with a black igal over a blue face.
// The cloth is the dominant shape on purpose: a thinner drape stops reading below ~28px.
// Idle bob + blink, squish and look up on hover/tap (see .blob in index.css).
// className="blob-calm" for a still one; expression drives the face (top bar only).
export default function Blob({ className = '', size = 28, expression = 'normal' }) {
  const id = useId() // two Blobs on the page must not share a gradient id
  return (
    <svg
      className={`blob blob-${expression} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#e8f4fd" />
        </linearGradient>
      </defs>
      <g className="blob-body">
        {/* ghutra: crown over the head, falling down BOTH SIDES of the face to the shoulders,
            with a softly scalloped hem (three broad waves — more would blur at 20px).
            Drawn first: the face sits on top of it, so the cloth never covers the forehead. */}
        <path
          fill={`url(#${id}c)`}
          stroke="#7dd3fc"
          strokeWidth="1.5"
          strokeLinejoin="round"
          d="M24 4c11 0 17 8 18 18 1 9 2 16 3 24c-5 3-9-3-14 0s-9 3-14 0-9 3-14 0c1-8 2-15 3-24C7 12 13 4 24 4Z"
        />
        {/* folds falling down the side falls */}
        <g fill="none" strokeLinecap="round">
          <path d="M8 21c-.8 8-1.4 15-1.8 22M40 21c.8 8 1.4 15 1.8 22" stroke="#bae6fd" strokeWidth="1.5" />
          <path d="M12 24c-.6 6-1 12-1.2 18M36 24c.6 6 1 12 1.2 18" stroke="#bae6fd" strokeWidth="1.3" opacity=".75" />
          <path d="M15.5 27c-.4 5-.7 9-.8 13M32.5 27c.4 5 .7 9 .8 13" stroke="#e0f2fe" strokeWidth="1.2" />
        </g>
        {/* face on top of the cloth, so crown shows above and forehead below the igal */}
        <circle cx="24" cy="30" r="15" fill={`url(#${id})`} />
        {/* front drape: cloth hanging below the igal across the top third of the forehead, with
            three broad scallops (more would muddy at 20px). It rises above the band too, so the
            igal reads as holding the fabric down, and its edges meet the side falls. */}
        <path
          fill={`url(#${id}c)`}
          d="M11.5 12c-.4 3.6-.2 6.4.4 8.6 2.4-.2 3.6 2.6 5.6 2.6s3.2-2.8 6.5-2.8 4.1 2.8 6.5 2.8 3.2-2.8 5.6-2.6c.6-2.2.8-5 .4-8.6-3-3.4-22-3.4-25 0Z"
        />
        {/* igal: drawn last, on top of the cloth — a ring seen from the front, so it reads as a
            near-straight band with its ends a little lower than the middle */}
        <path d="M9.5 17.5c5-3.6 24-3.6 29 0" stroke="#0b1220" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <g className="blob-eyes">
          <g className="eyes-normal" fill="#fff">
            <rect x="17.5" y="27" width="5" height="10" rx="2.5" />
            <rect x="25.5" y="27" width="5" height="10" rx="2.5" />
          </g>
          <g className="eyes-happy" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round">
            <path d="M15 33.5q3-6 6 0M27 33.5q3-6 6 0" />
          </g>
          <g className="eyes-surprised" fill="#fff">
            <circle cx="18.8" cy="31" r="4.2" />
            <circle cx="29.2" cy="31" r="4.2" />
          </g>
        </g>
      </g>
    </svg>
  )
}
