import { describe, expect, it } from "vitest";
import { KEYBOARD_MAP, resolveKeyboardAction } from "./keyboard.js";

describe("KEYBOARD_MAP", () => {
  it("includes the four density-first commands", () => {
    const actions = KEYBOARD_MAP.map((b) => b.action);
    expect(actions).toContain("open-command-palette");
    expect(actions).toContain("approve-brief");
    expect(actions).toContain("next-item");
    expect(actions).toContain("prev-item");
  });
});

describe("resolveKeyboardAction", () => {
  it("resolves cmd-k to open-command-palette on Mac", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { platform: "MacIntel" },
      configurable: true,
    });
    const action = resolveKeyboardAction({ key: "k", metaKey: true });
    expect(action).toBe("open-command-palette");
  });

  it("resolves cmd-Enter to approve-brief", () => {
    const action = resolveKeyboardAction({ key: "Enter", metaKey: true });
    expect(action).toBe("approve-brief");
  });

  it("resolves bare 'j' to next-item", () => {
    const action = resolveKeyboardAction({ key: "j" });
    expect(action).toBe("next-item");
  });

  it("returns null for unmapped keys", () => {
    const action = resolveKeyboardAction({ key: "x" });
    expect(action).toBe(null);
  });
});
