/**
 * Keyboard map for the console. Density-first, keyboard-driven.
 * Mobile is read-only; these shortcuts are desktop-only.
 */

export type ConsoleAction =
  | "open-command-palette"
  | "approve-brief"
  | "next-item"
  | "prev-item"
  | "close-modal"
  | "edit-brief"
  | "reject-brief"
  | "switch-view-home"
  | "switch-view-queue"
  | "go-back";

export interface KeyboardBinding {
  /** Modifier key pattern, e.g. "cmd" / "ctrl". null = no modifier. */
  mod: "cmd" | "ctrl" | null;
  /** Lowercase key name from KeyboardEvent.key (or "enter", "escape"). */
  key: string;
  action: ConsoleAction;
  description: string;
}

export const KEYBOARD_MAP: readonly KeyboardBinding[] = [
  { mod: "cmd", key: "k", action: "open-command-palette", description: "Open command palette" },
  { mod: "cmd", key: "enter", action: "approve-brief", description: "Approve current brief" },
  { mod: null, key: "j", action: "next-item", description: "Next item in queue" },
  { mod: null, key: "k", action: "prev-item", description: "Previous item in queue" },
  { mod: null, key: "escape", action: "close-modal", description: "Close modal / clear selection" },
  { mod: null, key: "e", action: "edit-brief", description: "Edit current brief" },
  { mod: null, key: "r", action: "reject-brief", description: "Reject current brief" },
  { mod: null, key: "g h", action: "switch-view-home", description: "Go to Home" },
  { mod: null, key: "g q", action: "switch-view-queue", description: "Go to Opportunity queue" },
  { mod: null, key: "backspace", action: "go-back", description: "Go back" },
] as const;

export interface KeyboardEventLike {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
}

/**
 * Resolve a single keystroke to a ConsoleAction. Multi-key sequences (g h)
 * are resolved by the caller passing both keys joined as `g h`.
 */
export function resolveKeyboardAction(
  event: KeyboardEventLike,
  /** Optional 2-key sequence (e.g. ["g", "h"]) joined as "g h". */
  prefixSequence?: string,
): ConsoleAction | null {
  // We deliberately treat metaKey and ctrlKey as equivalent for binding
  // resolution. Old logic gated on navigator.platform, but headless browsers
  // (CI, Playwright) often report inconsistent platform strings, breaking
  // cmd-bound shortcuts. The console keymap has no overlap between cmd+key
  // and ctrl+key bindings, so accepting either is safe.
  const wantedMod: KeyboardBinding["mod"] = event.metaKey ? "cmd" : event.ctrlKey ? "ctrl" : null;
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/.test(navigator.platform ?? "");
  const key = (event.key ?? "").toLowerCase();
  const compoundKey = prefixSequence ? `${prefixSequence} ${key}` : key;

  for (const b of KEYBOARD_MAP) {
    if (b.key !== compoundKey && b.key !== key) continue;
    if (b.key.includes(" ") && b.key !== compoundKey) continue;
    if (!b.key.includes(" ") && b.key !== key) continue;
    if (b.mod === wantedMod) return b.action;
    // Treat cmd and ctrl as equivalent for binding resolution. The console
    // keymap declares one binding per (mod, key) pair, so this never causes
    // ambiguity. See the comment above on platform detection.
    if (b.mod === "cmd" && wantedMod === "ctrl") return b.action;
  }
  // isMac is intentionally unused at runtime today; UI components reach for
  // their own helper when labelling shortcuts. We keep the variable so the
  // intent (treat cmd/ctrl identically here) is documented in one place.
  void isMac;
  return null;
}
