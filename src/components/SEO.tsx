import React from 'react';
import { Helmet } from 'react-helmet-async';
import { INSTAGRAM_URL } from '../lib/socialLinks';
import {
  CORE_KEYWORDS,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  createBreadcrumbSchema,
  createWebPageSchema,
  stringifyJsonLd,
} from '../lib/seo';
import type { JsonLd, SeoBreadcrumb } from '../lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article';
  pageType?: string;
  breadcrumbs?: SeoBreadcrumb[];
  keywords?: string[];
  structuredData?: JsonLd | JsonLd[];
  noindex?: boolean;
}

export default function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'Serendib Trading vehicle showroom in Sri Lanka',
  ogType = 'website',
  pageType = 'WebPage',
  breadcrumbs,
  keywords = [],
  structuredData,
  noindex = false,
}: SEOProps) {
  React.useEffect(() => {
    document.querySelectorAll('head [data-seo-fallback="true"]').forEach((node) => node.remove());
  }, []);

  const siteTitle = `${SITE_NAME} | Imported Vehicles Sri Lanka`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : siteTitle;
  const siteDescription = description || SITE_DESCRIPTION;
  const fullCanonical = absoluteUrl(canonical || '/');
  const fullImage = absoluteUrl(ogImage);
  const robotsContent = noindex
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const normalizedKeywords = Array.from(new Set([...keywords, ...CORE_KEYWORDS]));
  const extraSchemas = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];
  const schemas = [
    createWebPageSchema({
      pageType,
      canonicalUrl: fullCanonical,
      title: fullTitle,
      description: siteDescription,
      image: fullImage,
    }),
    ...(breadcrumbs && breadcrumbs.length > 0 ? [createBreadcrumbSchema(breadcrumbs)] : []),
    ...extraSchemas,
  ];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={normalizedKeywords.join(', ')} />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />

      {/* Canonical */}
      <link rel="canonical" href={fullCanonical} />
      <link rel="alternate" hrefLang="en-LK" href={fullCanonical} />
      <link rel="alternate" hrefLang="x-default" href={fullCanonical} />
      <link rel="me" href={INSTAGRAM_URL} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_LK" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      
      {/* Robots */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* Structured Data */}
      {schemas.map((schema, index) => (
        <script key={`jsonld-${index}`} type="application/ld+json">
          {stringifyJsonLd(schema)}
        </script>
      ))}
    </Helmet>
  );
}
