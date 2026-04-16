import { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-campus/70">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 font-serif text-2xl text-ink">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
