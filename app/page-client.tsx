'use client';

import { FilterBar } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { WishlistButton } from '@/components/WishlistButton';
import productsData from '@/data/products.json';
import { Product } from '@/types/product';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

const ITEMS_PER_PAGE = 16;

export const PageClient = ({ products }: { products: Product[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const filterKeyRef = useRef('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description_text
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.product_type
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Type filter
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(product.product_type);

      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, selectedTypes]);

  const [currentDisplayCount, setCurrentDisplayCount] =
    useState(ITEMS_PER_PAGE);

  // Compute filter key to detect filter changes
  const filterKey = useMemo(
    () => `${searchQuery}|${selectedTypes.join(',')}`,
    [searchQuery, selectedTypes]
  );

  // Reset display count when filter key changes
  useEffect(() => {
    const prevKey = filterKeyRef.current;
    if (prevKey !== filterKey) {
      filterKeyRef.current = filterKey;
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setCurrentDisplayCount(ITEMS_PER_PAGE);
      }, 0);
    }
  }, [filterKey]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentDisplayCount((prev) => {
            const next = prev + ITEMS_PER_PAGE;
            return next > filteredProducts.length
              ? filteredProducts.length
              : next;
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [filteredProducts.length]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, currentDisplayCount),
    [filteredProducts, currentDisplayCount]
  );

  const hasMore = currentDisplayCount < filteredProducts.length;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='sticky top-0 z-30 border-b border-gray-200 bg-[#fefa08] shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Image
                src='/fanrc-logo-transparent.png'
                alt='Fan RC'
                width={120}
                height={40}
                className='h-auto w-auto'
                priority
              />
            </div>
            <WishlistButton products={products} />
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Search and Filters Section */}
        <div className='mb-8 space-y-4'>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className='grid gap-4 lg:grid-cols-4'>
            <div className='lg:col-span-1'>
              <FilterBar
                products={products}
                selectedTypes={selectedTypes}
                onTypeChange={setSelectedTypes}
              />
            </div>

            {/* Products Grid */}
            <div className='lg:col-span-3'>
              <div className='mb-4 flex items-center justify-between'>
                <p className='text-sm text-gray-600'>
                  Showing {displayedProducts.length} of{' '}
                  {filteredProducts.length} products
                  {filteredProducts.length !== products.length &&
                    ` (${products.length} total)`}
                </p>
                {(searchQuery || selectedTypes.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTypes([]);
                    }}
                    className='text-sm font-medium text-gray-900 hover:text-gray-700'>
                    Clear all filters
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className='rounded-lg border border-gray-200 bg-white p-12 text-center'>
                  <svg
                    className='mx-auto h-12 w-12 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <h3 className='mt-4 text-lg font-semibold text-gray-900'>
                    No products found
                  </h3>
                  <p className='mt-2 text-sm text-gray-600'>
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {displayedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {hasMore && (
                    <div
                      ref={loadMoreRef}
                      className='mt-8 flex items-center justify-center py-8'>
                      <div className='flex items-center gap-2 text-gray-500'>
                        <svg
                          className='h-5 w-5 animate-spin'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                          />
                        </svg>
                        <span className='text-sm'>
                          Loading more products...
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='mt-16 border-t border-gray-200 bg-white'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='flex flex-wrap items-center justify-center gap-6'>
              <a
                href='https://www.facebook.com/profile.php?id=100082969317056'
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center gap-3 rounded-lg bg-[#1877F2] px-4 py-3 transition-all hover:bg-[#166FE5] hover:shadow-lg'>
                <svg
                  className='h-8 w-8 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'>
                  <path
                    fillRule='evenodd'
                    d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
                    clipRule='evenodd'
                  />
                </svg>
                <span className='font-semibold text-white'>
                  Fan RC Facebook
                </span>
              </a>
              <a
                href='https://www.facebook.com/groups/1391343472430150'
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center gap-3 rounded-lg bg-[#1877F2] px-4 py-3 transition-all hover:bg-[#166FE5] hover:shadow-lg'>
                <svg
                  className='h-8 w-8 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'>
                  <path
                    fillRule='evenodd'
                    d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
                    clipRule='evenodd'
                  />
                </svg>
                <span className='font-semibold text-white'>
                  Fan RC Owners Group
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

