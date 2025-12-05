'use client';

import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from '@/lib/wishlist';
import { Product } from '@/types/product';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface ProductCardProps {
  product: Product;
  onWishlistChange?: () => void;
}

const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

const getCloudinaryUrl = (filename: string | undefined): string => {
  if (!filename) return '';
  const baseUrl =
    'https://res.cloudinary.com/marketahead/image/upload/v1764917401/fanrc';
  // Remove /media/ prefix if present
  const cleanFilename = filename.startsWith('media/')
    ? filename.replace('media/', '')
    : filename;
  return `${baseUrl}/${cleanFilename}`;
};

const getImageUrl = (imageUrl: string): string => {
  if (imageUrl.startsWith('//')) {
    return `https:${imageUrl}`;
  }
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return imageUrl;
};

export const ProductCard = ({
  product,
  onWishlistChange,
}: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [localWishlistChange, setLocalWishlistChange] = useState(0);

  const defaultVariant = product.variants[0];
  const isWishlisted = useMemo(
    () => isInWishlist(product.id, defaultVariant.id),
    [product.id, defaultVariant.id, localWishlistChange]
  );

  const handleToggleWishlist = () => {
    const variantId = defaultVariant.id;

    if (isWishlisted) {
      removeFromWishlist(product.id, variantId);
    } else {
      addToWishlist({
        productId: product.id,
        variantId: variantId,
        quantity: 1,
      });
    }

    setLocalWishlistChange((prev) => prev + 1);

    if (onWishlistChange) {
      onWishlistChange();
    }
  };


  const handleWishlistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleWishlist();
    }
  };

  const imageUrl = product.featured_image_local
    ? getCloudinaryUrl(product.featured_image_local)
    : getImageUrl(product.featured_image || product.images[0] || '');
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const priceDisplay =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  return (
    <Link
      href={`/products/${product.handle}`}
      className='group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-xl'>
      <div className='relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100'>
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className='h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110'
            onError={() => setImageError(true)}
            loading='lazy'
          />
        ) : (
          <div className='flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300'>
            <svg
              className='h-16 w-16'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleWishlist();
          }}
          onKeyDown={handleWishlistKeyDown}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          tabIndex={0}
          className={`absolute right-3 top-3 z-10 rounded-full p-2.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isWishlisted
              ? 'bg-red-500 text-white focus:ring-red-500'
              : 'bg-white/95 text-gray-600 hover:bg-white focus:ring-gray-900'
          }`}>
          <svg
            className={`h-5 w-5 transition-transform duration-200 ${isWishlisted ? 'fill-current scale-110' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
            />
          </svg>
        </button>
      </div>

      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-2'>
          <span className='inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
            {product.product_type}
          </span>
        </div>

        <h3 className='mb-2 line-clamp-2 text-lg font-semibold leading-tight text-gray-900 transition-colors group-hover:text-gray-700'>
          {product.title}
        </h3>

        <p className='mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500'>
          {product.description_text.substring(0, 100)}...
        </p>

        <div className='mt-auto flex items-baseline justify-between gap-2'>
          <span className='text-2xl font-bold tracking-tight text-gray-900'>
            {priceDisplay}
          </span>
        </div>

        {product.variants.length > 1 && (
          <div className='mt-3 flex items-center gap-1.5 text-xs text-gray-500'>
            <svg
              className='h-3.5 w-3.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
              />
            </svg>
            <span>{product.variants.length} variants</span>
          </div>
        )}
      </div>
    </Link>
  );
};
