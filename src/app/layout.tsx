import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';
import { BudgetProvider } from '@/context/BudgetContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Modest Wear — Premium Children, Women & Islamic Fashion',
    template: '%s | Modest Wear',
  },
  description:
    'Shop premium quality fashion for children, women, and Islamic modest wear. Free delivery, secure payments via Easypaisa, and authentic products.',
  keywords: [
    'modest fashion',
    'burkha',
    'islamic dress',
    'women clothing',
    'children clothing',
    'pakistan online shopping',
    'easypaisa shopping',
  ],
  openGraph: {
    title: 'Modest Wear — Premium Children, Women & Islamic Fashion',
    description: 'Shop premium quality fashion online with secure Easypaisa payments.',
    type: 'website',
    locale: 'en_PK',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modest Wear',
    description: 'Premium fashion for children, women, and Islamic modest wear.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <CartProvider>
          <BudgetProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </BudgetProvider>
        </CartProvider>
      </body>
    </html>
  );
}
