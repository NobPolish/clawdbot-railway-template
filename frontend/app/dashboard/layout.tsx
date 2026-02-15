import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Clawdbot',
  description: 'Your Clawdbot dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
