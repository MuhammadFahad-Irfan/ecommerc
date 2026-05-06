'use client';

import Image, { ImageProps } from 'next/image';

/**
 * Hosts whose URLs 302-redirect to a CDN that Next.js's image optimizer
 * cannot follow under the strict `remotePatterns` allowlist. Production
 * builds enforce this strictly, dev mode tends to be looser — so an image
 * that loads locally can fail in prod.
 *
 * Bypassing the optimizer with `unoptimized` makes these URLs render
 * reliably everywhere. Cloudinary, Unsplash, and other direct-serving
 * hosts are untouched and keep getting optimized.
 */
const REDIRECT_PRONE_HOSTS = /(picsum\.photos|fastly\.picsum\.photos|i\.picsum\.photos)/i;

function shouldBypassOptimizer(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') return false;
  return REDIRECT_PRONE_HOSTS.test(src);
}

/**
 * Drop-in replacement for next/image's <Image>. Identical API, except it
 * automatically passes `unoptimized` for hosts known to redirect across
 * domains. Pass `unoptimized` explicitly to override.
 */
export default function ProductImage(props: ImageProps) {
  const { unoptimized, src, alt, ...rest } = props;
  const auto = unoptimized ?? shouldBypassOptimizer(src);
  return <Image src={src} alt={alt} unoptimized={auto} {...rest} />;
}
