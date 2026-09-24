// Singleton Lenis instance — shareable across components
import type Lenis from "lenis";

let _lenis: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  _lenis = l;
}

export function getLenis() {
  return _lenis;
}

export function startLenis() {
  _lenis?.start();
}

export function stopLenis() {
  _lenis?.stop();
}
