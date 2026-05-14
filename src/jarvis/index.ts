// Vendored from https://github.com/cyber1443/jarvis-ai-orb-web-animation (MIT, see ./LICENSE).
// Kept as source rather than an npm dependency so it stays auditable and restylable.

export { JarvisOrb } from "./JarvisOrb";
export type { JarvisOrbProps, JarvisQuality } from "./JarvisOrb";
export {
  PALETTES,
  STATE_TARGETS,
  SIZE_PRESETS,
  resolvePalette,
  resolveStateTarget,
} from "./states";
export type {
  JarvisState,
  JarvisStateName,
  JarvisStateTarget,
  JarvisPalette,
  JarvisPaletteName,
  JarvisPaletteValues,
  JarvisSize,
  JarvisSizePreset,
} from "./states";
