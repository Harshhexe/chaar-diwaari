/**
 * Shared SVG filter definitions.
 *
 * Kept in one zero-size <svg> at the document root so any element can opt into
 * a real chromatic separation or displacement with `filter: url(#…)` instead of
 * every section shipping its own filter primitives.
 *
 * Server component — pure markup, no client cost.
 */
export function SvgFilters() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        {/* Red/blue separation. Subtle by design — 2px, not a glitch meme. */}
        <filter id="cd-rgb-split" x="-5%" y="-5%" width="110%" height="110%">
          <feOffset in="SourceGraphic" dx="-2.5" dy="0" result="r" />
          <feColorMatrix
            in="r"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="rc"
          />
          <feOffset in="SourceGraphic" dx="2.5" dy="0" result="b" />
          <feColorMatrix
            in="b"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="bc"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="gc"
          />
          <feBlend in="rc" in2="gc" mode="screen" result="rg" />
          <feBlend in="rg" in2="bc" mode="screen" />
        </filter>

        {/* Turbulent displacement for hover/transition distortion. */}
        <filter id="cd-displace" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.03"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
