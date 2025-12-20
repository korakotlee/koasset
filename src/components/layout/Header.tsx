import { Navigation } from './Navigation';

/**
 * Header component with KoFi logo and navigation menu
 * Logo scales responsively: mobile (h-8), tablet (h-10), desktop (h-12)
 */
export function Header() {
  return (
    <header className="bg-slate-900 shadow-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Responsive sizing */}
          <div className="flex items-center">
            <img
              src="/kofi.svg"
              alt="KoFi Logo"
              className="h-8 md:h-10 lg:h-12 w-auto object-contain"
            />
            <span className="ml-2 text-lg md:text-xl font-bold text-white tracking-tight">KoFi</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </header>
  );
}
