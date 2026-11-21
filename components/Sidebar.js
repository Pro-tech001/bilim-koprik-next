'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import { getSupabase } from '@/lib/supabase/client';

// items: [{ group } | { href, label, count }]
export default function Sidebar({ roleLabel, items, name, base }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) => (href === base ? pathname === base : pathname === href || pathname.startsWith(href + '/'));

  async function logout(e) {
    e.preventDefault();
    await getSupabase().auth.signOut();
    router.replace('/');
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <Logo />
      <span className="badge" style={{ alignSelf: 'flex-start' }}>{roleLabel}</span>
      <nav className="nav" aria-label="Asosiy menyu">
        {items.map((it, i) =>
          it.group ? (
            <span key={i} className="group">{it.group}</span>
          ) : (
            <Link key={it.href} href={it.href} className={isActive(it.href) ? 'active' : ''}>
              {it.label}
              {it.count ? <span className="count">{it.count}</span> : null}
            </Link>
          )
        )}
      </nav>
      <div className="side-foot">
        <span className="who">{name}</span>
        <a href="/" className="btn ghost sm" onClick={logout}>Chiqish</a>
      </div>
    </aside>
  );
}
