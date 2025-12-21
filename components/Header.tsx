'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  // Load dark mode preference from localStorage
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    try {
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode === 'true') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
      
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
      
      setUser(getCurrentUser());
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  const toggleDarkMode = () => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    try {
      // Apply or remove dark class from html element
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const handleLanguageChange = (lang: string) => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    setLanguage(lang);
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
    setLanguageMenuOpen(false);
    // For now, just show a message. In the future, you can implement actual translation
    if (lang !== 'en') {
      alert('More languages coming soon! Currently only English is available.');
    }
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setAccountMenuOpen(false);
    router.push('/');
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    setLanguageMenuOpen(false);
  };

  return (
    <header className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Hamburger Menu */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2" onClick={closeMenus}>
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                Invoice<span className="text-gray-500 dark:text-gray-400 font-normal">Generator</span><span className="bg-blue-200 dark:bg-blue-600 text-gray-800 dark:text-gray-100 px-1 rounded font-normal">.ng</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/help"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Help
            </Link>
            <Link
              href="/history"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              History
            </Link>
            <Link
              href="/faq"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Selector - Hidden on Mobile */}
            <div className="hidden sm:block relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                aria-label="Select language"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      language === 'en'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('yo')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🇳🇬 Yoruba (Coming Soon)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ig')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🇳🇬 Igbo (Coming Soon)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ha')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🇳🇬 Hausa (Coming Soon)
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle - Hidden on Mobile */}
            <button
              onClick={toggleDarkMode}
              className="hidden sm:block p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            {/* Desktop: Text Links, Mobile: Account Icon */}
            {user ? (
              <>
                {/* Desktop View */}
                <Link
                  href="/dashboard"
                  className="hidden md:block text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden md:block text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>

                {/* Mobile: Account Icon with Dropdown */}
                <div className="md:hidden relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="Account menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link
                        href="/dashboard"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Desktop: Sign In and Sign Up */}
                <Link
                  href="/signin"
                  className="hidden md:block text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:block px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                >
                  Sign Up
                </Link>

                {/* Mobile: Account Icon with Dropdown */}
                <div className="md:hidden relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="Account menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link
                        href="/signin"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <nav className="px-4 py-4 space-y-3">
              <Link
                href="/help"
                onClick={closeMenus}
                className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
              >
                Help
              </Link>
              <Link
                href="/history"
                onClick={closeMenus}
                className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
              >
                History
              </Link>
              <Link
                href="/faq"
                onClick={closeMenus}
                className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
              >
                FAQ
              </Link>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {isDarkMode ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  )}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Select language"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                    <span>Language</span>
                  </button>
                  {languageMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          language === 'en'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        onClick={() => handleLanguageChange('yo')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🇳🇬 Yoruba (Coming Soon)
                      </button>
                      <button
                        onClick={() => handleLanguageChange('ig')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🇳🇬 Igbo (Coming Soon)
                      </button>
                      <button
                        onClick={() => handleLanguageChange('ha')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🇳🇬 Hausa (Coming Soon)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenus}
        />
      )}
    </header>
  );
}

