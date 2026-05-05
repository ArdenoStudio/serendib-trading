import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
}

export default function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage = '/serendib-logo.png', 
  ogType = 'website' 
}: SEOProps) {
  const siteTitle = 'Serendib Trading | Luxury & Performance Vehicles Sri Lanka';
  const fullTitle = title ? `${title} | Serendib Trading` : siteTitle;
  const siteDescription = description || "Sri Lanka's premier destination for luxury and performance vehicles. Direct imports from UK & Japan with unmatched quality.";
  const siteUrl = 'https://serendibtrading.lk';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={siteDescription} />

      {/* Canonical */}
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={siteDescription} />
      <meta property="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      
      {/* Robots */}
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
}
