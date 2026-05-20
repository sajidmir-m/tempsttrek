import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { MOCK_PACKAGES } from '@/data/packages';
import { formatInr } from '@/lib/format-currency';
import { getSiteUrl } from '@/lib/site-url';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getSiteUrl();

  let pkg: any = null;

  try {
    const { data } = await supabase.from('packages').select('*').eq('slug', slug).single();

    if (data) {
      pkg = data;
    } else {
      pkg = MOCK_PACKAGES.find((p) => p.slug === slug);
    }
  } catch (error) {
    pkg = MOCK_PACKAGES.find((p) => p.slug === slug);
  }

  if (!pkg) {
    return {
      title: 'Package Not Found | Tempesttrek',
    };
  }

  return {
    title: `${pkg.title} | Tempesttrek`,
    description:
      pkg.description ||
      `Book ${pkg.title} - ${pkg.duration} tour package starting from ₹${formatInr(Number(pkg.price))}. Experience ${pkg.location} with Tempesttrek.`,
    keywords: `Kashmir tour, ${pkg.location}, ${pkg.title}, tour package, Tempesttrek`,
    openGraph: {
      title: pkg.title,
      description: pkg.description || `Experience ${pkg.location} with our ${pkg.duration} tour package.`,
      images: pkg.featured_image ? [pkg.featured_image] : [],
      url: `${baseUrl}/packages/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pkg.title,
      description: pkg.description || `Book ${pkg.title} tour package.`,
      images: pkg.featured_image ? [pkg.featured_image] : [],
    },
    alternates: {
      canonical: `${baseUrl}/packages/${slug}`,
    },
  };
}
