'use client';

import { ui } from '@/lib/ui';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Search,
  House,
  Users,
  ChevronRight,
  ChevronsUpDown,
  Sparkles,
  Bell,
  HelpCircle,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Menu,
} from 'lucide-react';

import { useWorkspace } from '@/providers/workspace-provider';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPeople = pathname.startsWith('/people');
  const [collapsed, setCollapsed] = useState(false),
    [mobileNav, setMobileNav] = useState(false);
  const { setModal } = useWorkspace();
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNav(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);
  function nav(href: string, label: string, Icon: typeof House, active: boolean, count?: number) {
    return (
      <Link
        title={collapsed ? label : undefined}
        className={ui(`nav-link ${active ? 'active' : ''}`)}
        href={href}
        onClick={() => setMobileNav(false)}
      >
        <Icon size={18} />
        <span>{label}</span>
        {count !== undefined && <small>{count}</small>}
      </Link>
    );
  }
  return (
    <div
      className={ui(
        `platform ${pathname === '/buyers' || pathname === '/people' ? 'directory-workspace' : ''} ${pathname.startsWith('/buyers/') || pathname.startsWith('/people/') ? 'profile-workspace' : ''} ${collapsed ? 'is-collapsed' : ''} ${mobileNav ? 'mobile-nav-open' : ''}`,
      )}
    >
      <a className={ui('skip-link')} href="#main-content">
        Skip to content
      </a>
      <aside className={ui('sidebar')}>
        <div className={ui('brand-row')}>
          <Link href="/" aria-label="Infoxem home" className="flex min-w-0 items-center">
            <BrandLogo iconOnly={collapsed} preload />
          </Link>
          <button
            className={ui('icon-button collapse-button')}
            aria-label="Collapse navigation"
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileNav(false);
            }}
          >
            <PanelLeftClose size={17} />
          </button>
        </div>
        <nav>
          {nav('/', 'Home', House, pathname === '/')}
          {nav('/buyers', 'Find buyers', Search, pathname.startsWith('/buyers'))}
          {nav('/people', 'People', Users, isPeople)}
          {nav('/enrichment', 'Data enrichment', Sparkles, pathname.startsWith('/enrichment'))}
          <button className={ui('nav-link')} onClick={() => setModal('campaigns')}>
            <Send size={18} />
            <span>Campaigns</span>
            <span className={ui('soon')}>Soon</span>
          </button>
        </nav>
        <div className={ui('sidebar-bottom')}>
          <button className={ui('nav-link')} onClick={() => setModal('help')}>
            <HelpCircle size={18} />
            <span>Help & resources</span>
            <ArrowUpRight size={14} />
          </button>
          <button className={ui('nav-link')} onClick={() => setModal('settings')}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className={ui('account-button')} onClick={() => setModal('settings')}>
            <span className={ui('user-avatar')}>KP</span>
            <span>
              <strong>Kartavya Patel</strong>
              <small>Apex Pharma</small>
            </span>
            <ChevronsUpDown size={14} />
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          className={ui('nav-backdrop')}
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className={ui('app-content min-w-0')}>
        <header className={ui('topbar')}>
          <div className={ui('topbar-start')}>
            <button
              className={ui('icon-button menu-button')}
              aria-label="Open navigation"
              onClick={() => {
                if (collapsed) {
                  setCollapsed(false);
                  setMobileNav(true);
                } else setMobileNav(!mobileNav);
              }}
            >
              {collapsed ? <PanelLeftOpen size={19} /> : <Menu size={19} />}
            </button>
            <span className={ui('workspace-crumb')}>
              Workspace <ChevronRight size={13} />{' '}
              <strong>
                {pathname === '/'
                  ? 'Overview'
                  : pathname.startsWith('/enrichment')
                    ? 'Data enrichment'
                    : isPeople
                      ? 'People'
                      : 'Find buyers'}
              </strong>
            </span>
          </div>
          <button className={ui('global-search')} onClick={() => setModal('search')}>
            <Search size={15} />
            <span>Search anything...</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className={ui('topbar-actions')}>
            <span className={ui('demo-label')}>
              <span />
              Demo workspace
            </span>
            <button
              className={ui('icon-button')}
              aria-label="Notifications"
              onClick={() => setModal('notifications')}
            >
              <Bell size={18} />
              <i />
            </button>
            <span className={ui('topbar-divider')} />
            <button
              className={ui('user-avatar')}
              aria-label="Your account"
              onClick={() => setModal('settings')}
            >
              KP
            </button>
          </div>
        </header>
        <main id="main-content" aria-label="Infoxem workspace">
          {children}
        </main>
      </div>
    </div>
  );
}
