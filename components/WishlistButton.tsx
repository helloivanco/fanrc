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
        className='relative flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800'
        aria-label={`Wishlist (${wishlistCount} items)`}>
        <svg
          className='h-5 w-5'
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
        <span>Wishlist</span>
        {wishlistCount > 0 && (
          <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white'>
            {wishlistCount}
          </span>
        )}
      </button>

      {showWishlist && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => setShowWishlist(false)}
          />
          <div className='absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-xl'>
            <div className='max-h-[600px] overflow-y-auto p-4'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Wishlist ({wishlistCount} items)
                </h3>
                <button
                  onClick={() => setShowWishlist(false)}
                  className='text-gray-400 hover:text-gray-600'
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
                <div className='py-8 text-center text-gray-500'>
                  <svg
                    className='mx-auto h-12 w-12 text-gray-400'
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
                  <p className='mt-2'>Your wishlist is empty</p>
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
                          className='relative flex gap-3 rounded-lg border border-gray-200 p-3'>
                          <div className='flex-1'>
                            <h4 className='text-sm font-semibold text-gray-900'>
                              {product.title}
                            </h4>
                            {variant && variant.title !== 'Default Title' && (
                              <p className='text-xs text-gray-500'>
                                {variant.title}
                              </p>
                            )}
                            <p className='mt-1 text-sm text-gray-600'>
                              Qty: {item.quantity} × {formatPrice(price)}
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
                            className='absolute right-2 top-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
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

                  <div className='mt-6 space-y-2 border-t border-gray-200 pt-4'>
                    <button
                      onClick={handleCopyToClipboard}
                      className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'>
                      {copied ? 'Copied to Clipboard!' : 'Copy Wishlist Items'}
                    </button>
                    <button
                      onClick={handleShareToMessenger}
                      className='flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700'
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
