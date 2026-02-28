import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SessionProvider } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
