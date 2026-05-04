'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Modest<span className="text-primary-500">Wear</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Premium quality fashion for children, women, and Islamic modest
              wear. Trusted by thousands across Pakistan.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-primary-400">All Products</Link></li>
              <li><Link href="/products?category=Women" className="hover:text-primary-400">Women</Link></li>
              <li><Link href="/products?category=Child" className="hover:text-primary-400">Children</Link></li>
              <li><Link href="/products?category=Islamic" className="hover:text-primary-400">Islamic</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/cart" className="hover:text-primary-400">Cart</Link></li>
              <li><a className="hover:text-primary-400" href="#">Shipping & Returns</a></li>
              <li><a className="hover:text-primary-400" href="#">FAQ</a></li>
              <li><a className="hover:text-primary-400" href="#">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Karachi, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>support@modestwear.pk</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Facebook" className="hover:text-primary-400"><Facebook className="h-5 w-5" /></a>
              <a href="#" aria-label="Instagram" className="hover:text-primary-400"><Instagram className="h-5 w-5" /></a>
              <a href="#" aria-label="Twitter" className="hover:text-primary-400"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} ModestWear. All rights reserved. Secure payments via Easypaisa.</p>
        </div>
      </div>
    </footer>
  );
}
