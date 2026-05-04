'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import { apiPost, apiPut } from '@/lib/api';
import type { IProduct, Category } from '@/types';

interface ProductFormProps {
  product?: IProduct;
  mode: 'create' | 'edit';
}

const CATEGORIES: Category[] = ['Child', 'Women', 'Islamic'];

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    category: product?.category || 'Women' as Category,
    images: product?.images || [] as string[],
    isFeatured: product?.isFeatured || false,
  });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Convert to base64 for Cloudinary upload
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const result = await apiPost<{ url: string }>('/admin/upload', { image: base64 });
          setForm((prev) => ({ ...prev, images: [...prev.images, result.url] }));
          toast.success('Image uploaded');
        } catch (err) {
          const error = err as { message?: string };
          // If Cloudinary isn't set up, fall back to using the data URL directly
          if (error.message?.includes('not configured')) {
            toast.error('Cloudinary not configured. Paste image URLs manually below.');
          } else {
            toast.error(error.message || 'Upload failed');
          }
        }
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addImageUrl = () => {
    const url = prompt('Paste image URL:');
    if (url && url.trim()) {
      try {
        new URL(url);
        setForm((prev) => ({ ...prev, images: [...prev.images, url.trim()] }));
      } catch {
        toast.error('Invalid URL');
      }
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category: form.category,
        images: form.images,
        isFeatured: form.isFeatured,
      };

      if (mode === 'create') {
        await apiPost('/products', payload);
        toast.success('Product created!');
      } else if (product) {
        await apiPut(`/products/${product._id}`, payload);
        toast.success('Product updated!');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input
              type="number"
              required
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              className="input-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Islamic' ? 'Islamic Modest' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            className="text-primary-600"
          />
          <span className="text-sm text-gray-700">Mark as featured (shown on home page)</span>
        </label>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Images</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {form.images.map((img, idx) => (
            <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
              <Image src={img} alt={`Image ${idx + 1}`} fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}

          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-600 cursor-pointer transition">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6 mb-1" />
                <span className="text-xs">Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <button type="button" onClick={addImageUrl} className="text-sm text-primary-600 hover:underline">
          + Add image by URL
        </button>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </button>
      </div>
    </form>
  );
}
