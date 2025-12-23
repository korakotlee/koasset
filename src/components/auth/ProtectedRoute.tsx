import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PinSetup } from './PinSetup';
import { PinEntry } from './PinEntry';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Route-level authentication wrapper.
 * Shows PIN setup for new users or PIN entry for returning users.
 * Only wraps protected routes - home page should NOT use this.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSetup, isAuthenticated } = useAuth();

  if (!isSetup) {
    return <PinSetup />;
  }

  if (!isAuthenticated) {
    return <PinEntry />;
  }

  return <>{children}</>;
}
