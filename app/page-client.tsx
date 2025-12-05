'use client';

import { FilterBar } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { WishlistButton } from '@/components/WishlistButton';
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

const ITEMS_PER_PAGE = 16;

export const PageClient = ({ products }: { products: Product[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(false);
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
      <header className='sticky top-0 z-30 border-b border-gray-200/50 bg-[#fefa08] shadow-sm backdrop-blur-sm'>
        <div className='mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <Link
              href='/'
              className='flex items-center gap-3 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded-lg'>
              <Image
                src='/fanrc-logo-transparent.png'
                alt='Fan RC'
                width={120}
                height={40}
                className='h-auto w-auto'
                priority
              />
            </Link>
            <WishlistButton products={products} />
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
        <h1 className='sr-only'>Fan RC - Premium RC Parts & Accessories</h1>
        {/* Search and Filters Section */}
        <div className='mb-10 space-y-6'>
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            onFilterClick={() => setIsFilterPaneOpen(true)}
            filterActiveCount={selectedTypes.length}
          />

          <div className='grid gap-6 lg:grid-cols-4'>
            <div className='hidden lg:block lg:col-span-1'>
              <FilterBar
                products={products}
                selectedTypes={selectedTypes}
                onTypeChange={setSelectedTypes}
              />
            </div>

            {/* Products Grid */}
            <div className='lg:col-span-3'>
              <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Showing <span className='font-semibold text-gray-900'>{displayedProducts.length}</span> of{' '}
                  <span className='font-semibold text-gray-900'>{filteredProducts.length}</span> products
                  {filteredProducts.length !== products.length && (
                    <span className='text-gray-500'> ({products.length} total)</span>
                  )}
                </p>
                {(searchQuery || selectedTypes.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTypes([]);
                    }}
                    className='flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1'>
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
                    Clear filters
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className='rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm'>
                  <svg
                    className='mx-auto h-16 w-16 text-gray-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <h3 className='mt-6 text-xl font-semibold text-gray-900'>
                    No products found
                  </h3>
                  <p className='mt-2 text-sm text-gray-500'>
                    Try adjusting your search or filters to find what you're looking for
                  </p>
                  {(searchQuery || selectedTypes.length > 0) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTypes([]);
                      }}
                      className='mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2'>
                      Clear all filters
                    </button>
                  )}
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
                      className='mt-10 flex items-center justify-center py-12'>
                      <div className='flex items-center gap-3 text-gray-500'>
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
                        <span className='text-sm font-medium'>
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

      {/* Mobile Filter Pane */}
      {isFilterPaneOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden"
            onClick={() => setIsFilterPaneOpen(false)}
            aria-hidden="true"
          />
          {/* Filter Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsFilterPaneOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsFilterPaneOpen(false);
                  }
                }}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                aria-label="Close filters"
                tabIndex={0}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <FilterBar
                products={products}
                selectedTypes={selectedTypes}
                onTypeChange={(types) => {
                  setSelectedTypes(types);
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className='mt-20 border-t border-gray-200 bg-white'>
        <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='flex flex-wrap items-center justify-center gap-4'>
              <a
                href='https://www.facebook.com/profile.php?id=100082969317056'
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center gap-3 rounded-xl bg-[#1877F2] px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#166FE5] hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2'>
                <svg
                  className='h-6 w-6 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'>
                  <path
                    fillRule='evenodd'
                    d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Fan RC</span>
              </a>
              <a
                href='https://www.facebook.com/groups/1391343472430150'
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center gap-3 rounded-xl bg-[#1877F2] px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#166FE5] hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2'>
                <svg
                  className='h-6 w-6 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'>
                  <path
                    fillRule='evenodd'
                    d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Fan RC Owners Group</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
