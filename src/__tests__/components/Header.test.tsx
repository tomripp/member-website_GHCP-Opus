import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      home: 'Home',
      members: 'Members',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

// Mock next-auth/react
const mockSignOut = vi.fn();
let mockSession: { data: { user: { name: string; email: string } } | null; status: string } = {
  data: null,
  status: 'unauthenticated',
};

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

// Mock i18n navigation
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/',
}));

// Mock LanguageSwitcher
vi.mock('@/components/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = { data: null, status: 'unauthenticated' };
  });

  it('renders the brand name and logo', () => {
    render(<Header />);
    expect(screen.getByText('myWebsite')).toBeInTheDocument();
    expect(screen.getByText('mW')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Members').length).toBeGreaterThanOrEqual(1);
  });

  it('renders language switcher', () => {
    render(<Header />);
    expect(screen.getAllByTestId('language-switcher').length).toBeGreaterThanOrEqual(1);
  });

  describe('when user is not authenticated', () => {
    it('renders login and register links', () => {
      render(<Header />);
      expect(screen.getAllByText('Login').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Register').length).toBeGreaterThanOrEqual(1);
    });

    it('does not render logout button', () => {
      render(<Header />);
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockSession = {
        data: { user: { name: 'John Doe', email: 'john@example.com' } },
        status: 'authenticated',
      };
    });

    it('renders user name', () => {
      render(<Header />);
      expect(screen.getAllByText('John Doe').length).toBeGreaterThanOrEqual(1);
    });

    it('renders logout button', () => {
      render(<Header />);
      expect(screen.getAllByText('Logout').length).toBeGreaterThanOrEqual(1);
    });

    it('does not render login or register links', () => {
      render(<Header />);
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Register')).not.toBeInTheDocument();
    });

    it('calls signOut when logout is clicked', () => {
      render(<Header />);
      const logoutButtons = screen.getAllByText('Logout');
      fireEvent.click(logoutButtons[0]);
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('mobile menu', () => {
    it('toggles mobile menu on button click', () => {
      render(<Header />);
      // Mobile menu should not be visible initially
      const menuButton = screen.getByRole('button', { name: '' }); // SVG icon button
      // There should be desktop + no mobile links initially (only desktop nav links)
      const membersLinksBefore = screen.getAllByText('Members');
      
      fireEvent.click(menuButton);
      
      // After clicking, mobile menu should be visible (extra set of links)
      const membersLinksAfter = screen.getAllByText('Members');
      expect(membersLinksAfter.length).toBeGreaterThan(membersLinksBefore.length);
    });
  });
});
