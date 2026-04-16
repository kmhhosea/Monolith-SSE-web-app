'use client';

import { FormEvent, useEffect, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type Opportunity = {
  id: string;
  title: string;
  type: string;
  organization: string;
  description: string;
  location: string;
  link?: string | null;
};

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'INTERNSHIP',
    organization: '',
    location: 'Remote / Tanzania',
    deadline: '',
    link: '',
    tags: 'Career, Growth'
  });

  const load = async () => {
    setItems(await apiRequest<Opportunity[]>('/opportunities'));
  };

  useEffect(() => {
    void load();
  }, []);

  const createOpportunity = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean)
      })
    });
    setForm({
      title: '',
      description: '',
      type: 'INTERNSHIP',
      organization: '',
      location: 'Remote / Tanzania',
      deadline: '',
      link: '',
      tags: 'Career, Growth'
    });
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
      <SectionCard title="Post an opportunity" eyebrow="Career board">
        <form className="space-y-4" onSubmit={createOpportunity}>
          {Object.entries(form).map(([key, value]) => (
            key === 'type' ? (
              <select
                key={key}
                className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                value={value}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="SCHOLARSHIP">Scholarship</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="RESEARCH">Research</option>
                <option value="OTHER">Other</option>
              </select>
            ) : (
              <input
                key={key}
                className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                placeholder={key}
                value={value}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
            )
          ))}
          <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">
            Publish opportunity
          </button>
        </form>
      </SectionCard>
      <SectionCard title="Opportunity board" eyebrow="For real growth">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-[2rem] bg-ink p-5 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-sunrise/85">{item.type}</p>
              <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-white/75">{item.organization} · {item.location}</p>
              <p className="mt-4 text-sm leading-7 text-white/82">{item.description}</p>
              {item.link ? (
                <a className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink" href={item.link}>
                  Open link
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
