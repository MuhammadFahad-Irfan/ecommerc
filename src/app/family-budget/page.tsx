'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from '@/components/ProductImage';
import {
  Users,
  Plus,
  X,
  Loader2,
  Sparkles,
  Baby,
  User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiPost } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useBudget } from '@/context/BudgetContext';
import BudgetSelector from '@/components/BudgetSelector';
import type { IProduct } from '@/types';

interface FamilyMember {
  type: 'mother' | 'kid';
  age?: number;
}

interface FamilyRecommendation {
  member: FamilyMember;
  budgetShare: number;
  recommendations: IProduct[];
}

export default function FamilyBudgetPage() {
  const { budget } = useBudget();
  const [members, setMembers] = useState<FamilyMember[]>([{ type: 'mother' }]);
  const [results, setResults] = useState<FamilyRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);

  const addMember = (type: 'mother' | 'kid') => {
    if (type === 'mother' && members.some((m) => m.type === 'mother')) {
      toast.error('Only one mother per family budget');
      return;
    }
    setMembers([...members, type === 'kid' ? { type, age: 6 } : { type }]);
  };

  const removeMember = (idx: number) =>
    setMembers((prev) => prev.filter((_, i) => i !== idx));

  const updateAge = (idx: number, age: number) =>
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, age } : m))
    );

  const submit = async () => {
    if (!budget) {
      toast.error('Set a budget first');
      return;
    }
    if (members.length === 0) {
      toast.error('Add at least one family member');
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost<{ recommendations: FamilyRecommendation[] }>(
        '/recommendations/family-budget',
        { budget, members }
      );
      setResults(data.recommendations);
      const totalRecs = data.recommendations.reduce(
        (s, r) => s + r.recommendations.length,
        0
      );
      if (totalRecs === 0) {
        toast('No matches at that budget — try raising it.', { icon: '🤔' });
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Could not load recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-10 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-6 w-6 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Family Budget Mode</h1>
        </div>
        <p className="text-gray-600">
          Set one budget, add your family members, and we&apos;ll split it sensibly across everyone.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <BudgetSelector />

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Family members</h3>
            <span className="text-xs text-gray-500">
              {members.length} {members.length === 1 ? 'person' : 'people'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {members.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"
              >
                {m.type === 'mother' ? (
                  <UserIcon className="h-4 w-4 text-primary-600" />
                ) : (
                  <Baby className="h-4 w-4 text-primary-600" />
                )}
                <span className="text-sm font-medium text-gray-900 capitalize flex-1">
                  {m.type}
                </span>
                {m.type === 'kid' && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-500">Age</span>
                    <input
                      type="number"
                      min={0}
                      max={18}
                      value={m.age ?? ''}
                      onChange={(e) =>
                        updateAge(i, parseInt(e.target.value, 10) || 0)
                      }
                      className="w-14 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}
                <button
                  onClick={() => removeMember(i)}
                  className="text-gray-400 hover:text-red-600 p-1"
                  aria-label="Remove member"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                No members yet — add a mother or kid below.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addMember('mother')}
              className="btn-outline inline-flex items-center gap-1 text-sm"
            >
              <Plus className="h-4 w-4" /> Mother
            </button>
            <button
              type="button"
              onClick={() => addMember('kid')}
              className="btn-outline inline-flex items-center gap-1 text-sm"
            >
              <Plus className="h-4 w-4" /> Kid
            </button>
          </div>

          <button
            onClick={submit}
            disabled={loading || !budget}
            className="btn-primary w-full mt-4 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Plan family outfits
          </button>
          {!budget && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              Set a budget on the left to enable.
            </p>
          )}
        </div>
      </div>

      {results && <ResultsSection results={results} />}
    </div>
  );
}

function ResultsSection({ results }: { results: FamilyRecommendation[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Curated picks</h2>
      {results.map((r, i) => (
        <MemberCard key={i} entry={r} />
      ))}
    </div>
  );
}

function MemberCard({ entry }: { entry: FamilyRecommendation }) {
  const { member, budgetShare, recommendations } = entry;
  const label =
    member.type === 'mother'
      ? 'For Mother'
      : `For Kid${member.age ? ` (age ${member.age})` : ''}`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {member.type === 'mother' ? (
            <UserIcon className="h-5 w-5 text-primary-600" />
          ) : (
            <Baby className="h-5 w-5 text-primary-600" />
          )}
          <h3 className="font-semibold text-gray-900">{label}</h3>
        </div>
        <span className="text-sm text-gray-500">
          Budget share:{' '}
          <span className="font-semibold text-gray-900">
            {formatPrice(Math.round(budgetShare))}
          </span>
        </span>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          Nothing fits within this share — try raising the family budget.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recommendations.map((p) => (
            <Link
              key={p._id}
              href={`/products/${p._id}`}
              className="group block"
            >
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                <Image
                  src={p.images?.[0] || '/placeholder.svg'}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary-600">
                {p.name}
              </p>
              <p className="text-sm text-primary-700 font-bold">
                {formatPrice(p.price)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
