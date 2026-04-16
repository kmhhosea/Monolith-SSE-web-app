'use client';

import { useEffect, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type DashboardState = {
  matches: Array<{ user: { id: string; fullName: string; course: string; university: string }; reasons: string[] }>;
  groups: Array<{ id: string; name: string; topic: string; memberCount: number }>;
  opportunities: Array<{ id: string; title: string; organization: string; type: string }>;
  posts: Array<{ id: string; content: string; createdAt: string }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardState>({
    matches: [],
    groups: [],
    opportunities: [],
    posts: []
  });

  useEffect(() => {
    const load = async () => {
      const [matches, groups, opportunities, posts] = await Promise.all([
        apiRequest<DashboardState['matches']>('/matching/collaborators'),
        apiRequest<DashboardState['groups']>('/study-groups'),
        apiRequest<DashboardState['opportunities']>('/opportunities'),
        apiRequest<DashboardState['posts']>('/feed/posts')
      ]);

      setData({ matches, groups, opportunities, posts });
    };

    void load();
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-6">
        <SectionCard title="Focus for today" eyebrow="Dashboard">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-mist p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-campus/70">Suggested collaborators</p>
              <p className="mt-3 text-4xl font-semibold text-ink">{data.matches.length}</p>
            </div>
            <div className="rounded-3xl bg-mist p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-campus/70">Active study groups</p>
              <p className="mt-3 text-4xl font-semibold text-ink">{data.groups.length}</p>
            </div>
            <div className="rounded-3xl bg-mist p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-campus/70">Open opportunities</p>
              <p className="mt-3 text-4xl font-semibold text-ink">{data.opportunities.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Suggested collaborators" eyebrow="Smart matching">
          <div className="grid gap-4 md:grid-cols-2">
            {data.matches.map((match) => (
              <article key={match.user.id} className="rounded-3xl bg-mist p-5">
                <h3 className="text-lg font-semibold text-ink">{match.user.fullName}</h3>
                <p className="mt-1 text-sm text-ink/65">
                  {match.user.course} · {match.user.university}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-ink/75">
                  {match.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Community pulse" eyebrow="Feed">
          <div className="space-y-4">
            {data.posts.slice(0, 4).map((post) => (
              <article key={post.id} className="rounded-3xl border border-ink/6 bg-mist p-4 text-sm leading-7 text-ink/75">
                {post.content}
              </article>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Upcoming opportunities" eyebrow="Momentum">
          <div className="space-y-4">
            {data.opportunities.slice(0, 4).map((item) => (
              <article key={item.id} className="rounded-3xl bg-ink p-4 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-sunrise/80">{item.type}</p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/72">{item.organization}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
