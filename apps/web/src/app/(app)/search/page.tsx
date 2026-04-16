'use client';

import { FormEvent, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type SearchResults = {
  users: Array<{ id: string; fullName: string; course: string; university: string }>;
  projects: Array<{ id: string; title: string; summary: string }>;
  resources: Array<{ id: string; title: string; description: string }>;
  feed: Array<{ id: string; content: string }>;
  opportunities: Array<{ id: string; title: string; organization: string }>;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    users: [],
    projects: [],
    resources: [],
    feed: [],
    opportunities: []
  });

  const onSearch = async (event: FormEvent) => {
    event.preventDefault();
    setResults(await apiRequest<SearchResults>(`/search?q=${encodeURIComponent(query)}`));
  };

  return (
    <SectionCard title="Search the ecosystem" eyebrow="Federated discovery">
      <form className="mb-6 flex flex-col gap-3 md:flex-row" onSubmit={onSearch}>
        <input
          className="flex-1 rounded-full border border-ink/10 bg-mist px-5 py-3 outline-none"
          placeholder="Search peers, projects, resources, feed, or opportunities"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white" type="submit">
          Search
        </button>
      </form>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[2rem] bg-mist p-5">
          <h3 className="text-lg font-semibold text-ink">Users</h3>
          <div className="mt-4 space-y-3 text-sm text-ink/75">
            {results.users.map((user) => (
              <p key={user.id}>{user.fullName} · {user.course} · {user.university}</p>
            ))}
          </div>
        </article>
        <article className="rounded-[2rem] bg-mist p-5">
          <h3 className="text-lg font-semibold text-ink">Projects</h3>
          <div className="mt-4 space-y-3 text-sm text-ink/75">
            {results.projects.map((project) => (
              <p key={project.id}>{project.title} · {project.summary}</p>
            ))}
          </div>
        </article>
        <article className="rounded-[2rem] bg-mist p-5">
          <h3 className="text-lg font-semibold text-ink">Resources</h3>
          <div className="mt-4 space-y-3 text-sm text-ink/75">
            {results.resources.map((resource) => (
              <p key={resource.id}>{resource.title} · {resource.description}</p>
            ))}
          </div>
        </article>
        <article className="rounded-[2rem] bg-mist p-5">
          <h3 className="text-lg font-semibold text-ink">Feed & opportunities</h3>
          <div className="mt-4 space-y-3 text-sm text-ink/75">
            {results.feed.map((post) => (
              <p key={post.id}>{post.content}</p>
            ))}
            {results.opportunities.map((opportunity) => (
              <p key={opportunity.id}>{opportunity.title} · {opportunity.organization}</p>
            ))}
          </div>
        </article>
      </div>
    </SectionCard>
  );
}
