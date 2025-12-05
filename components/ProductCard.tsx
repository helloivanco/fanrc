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
      className='group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg'>
      <div className='relative aspect-square overflow-hidden bg-gray-100'>
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
            onError={() => setImageError(true)}
          />
        ) : (
          <div className='flex h-full items-center justify-center bg-gray-100 text-gray-400'>
            <svg
              className='h-12 w-12'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
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
          className={`absolute right-2 top-2 z-10 rounded-full p-2 transition-all ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-white'
          }`}>
          <svg
            className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`}
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

      <div className='flex flex-1 flex-col p-4'>
        <div className='mb-2'>
          <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            {product.product_type}
          </span>
        </div>

        <h3 className='mb-2 line-clamp-2 text-lg font-semibold text-gray-900'>
          {product.title}
        </h3>

        <p className='mb-4 line-clamp-2 flex-1 text-sm text-gray-600'>
          {product.description_text.substring(0, 100)}...
        </p>

        <div className='mt-auto flex items-center justify-between'>
          <span className='text-xl font-bold text-gray-900'>
            {priceDisplay}
          </span>
        </div>

        {product.variants.length > 1 && (
          <div className='mt-2 text-xs text-gray-500'>
            {product.variants.length} variant
            {product.variants.length > 1 ? 's' : ''} available
          </div>
        )}
      </div>
    </Link>
  );
};
