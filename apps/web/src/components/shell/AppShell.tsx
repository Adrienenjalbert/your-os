import type { ReactNode } from "react";
import { TopBar } from "./TopBar";

/**
 * AppShell — the consistent product chrome wrapping every surface. Single
 * top bar; the page itself is responsible for its own header and content.
 *
 * The shell deliberately avoids a left rail at the top level — the
 * sub-navigation (e.g. Customise sections, Console tabs) belongs inside
 * each surface so the cognitive load on landing is low.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-(--color-bg)">
      <TopBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
