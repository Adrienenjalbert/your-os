import { BriefEditor } from "@/components/console/BriefEditor";
import { loadBriefEditor } from "@/server/console-data";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BriefEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadBriefEditor(id);
  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-xs text-(--color-muted-fg)">
        <Link
          href="/console/briefs"
          prefetch={false}
          className="inline-flex items-center gap-1 hover:text-(--color-fg)"
        >
          <span aria-hidden="true">←</span> All briefs
        </Link>
      </nav>
      <BriefEditor initialDraft={data.draft} tenant={data.tenant} />
    </div>
  );
}
