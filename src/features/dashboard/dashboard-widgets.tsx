'use client';

import { ui } from '@/lib/ui';
import { Building2, Users, Layers, Sparkles } from 'lucide-react';
import { companies, people } from '@/lib/demo-data';
import { useWorkspace } from '@/providers/workspace-provider';
import { MiniChart } from '@/components/records/record-display';

export function DashboardStats() {
  const { saved, lists, requestCount } = useWorkspace();
  return (
    <div className={ui('stats-grid')}>
      {[
        {
          label: 'Saved buyers',
          value: saved.filter((s) => companies.some((c) => c.id === s)).length,
          meta: 'Build your buyer pipeline',
          icon: Building2,
          color: 'blue',
        },
        {
          label: 'Saved people',
          value: saved.filter((s) => people.some((p) => p.id === s)).length,
          meta: 'Your next conversations',
          icon: Users,
          color: 'purple',
        },
        {
          label: 'Your lists',
          value: lists.length,
          meta: 'Organize your opportunities',
          icon: Layers,
          color: 'teal',
        },
        {
          label: 'Data requests',
          value: requestCount,
          meta: 'Keep your intelligence fresh',
          icon: Sparkles,
          color: 'orange',
        },
      ].map((s) => (
        <div className={ui('stat-card')} key={s.label}>
          <div className={ui('stat-label')}>
            {s.label}
            <span className={ui(`stat-icon ${s.color}`)}>
              <s.icon size={17} />
            </span>
          </div>
          <div className={ui('stat-value')}>
            {String(s.value).padStart(2, '0')}
            <MiniChart
              color={
                s.color === 'purple'
                  ? '#8865d1'
                  : s.color === 'teal'
                    ? '#2a9d8f'
                    : s.color === 'orange'
                      ? '#d69b4b'
                      : '#2763e7'
              }
            />
          </div>
          <small>{s.meta}</small>
        </div>
      ))}
    </div>
  );
}
