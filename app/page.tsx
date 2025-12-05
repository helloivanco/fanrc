import productsData from '@/data/products.json';
import { Product } from '@/types/product';
import { Metadata } from 'next';
import { PageClient } from './page-client';

const products = productsData as Product[];

export const metadata: Metadata = {
  title: 'Fan RC - Premium RC Parts & Accessories',
  description:
    'Browse and shop premium RC parts and accessories from Fan RC. Search, filter, and create your wishlist. High-quality carbon fiber parts, titanium hardware, and more for RC enthusiasts.',
  keywords: [
    'RC parts',
    'RC accessories',
    'carbon fiber RC',
    'titanium hardware',
    'RC10 parts',
    'Fan RC',
    'RC car parts',
    'RC upgrades',
  ],
  openGraph: {
    title: 'Fan RC - Premium RC Parts & Accessories',
    description:
      'Browse and shop premium RC parts and accessories from Fan RC. High-quality carbon fiber parts, titanium hardware, and more.',
    type: 'website',
    url: 'https://www.gofasthobbies.com',
    siteName: 'Fan RC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fan RC - Premium RC Parts & Accessories',
    description:
      'Browse and shop premium RC parts and accessories from Fan RC.',
  },
  alternates: {
    canonical: 'https://www.gofasthobbies.com',
  },
};

export default function Home() {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Fan RC',
            description:
              'Premium RC parts and accessories from Fan RC. High-quality carbon fiber parts, titanium hardware, and more.',
            url: 'https://www.gofasthobbies.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate:
                  'https://www.gofasthobbies.com/?search={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <PageClient products={products} />
    </>
  );
}
