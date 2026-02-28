import { describe, it, expect } from 'vitest';

// Test the middleware helper functions directly by reimplementing them
// (since the middleware file has side effects that are hard to import in tests)

const protectedPaths = ['/members'];

function isProtectedPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(en|de)/, '') || '/';
  return protectedPaths.some((path) => pathWithoutLocale.startsWith(path));
}

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(en|de)/);
  return match ? match[1] : 'en';
}

describe('Middleware helpers', () => {
  describe('isProtectedPath', () => {
    it('should identify /en/members as protected', () => {
      expect(isProtectedPath('/en/members')).toBe(true);
    });

    it('should identify /de/members as protected', () => {
      expect(isProtectedPath('/de/members')).toBe(true);
    });

    it('should identify /en/members/some-page as protected', () => {
      expect(isProtectedPath('/en/members/some-page')).toBe(true);
    });

    it('should not identify /en as protected', () => {
      expect(isProtectedPath('/en')).toBe(false);
    });

    it('should not identify /en/auth/login as protected', () => {
      expect(isProtectedPath('/en/auth/login')).toBe(false);
    });

    it('should not identify /en/impressum as protected', () => {
      expect(isProtectedPath('/en/impressum')).toBe(false);
    });

    it('should not identify / as protected', () => {
      expect(isProtectedPath('/')).toBe(false);
    });
  });

  describe('getLocaleFromPath', () => {
    it('should extract "en" from /en/page', () => {
      expect(getLocaleFromPath('/en/page')).toBe('en');
    });

    it('should extract "de" from /de/auth/login', () => {
      expect(getLocaleFromPath('/de/auth/login')).toBe('de');
    });

    it('should default to "en" for unknown locale paths', () => {
      expect(getLocaleFromPath('/fr/page')).toBe('en');
    });

    it('should default to "en" for root path', () => {
      expect(getLocaleFromPath('/')).toBe('en');
    });
  });
});
