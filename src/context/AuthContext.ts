import { createContext } from 'react';
import type { LockoutStatus } from '../types/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  isSetup: boolean;
  lockoutStatus: LockoutStatus;
  login: (pin: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<void>;
  logout: () => void;
  refreshState: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
