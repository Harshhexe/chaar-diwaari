import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { cx } from "@/lib/utils";

interface Props {
  index: string;
  label: string;
  title: string;
  /** Secondary line, set in the editorial serif. */
  lede?: string;
  align?: "left" | "right";
  className?: string;
  titleClassName?: string;
}

/**
 * The one masthead used by every section, so the site's rhythm — index, label,
 * giant title, optional editorial lede — never drifts between chapters.
 */
export function SectionHeader({
  index,
  label,
  title,
  lede,
  align = "left",
  className,
  titleClassName,
}: Props) {
  return (
    <header
      className={cx(
        "edge-x",
        align === "right" && "flex flex-col items-end text-right",
        className,
      )}
    >
      <Reveal variant="text" className="mb-5 flex items-center gap-3">
        <span className="t-label text-oxide">{index}</span>
        <span className="h-px w-10 bg-bone/25" />
        <span className="t-label text-paper">{label}</span>
      </Reveal>

      <SplitText
        as="h2"
        text={title}
        by="word"
        className={cx(
          "t-display t-hang glitch-hover block text-[clamp(3rem,13vw,11rem)] text-bone cursor-default",
          titleClassName,
        )}
      />

      {lede && (
        <Reveal variant="text" delay={0.15}>
          <p className="t-editorial mt-6 max-w-[28ch] text-[clamp(1.15rem,2.2vw,1.9rem)] text-paper/80">
            {lede}
          </p>
        </Reveal>
      )}
    </header>
  );
}
