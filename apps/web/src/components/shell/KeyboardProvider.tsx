"use client";

import { type ConsoleAction, KEYBOARD_MAP, resolveKeyboardAction } from "@your-os/console";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Binds the headless `KEYBOARD_MAP` from `@your-os/console` into the React
 * tree. Subscribers register a callback for one or more `ConsoleAction`s;
 * the provider dispatches when the keystroke matches.
 *
 * Multi-key sequences (`g h`, `g q`) are supported — the provider holds a
 * 1500ms-window buffer for the prefix key.
 *
 * Per the M2 ratchet, cmd-enter approve must round-trip in ≤1.5s p95 — we
 * therefore avoid any synchronous network calls inside this provider.
 */

type Listener = (action: ConsoleAction) => void;

interface KeyboardContextValue {
  subscribe(listener: Listener): () => void;
  bindings: typeof KEYBOARD_MAP;
  togglePalette(): void;
  paletteOpen: boolean;
  closePalette(): void;
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null);

const PREFIX_KEYS = new Set(["g"]);
const PREFIX_TIMEOUT_MS = 1500;

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const listeners = useRef<Set<Listener>>(new Set());
  const prefix = useRef<string | null>(null);
  const prefixTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const dispatch = useCallback((action: ConsoleAction) => {
    for (const fn of listeners.current) fn(action);
  }, []);

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const togglePalette = useCallback(() => setPaletteOpen((v) => !v), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isFormField =
        (tag === "input" && (target as HTMLInputElement).type !== "checkbox") ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable;

      // Allow cmd/ctrl combos to fire even inside form fields (cmd-enter is
      // explicitly designed to fire from the brief editor textarea).
      const allowInForm = event.metaKey || event.ctrlKey || event.key === "Escape";
      if (isFormField && !allowInForm) return;

      const key = event.key.toLowerCase();
      const isPrefix = PREFIX_KEYS.has(key) && !event.metaKey && !event.ctrlKey;

      if (isPrefix && prefix.current === null) {
        prefix.current = key;
        if (prefixTimer.current) clearTimeout(prefixTimer.current);
        prefixTimer.current = setTimeout(() => {
          prefix.current = null;
        }, PREFIX_TIMEOUT_MS);
        return;
      }

      const action = resolveKeyboardAction(
        { key: event.key, metaKey: event.metaKey, ctrlKey: event.ctrlKey },
        prefix.current ?? undefined,
      );
      if (action) {
        event.preventDefault();
        prefix.current = null;
        if (prefixTimer.current) clearTimeout(prefixTimer.current);
        if (action === "open-command-palette") {
          setPaletteOpen((v) => !v);
        } else if (action === "close-modal") {
          setPaletteOpen(false);
        }
        dispatch(action);
        // Fire-and-forget telemetry; failure must not block the keystroke.
        void fetch("/api/telemetry", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "console.keyboard.action", payload: { action } }),
        }).catch(() => undefined);
      }
    }

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (prefixTimer.current) clearTimeout(prefixTimer.current);
    };
  }, [dispatch]);

  const value = useMemo<KeyboardContextValue>(
    () => ({ subscribe, bindings: KEYBOARD_MAP, togglePalette, paletteOpen, closePalette }),
    [subscribe, togglePalette, paletteOpen, closePalette],
  );

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
}

export function useKeyboard(): KeyboardContextValue {
  const ctx = useContext(KeyboardContext);
  if (!ctx) throw new Error("useKeyboard must be used inside <KeyboardProvider>");
  return ctx;
}

export function useConsoleAction(action: ConsoleAction | ConsoleAction[], handler: () => void) {
  const { subscribe } = useKeyboard();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const set = new Set(Array.isArray(action) ? action : [action]);
    return subscribe((a) => {
      if (set.has(a)) handlerRef.current();
    });
  }, [action, subscribe]);
}
