// Navigation types for KoFi application routing

/**
 * Navigation section representing a menu item/route in the application
 */
export interface NavigationSection {
  id: string;                    // Unique identifier (kebab-case)
  label: string;                 // Display name
  path: string;                  // Route path
  icon?: string;                 // Optional icon name/path
  order: number;                 // Display order in navigation
}

/**
 * Predefined navigation sections for the KoFi application
 * Static configuration - not stored in localStorage
 */
export const NAVIGATION_SECTIONS: NavigationSection[] = [
  { id: 'home', label: 'Home', path: '/', order: 1 },
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', order: 2 },
  { id: 'assets', label: 'Assets', path: '/assets', order: 3 },
  { id: 'beneficiaries', label: 'Beneficiaries', path: '/beneficiaries', order: 5 },
  { id: 'settings', label: 'Settings', path: '/settings', order: 6 },
  { id: 'report', label: 'Report', path: '/report', order: 7 },
];
