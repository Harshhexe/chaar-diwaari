import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { albums, albumBySlug } from "@/data/albums";
import { songsOfAlbum } from "@/data/songs";
import { SafeImage } from "@/components/media/SafeImage";
import { Reveal } from "@/components/motion/Reveal";
import { Tracklist } from "@/components/sections/Tracklist";

/** Every record is known at build time — these pages are fully static. */
export function generateStaticParams() {
  return albums.map((a) => ({ album: a.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ album: string }>;
}): Promise<Metadata> {
  const { album: slug } = await props.params;
  const album = albumBySlug(slug);
  return {
    title: album ? `${album.title} — ${album.format}` : "Record",
    description: album?.description,
  };
}

/**
 * ALBUM ROUTE
 * ---------------------------------------------------------------------------
 * The deep-linkable form of the album environment. Reaching a record this way
 * skips the expand-from-artwork transition (there is nothing to expand from),
 * so it opens as a composed spread instead — same content, same tracklist
 * component, same player.
 */
export default async function AlbumPage(props: { params: Promise<{ album: string }> }) {
  const { album: slug } = await props.params;
  const album = albumBySlug(slug);
  if (!album) notFound();

  const tracks = songsOfAlbum(album.id);
  const index = albums.findIndex((a) => a.id === album.id);
  const next = albums[(index + 1) % albums.length];

  return (
    <article className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[80vh]"
        style={{
          backgroundImage: `radial-gradient(70% 50% at 30% 0%, ${album.tone}55, transparent 70%)`,
        }}
      />

      <div className="relative edge-x pb-[14vh] pt-[22vh]">
        <Reveal variant="text" className="mb-6 flex items-center gap-3">
          <Link href="/music" className="t-label text-paper transition-colors hover:text-oxide">
            ← MUSIC
          </Link>
          <span className="h-px w-8 bg-bone/20" />
          <span className="t-label text-dust">
            {String(index + 1).padStart(2, "0")} / {String(albums.length).padStart(2, "0")}
          </span>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,42%)_1fr] lg:gap-16">
          <div>
            <Reveal variant="mask" from="bottom">
              <div className="relative aspect-square w-full max-w-[560px] overflow-hidden">
                <SafeImage
                  image={album.artwork}
                  kind="artwork"
                  label={`ADD ARTWORK → /albums/${album.slug}`}
                  sizes="(max-width: 1024px) 92vw, 42vw"
                  priority
                />
              </div>
            </Reveal>

            <Reveal variant="text" delay={0.1} className="mt-8 max-w-[46ch]">
              <p className="t-meta">
                {album.format}
                <span className="mx-2 text-dust">/</span>
                {album.year}
                <span className="mx-2 text-dust">/</span>
                {tracks.length} TRACKS
              </p>
              <p className="mt-5 leading-relaxed text-paper/80">{album.description}</p>
              {album.appleUrl && (
                <a
                  href={album.appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="OPEN"
                  className="t-label mt-6 inline-block border border-bone/25 px-5 py-3 text-bone transition-colors hover:border-oxide hover:text-oxide"
                >
                  HEAR IT IN FULL ↗
                </a>
              )}
              {album.copyright && (
                <p className="t-meta mt-6 normal-case tracking-[0.06em] text-dust">
                  {album.copyright}
                </p>
              )}
            </Reveal>
          </div>

          <div>
            <Reveal variant="text">
              <h1 className="t-display t-hang text-[clamp(2.6rem,9vw,7rem)] leading-[0.82] text-bone">
                {album.title}
              </h1>
              {album.subtitle && <p className="t-meta mt-3">{album.subtitle}</p>}
            </Reveal>

            <div className="mt-10">
              <Tracklist album={album} />
            </div>

            <Reveal variant="text" delay={0.1} className="mt-16 border-t border-bone/10 pt-8">
              <p className="t-label mb-4 text-dust">NEXT RECORD</p>
              <Link
                href={`/music/${next.slug}`}
                data-cursor="OPEN"
                className="group flex items-baseline justify-between gap-6"
              >
                <span className="t-display text-[clamp(1.6rem,5vw,3.4rem)] leading-none text-bone transition-transform duration-500 group-hover:translate-x-3 motion-reduce:group-hover:translate-x-0">
                  {next.title}
                </span>
                <span className="t-meta shrink-0">{next.format}</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </article>
  );
}
