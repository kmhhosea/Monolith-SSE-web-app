'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { API_URL } from '@/lib/config';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('student@sse.ac.tz');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authApi.login({ email, password });
      router.push('/dashboard');
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-mesh px-4 py-10">
      <section className="w-full max-w-md rounded-[2.5rem] border border-white/70 bg-white/92 p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-campus/70">Welcome back</p>
        <h1 className="mt-4 font-serif text-4xl text-ink">Enter your academic campus.</h1>
        <p className="mt-4 text-sm leading-7 text-ink/70">
          Sign in to reconnect with your peers, projects, and shared learning goals.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Password
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <a
          href={`${API_URL}/auth/google`}
          className="mt-4 block rounded-full border border-ink/10 px-5 py-3 text-center text-sm font-semibold text-ink"
        >
          Continue with Google
        </a>
        <p className="mt-6 text-sm text-ink/65">
          New to the platform? <Link className="font-semibold text-campus" href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
