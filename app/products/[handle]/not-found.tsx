import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
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
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
            <svg
              className='h-10 w-10 text-gray-400'
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
          </div>
          <h1 className='text-4xl font-bold text-gray-900'>Product Not Found</h1>
          <p className='mt-4 text-lg text-gray-500'>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href='/'
            className='mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-gray-800 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2'>
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            Back to Products
          </Link>
        </div>
      </main>
    </div>
  );
}

