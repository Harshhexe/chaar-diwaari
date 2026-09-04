"use client";

import { artist } from "@/data/artist";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { cx } from "@/lib/utils";

/**
 * STREAMING
 * ---------------------------------------------------------------------------
 * The last thing before the credits. Giant type, no logos, no buttons that look
 * like buttons — and no invented URLs: a platform with no verified link is
 * rendered as inert type that says so, rather than as a dead link.
 */
export function Streaming() {
  const platforms = [...artist.streaming, ...artist.socialLinks];

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-[14vh] pb-[38vh] lg:pb-[48vh]" aria-label="Listen">
      <div className="edge-x grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16">
        <div>
          <Reveal variant="text" className="mb-6 flex items-center gap-3">
            <span className="t-label text-oxide">06</span>
            <span className="h-px w-10 bg-bone/25" />
            <span className="t-label text-paper">LISTEN</span>
          </Reveal>

          <SplitText
            as="h2"
            text="LISTEN TO"
            by="word"
            className="t-display t-hang block text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.84] text-bone"
          />
          <SplitText
            as="p"
            text="CHAAR DIWAARI"
            by="word"
            delay={0.08}
            className="t-display t-hang block text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.84] text-oxide"
          />

          <p className="t-meta mt-8 max-w-[42ch] normal-case leading-relaxed tracking-[0.06em] text-dust">
            Official streaming channels and profiles. Verified on Apple Music, Spotify, and YouTube.
          </p>
        </div>

        <Reveal variant="text" start="top 85%" duration={0.6}>
          <ul className="border-t border-bone/10 w-full">
            {platforms.map((p) => {
              const live = Boolean(p.href);
              const isYouTube = p.label.toUpperCase().includes("YOUTUBE");
              return (
                <li key={p.label} className="border-b border-bone/10">
                  <MagneticButton
                    as={live ? "a" : "div"}
                    strength={live ? 0.08 : 0}
                    {...(live
                      ? {
                          href: p.href as string,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          "data-cursor": "OPEN",
                          "aria-label": `${p.label} — opens in a new tab`,
                        }
                      : { "aria-disabled": "true" })}
                    className={cx(
                      "group flex w-full items-center justify-between gap-6 py-5 transition-colors hover:bg-bone/[0.04] sm:py-6",
                    )}
                  >
                    <span
                      className={cx(
                        "t-display text-[clamp(1.6rem,4vw,3.2rem)] leading-none transition-all duration-500",
                        live
                          ? "text-bone group-hover:translate-x-3 group-hover:text-white motion-reduce:group-hover:translate-x-0"
                          : "text-bone/25",
                        isYouTube && live ? "group-hover:text-oxide" : "",
                      )}
                    >
                      {p.label}
                    </span>
                    <span
                      className={cx(
                        "t-meta shrink-0 font-mono text-[0.72rem] tracking-[0.2em] transition-colors",
                        live ? "text-paper/80 group-hover:text-oxide" : "text-dust",
                      )}
                    >
                      {live ? "OPEN ↗" : "CATALOGUE"}
                    </span>
                  </MagneticButton>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
