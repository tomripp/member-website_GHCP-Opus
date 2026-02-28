import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'myWebsite',
  description: 'Your gateway to exclusive content and resources',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
