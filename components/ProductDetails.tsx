'use client';

import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from '@/lib/wishlist';
import { Product } from '@/types/product';
import { useEffect, useState } from 'react';

interface ProductDetailsProps {
  product: Product;
}

const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

const getCloudinaryUrl = (filename: string | undefined): string => {
  if (!filename) return '';
  const baseUrl =
    'https://res.cloudinary.com/marketahead/image/upload/v1764917401/fanrc';
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

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setIsWishlisted(isInWishlist(product.id, selectedVariant.id));
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
    if (product.images_local && product.images_local.length > 0) {
      return product.images_local.map((filename) => getCloudinaryUrl(filename));
    }
    const featured = product.featured_image_local
      ? getCloudinaryUrl(product.featured_image_local)
      : product.featured_image;
    const otherImages = product.images.filter(
      (img) => img !== product.featured_image
    );
    return [featured, ...otherImages].filter(Boolean);
  })();

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const priceDisplay =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  return (
    <div className='grid gap-8 lg:grid-cols-2'>
      {/* Image Gallery */}
      <div className='space-y-4'>
        {/* Main Image */}
        <div className='relative aspect-square overflow-hidden rounded-lg bg-gray-100'>
          {allImages[selectedImageIndex] ? (
            <img
              src={allImages[selectedImageIndex]}
              alt={`${product.title} - Image ${selectedImageIndex + 1}`}
              className='h-full w-full object-cover'
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
        </div>

        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className='grid grid-cols-4 gap-2'>
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  selectedImageIndex === index
                    ? 'border-gray-900'
                    : 'border-transparent hover:border-gray-300'
                }`}>
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className='h-full w-full object-cover'
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className='flex flex-col space-y-6'>
        <div>
          <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            {product.product_type}
          </span>
          <h1 className='mt-2 text-3xl font-bold text-gray-900'>
            {product.title}
          </h1>
          <p className='mt-4 text-2xl font-semibold text-gray-900'>
            {priceDisplay}
          </p>
        </div>

        {/* Variant Selection */}
        {product.variants.length > 1 && (
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Variant
            </label>
            <select
              value={selectedVariant.id}
              onChange={(e) => {
                const variant = product.variants.find(
                  (v) => v.id === Number(e.target.value)
                );
                if (variant) {
                  setSelectedVariant(variant);
                  setIsWishlisted(isInWishlist(product.id, variant.id));
                }
              }}
              className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900'>
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
          <h2 className='mb-3 text-lg font-semibold text-gray-900'>
            Description
          </h2>
          <div
            className='prose prose-sm max-w-none text-sm leading-relaxed text-gray-600 prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-li:text-gray-600 prose-a:text-blue-600'
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
          className={`mt-auto flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-medium text-white transition-colors ${
            isWishlisted
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gray-900 hover:bg-gray-800'
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
          <span>
            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </span>
        </button>

        {/* Buy Button */}
        <a
          href={product.url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex w-full items-center justify-center gap-2 rounded-md bg-[#fefa08] px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-[#e8e407]'>
          <span>Buy on Go Fast Hobbies</span>
          <svg
            className='h-5 w-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

