import { CommandPalette } from "@/components/shell/CommandPalette";
import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  // The product TopBar (rendered in the root layout's AppShell) already shows
  // the brand and the Onboarding/Console/Customise tab. The onboarding shell
  // adds the Stepper + content + an in-page command palette.
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      {children}
      <CommandPalette />
    </div>
  );
}
