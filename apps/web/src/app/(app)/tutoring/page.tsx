'use client';

import { FormEvent, useEffect, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type TutoringRequest = {
  id: string;
  title: string;
  topic: string;
  description: string;
  course: string;
  status: 'OPEN' | 'MATCHED' | 'CLOSED';
};

export default function TutoringPage() {
  const [items, setItems] = useState<TutoringRequest[]>([]);
  const [form, setForm] = useState({
    title: '',
    topic: '',
    description: '',
    course: ''
  });

  const load = async () => {
    setItems(await apiRequest<TutoringRequest[]>('/tutoring/requests'));
  };

  useEffect(() => {
    void load();
  }, []);

  const createRequest = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest('/tutoring/requests', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    setForm({ title: '', topic: '', description: '', course: '' });
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
      <SectionCard title="Ask for help" eyebrow="We rise together">
        <form className="space-y-4" onSubmit={createRequest}>
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              placeholder={key}
              value={value}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            />
          ))}
          <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">
            Create tutoring request
          </button>
        </form>
      </SectionCard>
      <SectionCard title="Open peer support requests" eyebrow="Support system">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-[2rem] bg-mist p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-campus">{item.course} · {item.topic}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
                  {item.status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-ink/75">{item.description}</p>
              {item.status === 'OPEN' ? (
                <button
                  type="button"
                  className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                  onClick={async () => {
                    await apiRequest(`/tutoring/requests/${item.id}/claim`, {
                      method: 'POST'
                    });
                    await load();
                  }}
                >
                  Offer help
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
