export interface Breadcrumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ trail }: { trail: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-4 text-sm text-black/60">
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <a href={crumb.href} className="hover:underline">
              {crumb.label}
            </a>
            {i < trail.length - 1 ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
