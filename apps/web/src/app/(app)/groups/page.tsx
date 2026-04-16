'use client';

import { FormEvent, useEffect, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type StudyGroup = {
  id: string;
  name: string;
  topic: string;
  description: string;
  memberCount: number;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [form, setForm] = useState({ name: '', topic: '', description: '', meetingLink: '' });

  const load = async () => {
    setGroups(await apiRequest<StudyGroup[]>('/study-groups'));
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest('/study-groups', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    setForm({ name: '', topic: '', description: '', meetingLink: '' });
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.45fr_0.55fr]">
      <SectionCard title="Create a study group" eyebrow="Collaborate">
        <form className="space-y-4" onSubmit={onCreate}>
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              placeholder={key.replace(/([A-Z])/g, ' $1')}
              value={value}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            />
          ))}
          <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">
            Create group
          </button>
        </form>
      </SectionCard>
      <SectionCard title="Active study spaces" eyebrow="Peer learning">
        <div className="space-y-4">
          {groups.map((group) => (
            <article key={group.id} className="rounded-[2rem] bg-mist p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{group.name}</h3>
                  <p className="mt-1 text-sm text-campus">{group.topic}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink">
                  {group.memberCount} members
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-ink/75">{group.description}</p>
              <button
                type="button"
                className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                onClick={async () => {
                  await apiRequest(`/study-groups/${group.id}/join`, { method: 'POST' });
                }}
              >
                Join group
              </button>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
