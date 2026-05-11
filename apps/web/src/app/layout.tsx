import { AppShell } from "@/components/shell/AppShell";
import { DesignPartnerMode } from "@/components/shell/DesignPartnerMode";
import { KeyboardProvider } from "@/components/shell/KeyboardProvider";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "your-os — v1.1 Web Shell",
  description: "Onboarding, console, and customise surfaces for the multi-tenant SEO content OS.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d10" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-(--color-fg) focus:text-(--color-bg) focus:px-3 focus:py-1 focus:rounded"
        >
          Skip to main content
        </a>
        <KeyboardProvider>
          <AppShell>
            <div id="main">{children}</div>
          </AppShell>
          <DesignPartnerMode />
        </KeyboardProvider>
      </body>
    </html>
  );
}
