'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import { getSupabase } from '@/lib/supabase/client';
import { useT, LangSwitch } from '@/lib/i18n';

// items: [{ group } | { href, label, count }]
export default function Sidebar({ roleLabel, items, name, base }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();

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
      <span className="badge" style={{ alignSelf: 'flex-start' }}>{t(roleLabel)}</span>
      <nav className="nav" aria-label={t('Asosiy menyu')}>
        {items.map((it, i) =>
          it.group ? (
            <span key={i} className="group">{t(it.group)}</span>
          ) : (
            <Link key={it.href} href={it.href} className={isActive(it.href) ? 'active' : ''}>
              {t(it.label)}
              {it.count ? <span className="count">{it.count}</span> : null}
            </Link>
          )
        )}
      </nav>
      <div className="side-foot">
        <LangSwitch up />
        <span className="who">{name}</span>
        <a href="/" className="btn ghost sm" onClick={logout}>{t('Chiqish')}</a>
      </div>
    </aside>
  );
}
