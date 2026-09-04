/**
 * HIGH-FREQUENCY PLAYBACK SIGNALS
 * ---------------------------------------------------------------------------
 * Playhead position and audio level change ~60 times a second. Routing that
 * through React state would re-render half the site every frame, so these two
 * values live in plain mutable objects that the provider writes to and that
 * visual components sample from inside their own RAF loops.
 *
 * React state is reserved for things that actually change discretely: which
 * track is loaded, whether it is playing, volume.
 */

/** Current playhead, in seconds. */
export const playhead = { current: 0, duration: 0 };

/**
 * Smoothed loudness, 0–1.
 * Real audio → RMS of the analyser's time-domain data.
 * Placeholder transport → a deterministic, musical-feeling envelope so the
 * reactive visuals can be designed and reviewed before any audio exists.
 */
export const level = { current: 0, bass: 0, isSynthetic: true };

/** Deterministic stand-in envelope: slow swell + a 2Hz pulse + drift. */
export function syntheticLevel(t: number): { rms: number; bass: number } {
  const pulse = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2)), 6);
  const swell = 0.35 + 0.25 * Math.sin(t * 0.31);
  const drift = 0.08 * Math.sin(t * 1.7 + 1.2);
  const rms = Math.min(1, Math.max(0, swell + pulse * 0.35 + drift));
  return { rms, bass: Math.min(1, rms * 0.7 + pulse * 0.5) };
}
