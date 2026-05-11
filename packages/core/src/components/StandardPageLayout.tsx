import type { ReactNode } from "react";
import type { TenantBranding } from "../theming.js";

export interface StandardPageLayoutProps {
  branding: TenantBranding;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Outermost shell. Tenants wrap their App Router root layout in this.
 * Brand-agnostic: pulls org name + primary CTA from `branding`.
 */
export function StandardPageLayout({
  branding,
  header,
  footer,
  children,
}: StandardPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-brand-paper,white)] text-[var(--color-brand-ink,#111)]">
      {header ?? <DefaultHeader branding={branding} />}
      <main className="flex-1">{children}</main>
      {footer ?? <DefaultFooter branding={branding} />}
    </div>
  );
}

function DefaultHeader({ branding }: { branding: TenantBranding }) {
  return (
    <header className="border-b border-black/5 py-4">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="font-semibold text-base">
          {branding.organizationName}
        </a>
        <a
          href={branding.primaryCta.href}
          className="rounded-md bg-[var(--color-brand-primary,#3b82f6)] px-4 py-2 text-sm font-medium text-white"
        >
          {branding.primaryCta.label}
        </a>
      </div>
    </header>
  );
}

function DefaultFooter({ branding }: { branding: TenantBranding }) {
  return (
    <footer className="border-t border-black/5 py-8 text-sm text-black/60">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} {branding.organizationName}. {branding.domain}
      </div>
    </footer>
  );
}
