export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Seconds → "m:ss". Returns "—:——" for unknown durations. */
export function formatTime(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return "—:——";
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "3:12" → 192. Used only for placeholder tracks with no real audio. */
export function parseDuration(mmss: string): number {
  const [m, s] = mmss.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(m) || Number.isNaN(s)) return 0;
  return m * 60 + s;
}

/** Marks strings that are still content placeholders, e.g. "[ADD REAL BIO]". */
export const isPlaceholderText = (s: string) => /^\s*\[ADD\b/i.test(s.trim());
