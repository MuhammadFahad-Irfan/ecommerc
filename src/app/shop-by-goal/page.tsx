'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from '@/components/ProductImage';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Heart,
  Gift,
  GraduationCap,
  Plane,
  Moon,
  Star,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiPost } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useBudget } from '@/context/BudgetContext';
import BudgetSelector from '@/components/BudgetSelector';
import type { IProduct } from '@/types';

interface OutfitBundle {
  main: IProduct;
  matching: IProduct[];
  total: number;
}

type Step = 'goal' | 'questions' | 'results';

interface QuestionDef {
  key: 'color' | 'style' | 'ageGroup' | 'gender' | 'durability';
  label: string;
  options: string[];
}

const GOALS: { name: string; icon: typeof Heart; description: string }[] = [
  {
    name: 'Everyday modest wear',
    icon: Heart,
    description: 'Comfortable pieces for daily use',
  },
  {
    name: 'Wedding / special event',
    icon: Sparkles,
    description: 'Statement looks for big days',
  },
  {
    name: 'Prayer & religious gatherings',
    icon: Moon,
    description: 'Modest, respectful styles',
  },
  {
    name: 'School / kids daily wear',
    icon: GraduationCap,
    description: 'Durable & comfortable for kids',
  },
  {
    name: 'Gift for someone',
    icon: Gift,
    description: 'Curated picks worth gifting',
  },
  {
    name: 'Travel-friendly outfits',
    icon: Plane,
    description: 'Lightweight & easy-care fabrics',
  },
  {
    name: 'Eid shopping',
    icon: Star,
    description: 'Festive & celebratory pieces',
  },
];

const QUESTIONS_BY_GOAL: Record<string, QuestionDef[]> = {
  'Wedding / special event': [
    { key: 'color', label: 'Color preference', options: ['Black', 'Pastel', 'Custom'] },
    { key: 'style', label: 'Style', options: ['Simple', 'Embroidered', 'Heavy'] },
  ],
  'School / kids daily wear': [
    { key: 'ageGroup', label: 'Age group', options: ['3-5', '6-10', '11-14'] },
    { key: 'gender', label: 'Gender', options: ['Boy', 'Girl'] },
    { key: 'durability', label: 'Durability', options: ['Standard', 'Heavy-duty'] },
  ],
  'Everyday modest wear': [
    { key: 'color', label: 'Color preference', options: ['Black', 'Pastel', 'Custom'] },
    { key: 'style', label: 'Style', options: ['Simple', 'Embroidered'] },
  ],
  'Prayer & religious gatherings': [
    { key: 'color', label: 'Color preference', options: ['Black', 'Pastel', 'Custom'] },
    { key: 'style', label: 'Style', options: ['Simple', 'Embroidered'] },
  ],
  'Gift for someone': [
    { key: 'gender', label: 'For whom', options: ['Women', 'Kids'] },
    { key: 'style', label: 'Style', options: ['Simple', 'Embroidered', 'Heavy'] },
  ],
  'Travel-friendly outfits': [
    { key: 'color', label: 'Color preference', options: ['Black', 'Pastel', 'Custom'] },
    { key: 'durability', label: 'Fabric', options: ['Lightweight', 'Wrinkle-free'] },
  ],
  'Eid shopping': [
    { key: 'gender', label: 'For whom', options: ['Women', 'Kids'] },
    { key: 'style', label: 'Style', options: ['Simple', 'Embroidered', 'Heavy'] },
  ],
};

export default function ShopByGoalPage() {
  const { budget } = useBudget();
  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bundles, setBundles] = useState<OutfitBundle[]>([]);
  const [loading, setLoading] = useState(false);

  const questions = QUESTIONS_BY_GOAL[goal] || [];
  const allAnswered = questions.every((q) => answers[q.key]);

  const reset = () => {
    setStep('goal');
    setGoal('');
    setAnswers({});
    setBundles([]);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const data = await apiPost<{ bundles: OutfitBundle[] }>(
        '/recommendations/by-goal',
        { goal, answers, budget: budget ?? undefined }
      );
      setBundles(data.bundles);
      setStep('results');
      if (data.bundles.length === 0) {
        toast('No matches found — try clearing your budget or answers.', {
          icon: '🤔',
        });
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
      <Header step={step} onBack={reset} />

      {step === 'goal' && (
        <GoalStep
          onPick={(g) => {
            setGoal(g);
            setAnswers({});
            const qs = QUESTIONS_BY_GOAL[g];
            setStep(qs?.length ? 'questions' : 'goal');
            if (!qs?.length) {
              // No follow-up — submit immediately
              setTimeout(() => submitImmediate(g, {}), 0);
            }
          }}
        />
      )}

      {step === 'questions' && (
        <QuestionsStep
          goal={goal}
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
          allAnswered={allAnswered}
          loading={loading}
          onSubmit={submit}
          onBack={() => setStep('goal')}
        />
      )}

      {step === 'results' && (
        <ResultsStep
          goal={goal}
          bundles={bundles}
          onChangeAnswers={() =>
            setStep(questions.length ? 'questions' : 'goal')
          }
          onStartOver={reset}
        />
      )}
    </div>
  );

  async function submitImmediate(g: string, a: Record<string, string>) {
    setLoading(true);
    try {
      const data = await apiPost<{ bundles: OutfitBundle[] }>(
        '/recommendations/by-goal',
        { goal: g, answers: a, budget: budget ?? undefined }
      );
      setBundles(data.bundles);
      setStep('results');
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Could not load recommendations');
    } finally {
      setLoading(false);
    }
  }
}

