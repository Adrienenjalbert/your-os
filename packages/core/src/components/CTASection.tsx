export interface CTASectionProps {
  headline: string;
  subhead?: string;
  cta: { label: string; href: string };
}

export function CTASection({ headline, subhead, cta }: CTASectionProps) {
  return (
    <section className="rounded-2xl bg-[var(--color-brand-primary,#3b82f6)]/5 p-8 text-center">
      <h2 className="text-2xl font-semibold sm:text-3xl">{headline}</h2>
      {subhead ? <p className="mt-3 text-lg text-black/70">{subhead}</p> : null}
      <a
        href={cta.href}
        className="mt-6 inline-block rounded-md bg-[var(--color-brand-primary,#3b82f6)] px-6 py-3 font-medium text-white"
      >
        {cta.label}
      </a>
    </section>
  );
}
