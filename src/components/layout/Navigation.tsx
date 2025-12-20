import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_SECTIONS } from '../../types/Navigation';

/**
 * Navigation component displaying all application sections
 * Shows active state indicator for current route
 * Mobile: hamburger menu (<768px)
 * Desktop: horizontal navigation (≥768px)
 */
export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when clicking a link
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Desktop Navigation - Hidden on mobile, spans full width */}
          <div className="hidden md:flex md:flex-1 space-x-8">
            {NAVIGATION_SECTIONS.map((section) => (
              <NavLink
                key={section.id}
                to={section.path}
                target={section.id === 'report' ? '_blank' : undefined}
                rel={section.id === 'report' ? 'noopener noreferrer' : undefined}
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 pb-4 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-slate-300 hover:border-slate-600 hover:text-white'
                  }`
                }
              >
                {section.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="md:hidden flex-1 flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              {/* Hamburger Icon */}
              {!isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                /* Close Icon */
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {NAVIGATION_SECTIONS.map((section) => (
              <NavLink
                key={section.id}
                to={section.path}
                target={section.id === 'report' ? '_blank' : undefined}
                rel={section.id === 'report' ? 'noopener noreferrer' : undefined}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 border-l-4 border-purple-500 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
                style={{ minHeight: '44px' }}
              >
                {section.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
