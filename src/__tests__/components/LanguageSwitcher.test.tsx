import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const mockReplace = vi.fn();

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

// Mock i18n navigation
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
  },
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders buttons for all locales', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();
  });

  it('highlights the current locale', () => {
    render(<LanguageSwitcher />);
    const enButton = screen.getByText('EN');
    expect(enButton.className).toContain('bg-white');
    expect(enButton.className).toContain('text-blue-600');
  });

  it('does not highlight inactive locales', () => {
    render(<LanguageSwitcher />);
    const deButton = screen.getByText('DE');
    expect(deButton.className).toContain('text-gray-500');
    expect(deButton.className).not.toContain('bg-white');
  });

  it('calls router.replace when switching locale', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText('DE'));
    expect(mockReplace).toHaveBeenCalledWith('/', { locale: 'de' });
  });

  it('calls router.replace with same locale when clicking active locale', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText('EN'));
    expect(mockReplace).toHaveBeenCalledWith('/', { locale: 'en' });
  });
});
