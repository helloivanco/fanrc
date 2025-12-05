'use client';

import { FANRC_MESSENGER_URL } from '@/config/constants';
import {
  clearWishlist,
  formatWishlistForMessenger,
  getWishlist,
  removeFromWishlist,
} from '@/lib/wishlist';
import { Product, WishlistItem } from '@/types/product';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface WishlistButtonProps {
  products: Product[];
}

export const WishlistButton = ({ products }: WishlistButtonProps) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateWishlist = () => {
      const items = getWishlist();
      setWishlistCount(items.reduce((sum, item) => sum + item.quantity, 0));
      setWishlistItems(items);
    };

    updateWishlist();
    window.addEventListener('storage', updateWishlist);
    const interval = setInterval(updateWishlist, 500);

    return () => {
      window.removeEventListener('storage', updateWishlist);
      clearInterval(interval);
    };
  }, []);

  const handleShareToMessenger = () => {
    const message = formatWishlistForMessenger(wishlistItems, products);
    const encodedMessage = encodeURIComponent(message);
    const messengerUrl = `${FANRC_MESSENGER_URL}?text=${encodedMessage}`;
    window.open(messengerUrl, '_blank');
  };

  const handleCopyToClipboard = async () => {
    const message = formatWishlistForMessenger(wishlistItems, products);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClearWishlist = () => {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist();
      setWishlistCount(0);
      setWishlistItems([]);
      setShowWishlist(false);
    }
  };

  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setShowWishlist(!showWishlist)}
        className='relative flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-white shadow-lg transition-all duration-200 hover:bg-gray-800 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2'
        aria-label={`Wishlist (${wishlistCount} items)`}>
        <svg
          className='h-5 w-5 transition-transform duration-200'
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
        <span className='font-medium'>Wishlist</span>
        {wishlistCount > 0 && (
          <span className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg transition-transform duration-200 animate-in zoom-in'>
            {wishlistCount}
          </span>
        )}
      </button>

      {showWishlist && (
        <>
          <div
            className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200'
            onClick={() => setShowWishlist(false)}
          />
          <div className='absolute right-0 top-full z-50 mt-3 w-96 animate-in fade-in slide-in-from-top-2 duration-200 rounded-2xl border border-gray-200 bg-white shadow-2xl'>
            <div className='max-h-[600px] overflow-y-auto p-6'>
              <div className='mb-6 flex items-center justify-between border-b border-gray-100 pb-4'>
                <h3 className='text-xl font-bold text-gray-900'>
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className='ml-2 text-sm font-normal text-gray-500'>
                      ({wishlistCount} {wishlistCount === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowWishlist(false)}
                  className='rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1'
                  aria-label='Close wishlist'>
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              {wishlistItems.length === 0 ? (
                <div className='py-12 text-center'>
                  <svg
                    className='mx-auto h-16 w-16 text-gray-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                    />
                  </svg>
                  <p className='mt-4 text-base font-medium text-gray-500'>Your wishlist is empty</p>
                  <p className='mt-1 text-sm text-gray-400'>Start adding products to your wishlist</p>
                </div>
              ) : (
                <>
                  <div className='space-y-3'>
                    {wishlistItems.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId
                      );
                      if (!product) return null;

                      const variant = item.variantId
                        ? product.variants.find((v) => v.id === item.variantId)
                        : product.variants[0];

                      const price = variant
                        ? variant.price
                        : product.variants[0].price;

                      return (
                        <div
                          key={`${item.productId}-${
                            item.variantId || 'default'
                          }`}
                          className='group relative flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md'>
                          <div className='flex-1 min-w-0'>
                            <h4 className='text-sm font-semibold leading-tight text-gray-900 truncate'>
                              {product.title}
                            </h4>
                            {variant && variant.title !== 'Default Title' && (
                              <p className='mt-1 text-xs text-gray-500'>
                                {variant.title}
                              </p>
                            )}
                            <p className='mt-2 text-sm font-medium text-gray-900'>
                              {item.quantity} × {formatPrice(price)} = {formatPrice(price * item.quantity)}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              removeFromWishlist(
                                item.productId,
                                item.variantId
                              );
                              const items = getWishlist();
                              setWishlistCount(
                                items.reduce(
                                  (sum, item) => sum + item.quantity,
                                  0
                                )
                              );
                              setWishlistItems(items);
                            }}
                            className='flex-shrink-0 rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1'
                            aria-label='Remove from wishlist'
                            tabIndex={0}>
                            <svg
                              className='h-4 w-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className='mt-6 space-y-3 border-t border-gray-200 pt-6'>
                    <button
                      onClick={handleCopyToClipboard}
                      className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1'>
                      {copied ? (
                        <>
                          <svg
                            className='h-5 w-5 text-green-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          <span className='text-green-600'>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className='h-5 w-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                            />
                          </svg>
                          <span>Copy Wishlist</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShareToMessenger}
                      className='flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      aria-label='Share to Facebook Messenger'>
                      <Image
                        src='/Messenger_Icon_Secondary_White.svg'
                        alt='Messenger'
                        width={20}
                        height={20}
                        className='h-5 w-5'
                      />
                      <span>Message FanRC to Order</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
