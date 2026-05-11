export interface HubLink {
  label: string;
  href: string;
  description?: string;
}

export function InternalLinkHub({
  title,
  links,
}: {
  title: string;
  links: HubLink[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <li key={link.href} className="rounded-lg border border-black/5 p-5">
            <a href={link.href} className="font-medium text-[var(--color-brand-primary,#3b82f6)]">
              {link.label}
            </a>
            {link.description ? (
              <p className="mt-2 text-sm text-black/60">{link.description}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
