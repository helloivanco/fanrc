'use client';

import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from '@/lib/wishlist';
import { Product } from '@/types/product';
import { startTransition, useEffect, useRef, useState } from 'react';

interface ProductDetailsProps {
  product: Product;
}

const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

const getLocalImageUrl = (filename: string | undefined): string => {
  if (!filename) return '';

  const withoutLeadingSlashes = filename.replace(/^\/+/, '');
  const cleanFilename = withoutLeadingSlashes.replace(/^media\//, '');
  return `/images/${cleanFilename}`;
};

const getExternalImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';

  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('//')) {
    return `https:${imageUrl}`;
  }
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return imageUrl;
};

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const prevProductIdRef = useRef(product.id);
  const prevVariantIdRef = useRef(selectedVariant.id);

  useEffect(() => {
    const productChanged = prevProductIdRef.current !== product.id;
    const variantChanged = prevVariantIdRef.current !== selectedVariant.id;

    if (productChanged || variantChanged) {
      startTransition(() => {
        if (productChanged) {
          setSelectedImageIndex(0);
        }
        setIsWishlisted(isInWishlist(product.id, selectedVariant.id));
      });

      prevProductIdRef.current = product.id;
      prevVariantIdRef.current = selectedVariant.id;
    }
  }, [product.id, selectedVariant.id]);

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id, selectedVariant.id);
      setIsWishlisted(false);
    } else {
      addToWishlist({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: 1,
      });
      setIsWishlisted(true);
    }
  };

  const allImages = (() => {
    const localImages: string[] = [];

    if (product.featured_image_local) {
      localImages.push(getLocalImageUrl(product.featured_image_local));
    }

    if (product.images_local && product.images_local.length > 0) {
      for (const filename of product.images_local) {
        const url = getLocalImageUrl(filename);
        if (!localImages.includes(url)) {
          localImages.push(url);
        }
      }
    }

    if (localImages.length > 0) {
      return localImages;
    }

    const featured = product.featured_image
      ? getExternalImageUrl(product.featured_image)
      : '';
    const otherImages = product.images
      .filter((img) => img !== product.featured_image)
      .map((img) => getExternalImageUrl(img));

    return [featured, ...otherImages].filter(Boolean);
  })();

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const priceDisplay =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  return (
    <div className='grid gap-12 lg:grid-cols-2'>
      {/* Image Gallery */}
      <div className='space-y-4'>
        {/* Main Image */}
        <div className='relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg'>
          {allImages[selectedImageIndex] ? (
            <img
              src={allImages[selectedImageIndex]}
              alt={`${product.title} - Image ${selectedImageIndex + 1}`}
              className='h-full w-full object-cover transition-opacity duration-300'
              key={selectedImageIndex}
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
        </div>

        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className='grid grid-cols-4 gap-3'>
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${
                  selectedImageIndex === index
                    ? 'border-gray-900 shadow-md scale-105'
                    : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                }`}>
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-110'
                />
                {selectedImageIndex === index && (
                  <div className='absolute inset-0 bg-gray-900/5' />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className='flex flex-col space-y-8'>
        <div>
          <span className='inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600'>
            {product.product_type}
          </span>
          <h1 className='mt-4 text-4xl font-bold leading-tight text-gray-900'>
            {product.title}
          </h1>
          <p className='mt-6 text-3xl font-bold tracking-tight text-gray-900'>
            {priceDisplay}
          </p>
        </div>

        {/* Variant Selection */}
        {product.variants.length > 1 && (
          <div>
            <label className='mb-3 block text-sm font-semibold text-gray-900'>
              Select Variant
            </label>
            <select
              value={selectedVariant.id}
              onChange={(e) => {
                const variant = product.variants.find(
                  (v) => v.id === Number(e.target.value)
                );
                if (variant) {
                  setSelectedVariant(variant);
                  setSelectedImageIndex(0);
                  setIsWishlisted(isInWishlist(product.id, variant.id));
                }
              }}
              className='w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 hover:border-gray-400'>
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.title} - {formatPrice(variant.price)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className='mb-4 text-xl font-semibold text-gray-900'>
            Description
          </h2>
          <div
            className='prose prose-sm max-w-none leading-relaxed text-gray-600 prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-600 prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline'
            dangerouslySetInnerHTML={{
              __html:
                product.description_html ||
                product.description_text ||
                '<p>No description available.</p>',
            }}
          />
        </div>

        {/* Add to Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`group flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isWishlisted
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
              : 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-900'
          }`}>
          <svg
            className={`h-6 w-6 transition-transform duration-200 ${isWishlisted ? 'fill-current scale-110' : 'group-hover:scale-110'}`}
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
          <span>
            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </span>
        </button>
      </div>
    </div>
  );
};
