'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    university: '',
    course: '',
    skills: 'Leadership, Collaboration',
    interests: 'Technology for impact, Research',
    goals: 'Find peers, Build projects'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authApi.register({
        ...form,
        skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
        interests: form.interests.split(',').map((item) => item.trim()).filter(Boolean),
        goals: form.goals.split(',').map((item) => item.trim()).filter(Boolean)
      });
      router.push('/dashboard');
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-mesh px-4 py-10">
      <section className="w-full max-w-2xl rounded-[2.5rem] border border-white/70 bg-white/92 p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-campus/70">Join the campus</p>
        <h1 className="mt-4 font-serif text-4xl text-ink">Create your academic profile.</h1>
        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className={key === 'goals' || key === 'interests' || key === 'skills' ? 'md:col-span-2' : ''}>
              <span className="text-sm font-medium capitalize text-ink">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                value={value}
                type={key === 'password' ? 'password' : 'text'}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            </label>
          ))}
          {error ? <p className="md:col-span-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-sm text-ink/65">
          Already registered? <Link className="font-semibold text-campus" href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
