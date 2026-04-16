'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Briefcase, Compass, FolderKanban, HandHelping, Home, MessageCircle, Network, Search, Users } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/network', label: 'Peer Network', icon: Network },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/groups', label: 'Study Groups', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/tutoring', label: 'Peer Tutoring', icon: HandHelping },
  { href: '/feed', label: 'Community Feed', icon: Compass },
  { href: '/opportunities', label: 'Opportunities', icon: Briefcase }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft lg:block">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-campus/70">SSE Campus</p>
        <h2 className="mt-3 font-serif text-2xl text-ink">Academic home for builders.</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                pathname === item.href
                  ? 'bg-ink text-white'
                  : 'text-ink/70 hover:bg-mist hover:text-ink'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
