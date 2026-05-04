'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import Loader from '@/components/Loader';

export default function CartPage() {
  const { items, isHydrated, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();

  if (!isHydrated) return <Loader fullPage />;

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const shipping = totalPrice >= 3000 ? 0 : 200;
  const finalTotal = totalPrice + shipping;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
      <p className="text-gray-600 mb-8">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
            >
              <Link
                href={`/products/${item.productId}`}
                className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
              >
                <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-primary-700 font-bold mt-1">{formatPrice(item.price)}</p>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-medium min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1.5 hover:bg-gray-50 disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700 underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Order summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit lg:sticky lg:top-20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({totalItems} items)</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
              </span>
            </div>
            {totalPrice < 3000 && (
              <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                Add {formatPrice(3000 - totalPrice)} more to qualify for free shipping!
              </p>
            )}
            <div className="border-t pt-3 flex justify-between text-base">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-primary-700 text-xl">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/products"
            className="text-center block mt-3 text-sm text-gray-600 hover:text-primary-600"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
