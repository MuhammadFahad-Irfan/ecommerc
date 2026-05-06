'use client';

import { Wallet, X } from 'lucide-react';
import { useBudget } from '@/context/BudgetContext';
import { formatPrice } from '@/lib/utils';

const PRESETS = [
  { label: 'Under 5,000', value: 5000 },
  { label: '5,000 – 10,000', value: 10000 },
  { label: '10,000+', value: 20000 },
];

const MIN = 2000;
const MAX = 20000;
const STEP = 500;

interface BudgetSelectorProps {
  variant?: 'card' | 'compact';
}

export default function BudgetSelector({ variant = 'card' }: BudgetSelectorProps) {
  const { budget, setBudget, isHydrated } = useBudget();
  const current = budget ?? 5000;

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 text-sm">
        <Wallet className="h-4 w-4 text-primary-600" />
        {isHydrated && budget ? (
          <>
            <span className="font-medium text-gray-900">
              Budget: {formatPrice(budget)}
            </span>
            <button
              onClick={() => setBudget(null)}
              className="text-gray-400 hover:text-red-600"
              aria-label="Clear budget"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <span className="text-gray-500">No budget set</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary-100 p-2 rounded-full">
          <Wallet className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Budget Lock</h3>
          <p className="text-xs text-gray-500">
            We&apos;ll only suggest items within your budget.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setBudget(p.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              budget === p.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 text-gray-700 hover:border-primary-400'
            }`}
          >
            {p.label}
          </button>
        ))}
        {budget !== null && (
          <button
            onClick={() => setBudget(null)}
            className="px-3 py-1.5 rounded-full text-sm border border-transparent text-gray-500 hover:text-red-600 hover:border-red-200"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            Custom amount
          </label>
          <span className="text-sm font-semibold text-primary-700 tabular-nums">
            {formatPrice(current)}
          </span>
        </div>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={current}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatPrice(MIN)}</span>
          <span>{formatPrice(MAX)}</span>
        </div>
      </div>
    </div>
  );
}
