import { ui } from '@/lib/ui';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Building2,
  Users,
  Plus,
  Globe2,
  Check,
  ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/records/record-display';
import { BrandLogo } from '@/components/ui/brand-logo';

import { DashboardStats } from './dashboard-widgets';
export function Dashboard() {
  return (
    <div className={ui('home-page')}>
      <div className={ui('page-heading')}>
        <div>
          <div className={ui('eyebrow')}>YOUR EXPORT WORKSPACE</div>
          <h1>
            Good morning, Kartavya <span className={ui('wave')}>✦</span>
          </h1>
          <p>New markets. Better connections. More possibilities.</p>
        </div>
        <Link className={ui('button primary')} href="/buyers">
          <Plus size={16} /> Find new buyers
        </Link>
      </div>
      <section className={ui('hero-panel')}>
        <div className={ui('hero-copy')}>
          <Badge tone="hero">
            <span className={ui('live-dot')} /> BUILT FOR PHARMA EXPORTERS
          </Badge>
          <h2>
            Your next market
            <br />
            starts with the right buyer.
          </h2>
          <p>
            Discover pharmaceutical buyers, connect with decision-makers,
            <br className={ui('desktop-break')} /> and turn global opportunities into lasting
            partnerships.
          </p>
          <div className={ui('hero-actions')}>
            <Link className={ui('button primary')} href="/buyers">
              Explore buyers <ArrowRight size={16} />
            </Link>
            <Link className={ui('hero-secondary')} href="/people">
              Find decision-makers <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className={ui('hero-foot')}>
            <ShieldCheck size={14} /> Pharma-focused intelligence <span>·</span> One connected
            workspace
          </div>
        </div>
        <div className={ui('network-visual')} aria-hidden="true">
          <div className={ui('orbit orbit-one')} />
          <div className={ui('orbit orbit-two')} />
          <div className={ui('orbit orbit-three')} />
          <div className={ui('network-center')}>
            <BrandLogo iconOnly className="h-12 w-12" />
          </div>
          <span className={ui('network-node node-a')}>
            <Building2 size={23} />
          </span>
          <span className={ui('network-node node-b')}>
            <Users size={22} />
          </span>
          <span className={ui('network-node node-c')}>
            <Globe2 size={23} />
          </span>
          <span className={ui('network-dot nd-one')} />
          <span className={ui('network-dot nd-two')} />
          <div className={ui('floating-label fl-one')}>
            <span className={ui('green-check')}>
              <Check size={13} />
            </span>{' '}
            Your next opportunity
          </div>
          <div className={ui('floating-label fl-two')}>
            <span>🇰🇪</span> Nairobi, Kenya <span className={ui('live-dot')} />
          </div>
          <span className={ui('visual-caption')}>CONNECTIONS WITHOUT BORDERS</span>
        </div>
      </section>
      <DashboardStats />
      <section className={ui('market-section')}>
        <div className={ui('section-title')}>
          <h2>A world of opportunity</h2>
          <span>Explore markets in the demo directory</span>
        </div>
        <div className={ui('market-grid')}>
          {[
            {
              name: 'East Africa',
              flag: '🇰🇪',
              country: 'Kenya',
              text: 'Essential medicines & generics',
              count: 3,
            },
            {
              name: 'Middle East',
              flag: '🇦🇪',
              country: 'United Arab Emirates',
              text: 'Specialty pharma & APIs',
              count: 2,
            },
            {
              name: 'West Africa',
              flag: '🇳🇬',
              country: 'Nigeria',
              text: 'Growing healthcare networks',
              count: 2,
            },
            {
              name: 'Southeast Asia',
              flag: '🇻🇳',
              country: 'Vietnam',
              text: 'Formulations & antibiotics',
              count: 1,
            },
          ].map((m) => (
            <Link
              href={`/buyers?country=${encodeURIComponent(m.country)}`}
              className={ui('market-card')}
              key={m.name}
            >
              <span className={ui('market-flag')}>{m.flag}</span>
              <div>
                <strong>{m.name}</strong>
                <small>{m.text}</small>
                <span>
                  {m.count} sample buyers <ArrowUpRight size={12} />
                </span>
              </div>
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
      </section>
      <div className={ui('home-bottom')}>
        <span className={ui('live-dot')} /> Your next connection is out there. Let’s find it.
        <span>
          Made for pharmaceutical exporters <Globe2 size={13} />
        </span>
      </div>
    </div>
  );
}
