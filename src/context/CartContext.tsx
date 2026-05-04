'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from 'react';
import type { ICartItem } from '@/types';

interface CartState {
  items: ICartItem[];
  isHydrated: boolean;
}

type CartAction =
  | { type: 'HYDRATE'; payload: ICartItem[] }
  | { type: 'ADD_ITEM'; payload: ICartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR' };

interface CartContextValue {
  items: ICartItem[];
  isHydrated: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'shopping_cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.payload, isHydrated: true };

    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (existing) {
        // Don't exceed stock
        const newQty = Math.min(
          existing.quantity + action.payload.quantity,
          action.payload.stock
        );
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.payload.productId
              ? { ...i, quantity: newQty }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.productId !== action.payload.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.payload.productId
            ? { ...i, quantity: Math.min(action.payload.quantity, i.stock) }
            : i
        ),
      };

    case 'CLEAR':
      return { ...state, items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isHydrated: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(stored) });
      } else {
        dispatch({ type: 'HYDRATE', payload: [] });
      }
    } catch {
      dispatch({ type: 'HYDRATE', payload: [] });
    }
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (state.isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, state.isHydrated]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextValue = {
    items: state.items,
    isHydrated: state.isHydrated,
    totalItems,
    totalPrice,
    addItem: (item) =>
      dispatch({
        type: 'ADD_ITEM',
        payload: { ...item, quantity: item.quantity ?? 1 },
      }),
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', payload: productId }),
    updateQuantity: (productId, quantity) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
