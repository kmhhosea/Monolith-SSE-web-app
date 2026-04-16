'use client';

import { FormEvent, useEffect, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type ResourceItem = {
  id: string;
  title: string;
  description: string;
  course?: string | null;
  fileUrl: string;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [form, setForm] = useState({ title: '', description: '', course: '', university: '', tags: 'Notes, Reference' });
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setResources(await apiRequest<ResourceItem[]>('/resources'));
  };

  useEffect(() => {
    void load();
  }, []);

  const onUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.set('tags', JSON.stringify(form.tags.split(',').map((item) => item.trim()).filter(Boolean)));
    data.append('file', file);

    await apiRequest('/resources', {
      method: 'POST',
      body: data
    });

    setFile(null);
    setForm({ title: '', description: '', course: '', university: '', tags: 'Notes, Reference' });
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
      <SectionCard title="Share a resource" eyebrow="Collective knowledge">
        <form className="space-y-4" onSubmit={onUpload}>
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              placeholder={key}
              value={value}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            />
          ))}
          <input
            className="w-full rounded-2xl border border-dashed border-ink/20 bg-mist px-4 py-4"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">
            Upload resource
          </button>
        </form>
      </SectionCard>
      <SectionCard title="Resource library" eyebrow="Searchable archive">
        <div className="space-y-4">
          {resources.map((resource) => (
            <article key={resource.id} className="rounded-[2rem] bg-mist p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{resource.title}</h3>
                  <p className="mt-1 text-sm text-campus">{resource.course ?? 'General resource'}</p>
                </div>
                <a
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                  href={`${resource.fileUrl}`}
                  target="_blank"
                >
                  Open
                </a>
              </div>
              <p className="mt-4 text-sm leading-7 text-ink/75">{resource.description}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
