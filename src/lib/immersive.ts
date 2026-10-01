/**
 * "Immersive" mode: while a pinned scroll scene (a scroll film, the homepage journey)
 * fills the screen, the floating controls (chat launcher, quick actions, scroll to top)
 * step aside so they don't sit on the scene's captions. Each scene reports itself by key;
 * <html data-immersive> is set while any of them is pinned.
 */
const active = new Set<string>();

export function setImmersive(key: string, on: boolean) {
  if (typeof document === "undefined") return;
  const had = active.has(key);
  if (on === had) return;
  if (on) active.add(key);
  else active.delete(key);
  const root = document.documentElement;
  if (active.size) root.setAttribute("data-immersive", "");
  else root.removeAttribute("data-immersive");
}
