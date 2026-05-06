'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

const STORAGE_KEY = 'modestwear:budget';

interface BudgetContextValue {
  budget: number | null;
  setBudget: (value: number | null) => void;
  isHydrated: boolean;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budget, setBudgetState] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const n = Number(stored);
        if (Number.isFinite(n) && n > 0) setBudgetState(n);
      }
    } catch {
      // ignore — private mode, etc.
    }
    setIsHydrated(true);
  }, []);

  const setBudget = (value: number | null) => {
    setBudgetState(value);
    try {
      if (value === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore
    }
  };

  const value = useMemo(
    () => ({ budget, setBudget, isHydrated }),
    [budget, isHydrated]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used inside BudgetProvider');
  return ctx;
}
