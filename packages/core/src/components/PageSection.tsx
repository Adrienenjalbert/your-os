import type { ReactNode } from "react";

export function PageSection({
  children,
  id,
  className = "",
  as: As = "section",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <As id={id} className={`py-10 sm:py-14 lg:py-20 ${className}`.trim()}>
      {children}
    </As>
  );
}
