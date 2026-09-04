/**
 * Only one heavy video is allowed to play at a time. Every SafeVideo claims the
 * bus before calling play(); claiming pauses whoever held it. This is what
 * keeps an editorial page full of clips from melting a laptop.
 */
let current: HTMLVideoElement | null = null;

export function claimPlayback(el: HTMLVideoElement) {
  if (current && current !== el) {
    try {
      current.pause();
    } catch {
      /* element may already be detached */
    }
  }
  current = el;
}

export function releasePlayback(el: HTMLVideoElement) {
  if (current === el) current = null;
}
