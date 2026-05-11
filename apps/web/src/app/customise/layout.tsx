import { CommandPalette } from "@/components/shell/CommandPalette";
import { CustomiseSidenav } from "@/components/shell/CustomiseSidenav";
import type { ReactNode } from "react";

export default function CustomiseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-0 lg:grid-cols-[16rem_1fr]">
        <CustomiseSidenav />
        <div className="min-w-0 px-4 py-8 sm:px-8">{children}</div>
      </div>
      <CommandPalette />
    </div>
  );
}
