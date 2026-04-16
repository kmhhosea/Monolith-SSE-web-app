'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type Peer = {
  id: string;
  fullName: string;
  university: string;
  course: string;
  skills: string[];
  interests: string[];
};

export default function NetworkPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [peers, setPeers] = useState<Peer[]>([]);

  const load = async (value = '') => {
    const results = await apiRequest<Peer[]>(`/users/discover${value ? `?q=${encodeURIComponent(value)}` : ''}`);
    setPeers(results);
  };

  useEffect(() => {
    void load();
  }, []);

  const onSearch = async (event: FormEvent) => {
    event.preventDefault();
    await load(query);
  };

  return (
    <SectionCard title="Peer network" eyebrow="Discover">
      <form className="mb-6 flex flex-col gap-3 md:flex-row" onSubmit={onSearch}>
        <input
          className="flex-1 rounded-full border border-ink/10 bg-mist px-5 py-3 outline-none"
          placeholder="Search by course, university, or name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white" type="submit">
          Search
        </button>
      </form>
      <div className="grid gap-4 lg:grid-cols-2">
        {peers.map((peer) => (
          <article key={peer.id} className="rounded-[2rem] bg-mist p-5">
            <h3 className="text-lg font-semibold text-ink">{peer.fullName}</h3>
            <p className="mt-1 text-sm text-ink/65">{peer.course} · {peer.university}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {peer.skills.slice(0, 4).map((skill) => (
                <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-campus">
                  {skill}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink/75">
              Interests: {peer.interests.length ? peer.interests.join(', ') : 'Still building their profile'}
            </p>
            <button
              type="button"
              className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              onClick={async () => {
                const conversation = await apiRequest<{ id: string }>('/messaging/conversations/direct', {
                  method: 'POST',
                  body: JSON.stringify({ peerId: peer.id })
                });
                router.push(`/messages?conversation=${conversation.id}`);
              }}
            >
              Start direct chat
            </button>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
