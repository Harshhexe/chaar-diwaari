import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center edge-x">
      <div className="text-center">
        <p className="t-label text-oxide">404</p>
        <h1 className="t-display mt-4 text-[clamp(3rem,14vw,11rem)] leading-[0.82] text-bone">
          NOTHING HERE
        </h1>
        <p className="t-meta mt-6">THIS PAGE IS NOT PART OF THE TRANSMISSION</p>
        <Link
          href="/"
          data-cursor="HOME"
          className="t-label mt-10 inline-block border border-bone/25 px-6 py-4 text-bone transition-colors hover:border-oxide hover:text-oxide"
        >
          RETURN TO THE BEGINNING
        </Link>
      </div>
    </div>
  );
}
