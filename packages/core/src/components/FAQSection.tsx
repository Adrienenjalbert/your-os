export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection({ items, title = "FAQ" }: { items: FAQItem[]; title?: string }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <dl className="mt-6 space-y-6">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="font-medium">{item.question}</dt>
            <dd className="mt-2 text-black/70">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
