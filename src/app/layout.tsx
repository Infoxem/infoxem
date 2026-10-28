import { ui } from '@/lib/ui';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const inter = localFont({
  src: '../../public/fonts/inter.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
});
export const metadata: Metadata = {
  title: { default: 'Infoxem | Pharma export intelligence', template: '%s | Infoxem' },
  description: 'The buyer intelligence workspace for pharmaceutical exporters.',
  applicationName: 'Infoxem',
  icons: { icon: '/images/Infoxem-white-bg-icon.png', apple: '/images/Infoxem-white-bg-icon.png' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ui(inter.variable)}>
      <body className="has-[.directory-workspace]:overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
