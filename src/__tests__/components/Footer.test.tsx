import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      description: 'A modern web platform.',
      impressum: 'Impressum',
      rights: 'All rights reserved.',
    };
    return translations[key] || key;
  },
}));

// Mock i18n navigation
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />);
    expect(screen.getByText('myWebsite')).toBeInTheDocument();
  });

  it('renders the brand logo text', () => {
    render(<Footer />);
    expect(screen.getByText('mW')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<Footer />);
    expect(screen.getByText('A modern web platform.')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('renders the Impressum link', () => {
    render(<Footer />);
    const impressumLink = screen.getByText('Impressum');
    expect(impressumLink).toBeInTheDocument();
    expect(impressumLink.closest('a')).toHaveAttribute('href', '/impressum');
  });

  it('renders the current year in copyright', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} myWebsite. All rights reserved.`)).toBeInTheDocument();
  });

  it('has proper section headings', () => {
    render(<Footer />);
    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });
});
