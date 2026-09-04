"use client";

import { press } from "@/data/press";
import { Reveal } from "@/components/motion/Reveal";
import { cx } from "@/lib/utils";

/**
 * PRESS
 * ---------------------------------------------------------------------------
 * Minimal by design: a quote, a source, a year. Nothing is quoted here that is
 * not real — every entry ships as a labelled empty slot, and an entry with no
 * verified URL renders as plain text rather than a link to nowhere.
 */
export function Press() {
  return (
    <section className="relative py-[10vh]" aria-label="Press and interviews">
      <p className="t-label mb-[6vh] edge-x text-oxide">05.2 — PRESS</p>

      <ul className="edge-x">
        {press.map((item, i) => {
          const Tag = item.href ? "a" : "div";
          return (
            <li key={item.id} className="border-t border-bone/10 last:border-b">
              <Reveal variant="text" delay={i * 0.05}>
                <Tag
                  {...(item.href
                    ? {
                        href: item.href,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        "data-cursor": "OPEN",
                      }
                    : {})}
                  className={cx(
                    "group block py-[4.5vh]",
                    item.href && "transition-colors hover:bg-bone/[0.02]",
                  )}
                >
                  <blockquote>
                    <p className="t-editorial max-w-[22ch] text-[clamp(1.8rem,6vw,4.6rem)] leading-[1.02] text-bone">
                      “{item.quote}”
                    </p>
                    <footer className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                      <cite className="t-label not-italic text-paper">
                        {item.isArtistQuote
                          ? `CHAAR DIWAARI, TO ${item.source}`
                          : item.source}
                      </cite>
                      <span className="t-meta">{item.year}</span>
                      <span
                        className={cx(
                          "t-meta ml-auto",
                          item.href
                            ? "text-paper transition-transform duration-500 group-hover:translate-x-2 motion-reduce:group-hover:translate-x-0"
                            : "text-dust",
                        )}
                      >
                        {item.href ? "READ →" : "ARCHIVE"}
                      </span>
                    </footer>
                  </blockquote>
                </Tag>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <p className="t-meta mt-8 max-w-[62ch] edge-x normal-case leading-relaxed tracking-[0.06em] text-dust">
        Every quote above is verbatim from the named, dated piece it links to.
        Nothing is paraphrased or reassembled.
      </p>
    </section>
  );
}
