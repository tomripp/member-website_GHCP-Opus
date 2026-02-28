'use client';

import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useState } from 'react';

export default function Header() {
  const t = useTranslations('Navigation');
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/' as const, label: t('home') },
    { href: '/members' as const, label: t('members') },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">mW</span>
            </div>
            <span className="text-xl font-bold text-gray-900">myWebsite</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === link.href
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    pathname === link.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <LanguageSwitcher />
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="text-sm font-medium text-red-600"
                  >
                    {t('logout')}
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link href="/auth/login" className="text-sm font-medium text-gray-600">
                      {t('login')}
                    </Link>
                    <Link href="/auth/register" className="text-sm font-medium bg-blue-600 text-white px-3 py-1 rounded-lg">
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
