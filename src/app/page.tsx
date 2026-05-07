import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Heart } from 'lucide-react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import ProductCard from '@/components/ProductCard';
import type { IProduct } from '@/types';

// Re-fetch every 60s to keep new products in sync without rebuilds
export const revalidate = 60;

async function getHomePageData() {
  try {
    await dbConnect();
    const [featured, latest] = await Promise.all([
      Product.find({ isFeatured: true })
        .select('-reviews.ipAddress')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Product.find({})
        .select('-reviews.ipAddress')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    return {
      // serialize ObjectIds to strings for the client
      featured: JSON.parse(JSON.stringify(featured)) as IProduct[],
      latest: JSON.parse(JSON.stringify(latest)) as IProduct[],
    };
  } catch (err) {
    console.error('Home page data error:', err);
    return { featured: [], latest: [] };
  }
}

const CATEGORIES = [
  {
    name: 'Women',
    slug: 'Women',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    description: 'Elegant women fashion',
  },
  {
    name: 'Children',
    slug: 'Child',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80',
    description: 'Cute & comfortable for kids',
  },
  {
    name: 'Islamic Modest',
    slug: 'Islamic',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
    description: 'Burkha & modest wear',
  },
  {
    name: 'Jewellery',
    slug: 'Jewellery',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    description: 'Statement pieces & everyday accents',
  },
  {
    name: 'Shoes',
    slug: 'Shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    description: 'Heels, flats & comfort everyday',
  },
  {
    name: 'Bags',
    slug: 'Bags',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    description: 'Clutches, totes & travel-ready',
  },
];

export default async function HomePage() {
  const { featured, latest } = await getHomePageData();

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-pink-50 overflow-hidden">
        <div className="container-custom py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-primary-600 font-semibold mb-3 tracking-wide">
                NEW COLLECTION 2025
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Fashion that <br />
                <span className="text-primary-600">Speaks Modesty</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md">
                Premium quality clothing for women, children, and Islamic
                modest wear. Crafted with love, delivered with care.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/products?category=Islamic" className="btn-outline">
                  Explore Modest Wear
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div
                className="aspect-square rounded-full bg-gradient-to-br from-primary-200 to-primary-400 opacity-30 absolute inset-0 blur-3xl"
                aria-hidden
              />
              <Image
                src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80"
                alt="Modest fashion collection"
                width={800}
                height={800}
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="rounded-2xl shadow-2xl relative z-10 w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 border-y">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'Orders above PKR 3000' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: 'Easypaisa & COD' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '7 days return policy' },
            { icon: Heart, title: 'Quality First', desc: 'Authentic products' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="bg-primary-100 p-3 rounded-full">
                <item.icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-custom py-12 md:py-16">
        <h2 className="text-3xl font-bold text-center mb-2">Shop by Category</h2>
        <p className="text-center text-gray-600 mb-8">
          Find the perfect outfit for every occasion
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden image-zoom"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold">{cat.name}</h3>
                <p className="text-sm opacity-90">{cat.description}</p>
                <p className="mt-3 inline-flex items-center text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                  Explore <ArrowRight className="h-4 w-4" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600 mt-1">Handpicked bestsellers for you</p>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center text-primary-600 font-medium hover:gap-2 gap-1 transition-all"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="container-custom py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest Arrivals</h2>
            <p className="text-gray-600 mt-1">Fresh styles just landed</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center text-primary-600 font-medium hover:gap-2 gap-1 transition-all"
          >
            Shop All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latest.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No products available yet. Run <code className="bg-gray-100 px-1 rounded">npm run seed</code> to populate sample data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {latest.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
