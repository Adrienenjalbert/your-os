import { CommandPalette, type PaletteItem } from "@/components/shell/CommandPalette";
import { ConsoleSubnav } from "@/components/shell/ConsoleSubnav";
import { getBriefs } from "@/server/console-seed";
import type { ReactNode } from "react";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const briefs = await getBriefs();
  const briefItems: PaletteItem[] = briefs.map((b) => ({
    id: `brief-${b.id}`,
    label: `Brief · ${b.title}`,
    href: `/console/briefs/${b.id}`,
    group: "Briefs",
    hint: b.status,
  }));
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <ConsoleSubnav />
      {children}
      <CommandPalette extraItems={briefItems} />
    </div>
  );
}
