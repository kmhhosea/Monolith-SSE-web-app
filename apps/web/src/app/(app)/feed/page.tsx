'use client';

import { FormEvent, useEffect, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type Post = {
  id: string;
  content: string;
  tags: string[];
  likeCount: number;
  comments: Array<{ id: string; content: string }>;
};

export default function FeedPage() {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

  const load = async () => {
    setPosts(await apiRequest<Post[]>('/feed/posts'));
  };

  useEffect(() => {
    void load();
  }, []);

  const createPost = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest('/feed/posts', {
      method: 'POST',
      body: JSON.stringify({ content, tags: ['update', 'campus'] })
    });
    setContent('');
    await load();
  };

  return (
    <SectionCard title="Community feed" eyebrow="Academic momentum">
      <form className="mb-6 flex gap-3" onSubmit={createPost}>
        <input
          className="flex-1 rounded-full border border-ink/10 bg-mist px-5 py-3 outline-none"
          placeholder="Share a project milestone, study win, or helpful signal"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">
          Post
        </button>
      </form>
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-[2rem] bg-mist p-5">
            <p className="text-sm leading-7 text-ink/80">{post.content}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-campus">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                onClick={async () => {
                  await apiRequest(`/feed/posts/${post.id}/likes`, { method: 'POST' });
                  await load();
                }}
              >
                Like ({post.likeCount})
              </button>
            </div>
            {post.comments.length ? (
              <div className="mt-4 space-y-2 rounded-3xl bg-white p-4 text-sm text-ink/75">
                {post.comments.map((comment) => (
                  <p key={comment.id}>{comment.content}</p>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
