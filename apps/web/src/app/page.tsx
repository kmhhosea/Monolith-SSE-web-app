import Link from 'next/link';

const highlights = [
  'Discover peers across universities and courses',
  'Build study groups, projects, and shared knowledge',
  'Install the campus as a fast mobile-friendly PWA'
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-mesh px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2.5rem] border border-white/70 bg-white/88 p-8 shadow-soft md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-campus/70">
            SSE Academic Collaboration Platform
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight text-ink md:text-6xl">
            A digital home for students building Tanzania's future together.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/75">
            The platform keeps SSE students connected across universities, countries, and disciplines
            so they can study, mentor, collaborate, and turn ideas into real impact.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-white"
            >
              Join the campus
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-ink/10 bg-white px-6 py-3 text-center text-sm font-semibold text-ink"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-3xl bg-mist p-4 text-sm leading-7 text-ink/80">
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[2.5rem] border border-white/70 bg-ink p-8 text-white shadow-soft md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sunrise/80">
            Product vision
          </p>
          <div className="mt-6 space-y-5 text-sm leading-7 text-white/82">
            <p>The dashboard answers what to focus on today and who to work with.</p>
            <p>The peer network connects students by course, skills, goals, and interests.</p>
            <p>The project hub turns ideas into buildable workstreams with roles and tasks.</p>
            <p>The knowledge layer grows into a collective intelligence system for the SSE community.</p>
          </div>
          <div className="mt-8 rounded-[2rem] bg-white/10 p-5">
            <p className="text-sm font-semibold text-white">Designed for low bandwidth, real collaboration, and installable use.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
