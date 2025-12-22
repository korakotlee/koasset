import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService } from '../services/AuthService';
import { AuthContext } from './AuthContext';
import { storageService } from '../services/StorageService';
import type { LockoutStatus } from '../types/auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!authService.getSessionKey());
  const [isSetup, setIsSetup] = useState<boolean>(storageService.getEncryptedData() !== null);
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>(authService.getLockoutStatus());

  const refreshState = useCallback(() => {
    setIsAuthenticated(!!authService.getSessionKey());
    setIsSetup(storageService.getEncryptedData() !== null);
    setLockoutStatus(authService.getLockoutStatus());
  }, []);

  const login = useCallback(async (pin: string) => {
    const success = await authService.login(pin);
    if (success) {
      setIsAuthenticated(true);
      setIsSetup(true);
    } else {
      setLockoutStatus(authService.getLockoutStatus());
    }
    return success;
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    await authService.setupPin(pin);
    setIsSetup(true);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
  }, []);

  // Check for lockout status periodically if locked
  useEffect(() => {
    if (!lockoutStatus.isLocked) return;

    const interval = setInterval(() => {
      const currentStatus = authService.getLockoutStatus();
      setLockoutStatus(currentStatus);
      if (!currentStatus.isLocked) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutStatus.isLocked]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isSetup,
      lockoutStatus,
      login,
      setupPin,
      logout,
      refreshState
    }}>
      {children}
    </AuthContext.Provider>
  );
};
