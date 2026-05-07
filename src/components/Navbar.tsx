'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, isHydrated } = useCart();
  const pathname = usePathname();

  // Hide navbar on admin pages
  if (pathname?.startsWith('/admin')) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { href: '/shop-by-goal', label: 'Shop by Goal' },
    { href: '/products', label: 'Shop All' },
    { href: '/products?category=Women', label: 'Women' },
    { href: '/products?category=Child', label: 'Children' },
    { href: '/products?category=Islamic', label: 'Islamic' },
    { href: '/products?category=Jewellery', label: 'Jewellery' },
    { href: '/products?category=Shoes', label: 'Shoes' },
    { href: '/products?category=Bags', label: 'Bags' },
    { href: '/track-order', label: 'Track Order' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="container-custom">
        <div className="flex items-center justify-between gap-6 h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-primary-600 shrink-0"
          >
            Modest<span className="text-gray-900">Wear</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-5 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search bar (desktop) — flex-shrinks on tighter screens */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex relative flex-1 max-w-xs xl:max-w-[14rem]"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary-500 text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-primary-600 transition"
            >
              <ShoppingCart className="h-6 w-6" />
              {isHydrated && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2 text-gray-700"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="xl:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-primary-600 py-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
