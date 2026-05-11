import { Tag } from "@/components/ui/Tag";

/**
 * Surface the next HITL gate the user owns. Reads the string the headless
 * `homeViewModel` already computes (rule 060 — five HITL gates only).
 *
 * Visual: a quiet warn-toned card that sits at the top of the console home
 * page. Inspired by Search Console's "Coverage issues to review" banner —
 * non-modal, action-implied.
 */
export function HitlBanner({ message }: { message: string }) {
  return (
    <output
      aria-live="polite"
      className="flex items-baseline gap-3 rounded-md border border-(--color-warn)/25 bg-(--color-warn-soft) px-3 py-2 text-sm"
    >
      <Tag tone="warn">HITL</Tag>
      <p className="text-(--color-fg)">{message}</p>
    </output>
  );
}
