import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import productsData from '@/data/products.json';
import { Product } from '@/types/product';
import { ProductDetails } from '@/components/ProductDetails';

const products = productsData as Product[];

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

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    handle: product.handle,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = products.find((p) => p.handle === handle);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const imageUrl = product.featured_image_local
    ? getCloudinaryUrl(product.featured_image_local)
    : getImageUrl(product.featured_image || product.images[0] || '');

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const priceDisplay =
    minPrice === maxPrice
      ? `$${(minPrice / 100).toFixed(2)}`
      : `$${(minPrice / 100).toFixed(2)} - $${(maxPrice / 100).toFixed(2)}`;

  const description = product.description_text || product.title;
  const truncatedDescription =
    description.length > 160
      ? description.substring(0, 157) + '...'
      : description;

  return {
    title: `${product.title} | Fan RC`,
    description: truncatedDescription,
    openGraph: {
      title: product.title,
      description: truncatedDescription,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, alt: product.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: truncatedDescription,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `https://www.gofasthobbies.com/products/${handle}`,
    },
    other: {
      'product:price:amount': (minPrice / 100).toFixed(2),
      'product:price:currency': 'USD',
      'product:availability': product.variants.some((v) => v.available)
        ? 'in stock'
        : 'out of stock',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = products.find((p) => p.handle === handle);

  if (!product) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='sticky top-0 z-30 border-b border-gray-200 bg-[#fefa08] shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <Link
              href='/'
              className='flex items-center gap-3 transition-opacity hover:opacity-80'>
              <Image
                src='/fanrc-logo-transparent.png'
                alt='Fan RC'
                width={120}
                height={40}
                className='h-auto w-auto'
                priority
              />
            </Link>
            <Link
              href='/'
              className='text-sm font-medium text-gray-900 hover:text-gray-700'>
              ← Back to Products
            </Link>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <ProductDetails product={product} />
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
}

