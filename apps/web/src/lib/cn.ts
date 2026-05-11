/**
 * Minimal className concatenator. We intentionally avoid clsx/tailwind-merge
 * to keep the bundle lean (M1 ratchet: ≤200kb gz/route).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