function Header({ step, onBack }: { step: Step; onBack: () => void }) {
  return (
    <div className="mb-8">
      {step !== 'goal' && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Start over
        </button>
      )}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Shop by Goal</h1>
      </div>
      <p className="text-gray-600">
        Tell us what you&apos;re shopping for and we&apos;ll curate just a few looks worth your time — no scrolling through hundreds of items.
      </p>
    </div>
  );
}

function GoalStep({ onPick }: { onPick: (goal: string) => void }) {
  return (
    <>
      <BudgetSelector />
      <h2 className="font-semibold text-gray-900 mt-8 mb-4">
        What are you shopping for?
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GOALS.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.name}
              onClick={() => onPick(g.name)}
              className="text-left p-5 bg-white border border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-md transition group"
            >
              <div className="bg-primary-50 p-2 rounded-lg w-fit group-hover:bg-primary-100 transition">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mt-3">{g.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{g.description}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}

function QuestionsStep({
  goal,
  questions,
  answers,
  setAnswers,
  allAnswered,
  loading,
  onSubmit,
  onBack,
}: {
  goal: string;
  questions: QuestionDef[];
  answers: Record<string, string>;
  setAnswers: (next: Record<string, string>) => void;
  allAnswered: boolean;
  loading: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <p className="text-sm text-primary-600 font-semibold uppercase tracking-wide mb-1">
        {goal}
      </p>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        A few quick questions
      </h2>

      <div className="space-y-6 bg-white border border-gray-200 rounded-2xl p-6">
        {questions.map((q) => (
          <div key={q.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {q.label}
            </label>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.key] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [q.key]: opt })}
                    className={`px-4 py-1.5 rounded-full text-sm border transition ${
                      selected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 text-gray-700 hover:border-primary-400'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={onBack} className="btn-outline">
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={!allAnswered || loading}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Show me my picks
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsStep({
  goal,
  bundles,
  onChangeAnswers,
  onStartOver,
}: {
  goal: string;
  bundles: OutfitBundle[];
  onChangeAnswers: () => void;
  onStartOver: () => void;
}) {
  if (bundles.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          No matches yet
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We couldn&apos;t find products that match every choice. Try widening
          your budget or changing an answer.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onChangeAnswers} className="btn-outline">
            Change answers
          </button>
          <button onClick={onStartOver} className="btn-primary">
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-primary-600 font-semibold uppercase tracking-wide mb-1">
        {goal}
      </p>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Curated for you · {bundles.length} {bundles.length === 1 ? 'look' : 'looks'}
        </h2>
        <button
          onClick={onChangeAnswers}
          className="text-sm text-primary-600 hover:underline"
        >
          Change answers
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bundles.map((b, i) => (
          <BundleCard key={b.main._id || i} bundle={b} />
        ))}
      </div>
    </div>
  );
}

function BundleCard({ bundle }: { bundle: OutfitBundle }) {
  const { main, matching, total } = bundle;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
      <Link
        href={`/products/${main._id}`}
        className="relative aspect-square bg-gray-100 block"
      >
        <Image
          src={main.images?.[0] || '/placeholder.svg'}
          alt={main.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {main.category}
        </p>
        <h3 className="font-semibold text-gray-900 line-clamp-1">
          {main.name}
        </h3>
        <p className="text-primary-700 font-bold mt-1">
          {formatPrice(main.price)}
        </p>

        {matching.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 mb-2">Pairs well with</p>
            <div className="space-y-1.5">
              {matching.map((m) => (
                <Link
                  key={m._id}
                  href={`/products/${m._id}`}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600"
                >
                  <span className="flex-1 line-clamp-1">{m.name}</span>
                  <span className="text-gray-500">{formatPrice(m.price)}</span>
                </Link>
              ))}
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 mt-2 border-t border-dashed">
              <span className="text-gray-700">Outfit total</span>
              <span className="text-primary-700">{formatPrice(total)}</span>
            </div>
          </div>
        )}

        <Link
          href={`/products/${main._id}`}
          className="btn-primary mt-4 text-center"
        >
          View main item
        </Link>
      </div>
    </div>
  );
}
