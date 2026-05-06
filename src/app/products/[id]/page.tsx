'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Check, ArrowLeft, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiGet } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { formatPrice, getYouTubeEmbedUrl } from '@/lib/utils';
import StarRating from '@/components/StarRating';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import Loader from '@/components/Loader';
import ImageZoomModal from '@/components/ImageZoomModal';
import type { IProduct, IReview } from '@/types';

interface PageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = params;
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await apiGet<IProduct>(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        const error = err as { message?: string };
        setError(error.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? '/placeholder.svg',
      stock: product.stock,
      quantity,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleReviewAdded = (data: {
    review: IReview;
    averageRating: number;
    numReviews: number;
  }) => {
    if (!product) return;
    setProduct({
      ...product,
      reviews: [data.review, ...product.reviews],
      averageRating: data.averageRating,
      numReviews: data.numReviews,
    });
  };

  if (loading) return <Loader fullPage />;

  if (error || !product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="container-custom py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-primary-600">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-600 mb-4 hover:text-primary-600 lg:hidden">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          <button
            type="button"
            onClick={() => product.images?.length && setZoomIndex(selectedImage)}
            disabled={!product.images?.length}
            className="group relative aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden mb-4 cursor-zoom-in disabled:cursor-default"
            aria-label="Zoom image"
          >
            <Image
              src={product.images?.[selectedImage] || '/placeholder.svg'}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {!!product.images?.length && (
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <ZoomIn className="h-3 w-3" /> Click to zoom
              </span>
            )}
          </button>
          {(product.images?.length ?? 0) > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  onDoubleClick={() => setZoomIndex(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition cursor-zoom-in ${
                    selectedImage === idx
                      ? 'border-primary-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  title="Click to select, double-click to zoom"
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill sizes="20vw" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* YouTube video */}
          {(() => {
            const embed = getYouTubeEmbedUrl(product.videoUrl);
            if (!embed) return null;
            return (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Product Video
                </h3>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                  <iframe
                    src={embed}
                    title={`${product.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Product info */}
        <div>
          <p className="text-sm text-primary-600 font-semibold uppercase tracking-wide">
            {product.category === 'Islamic' ? 'Islamic Modest Wear' : product.category}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <StarRating rating={product.averageRating} reviewCount={product.numReviews} showValue />
            <span className="text-gray-300">|</span>
            <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          <div className="mt-6">
            <span className="text-4xl font-bold text-primary-700">{formatPrice(product.price)}</span>
          </div>

          <div className="mt-6 prose prose-sm max-w-none">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity & add to cart */}
          {inStock && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleAddToCart} className="btn-primary inline-flex items-center justify-center gap-2 flex-1">
                  <ShoppingCart className="h-5 w-5" /> Add to Cart
                </button>
                <Link href="/cart" className="btn-outline text-center flex-1">
                  View Cart
                </Link>
              </div>
            </div>
          )}

          {/* Trust indicators */}
          <div className="mt-8 pt-6 border-t space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> Secure payments via Easypaisa
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> Cash on Delivery available
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> 7-day return policy
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
        <div className="flex items-center gap-3 mb-8">
          <StarRating rating={product.averageRating} size="lg" />
          <span className="text-gray-700">
            <strong>{product.averageRating.toFixed(1)}</strong> out of 5 ({product.numReviews} reviews)
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <ReviewForm productId={product._id} onReviewAdded={handleReviewAdded} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Reviews</h3>
            <ReviewList reviews={product.reviews} />
          </div>
        </div>
      </section>

      {zoomIndex !== null && product.images?.length > 0 && (
        <ImageZoomModal
          images={product.images}
          initialIndex={zoomIndex}
          alt={product.name}
          onClose={() => setZoomIndex(null)}
        />
      )}
    </div>
  );
}
