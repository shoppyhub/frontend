import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';

const SEOHelmetProvider = ({ children, pageData = {} }) => {
  const location = useLocation();
  const { settings } = useBranding();
  
  // Default site data
  const siteName = settings?.siteName || 'RKD MART';
  const siteDescription = settings?.siteDescription || 'Your local marketplace for fresh groceries, electronics, and more. Shop from trusted local vendors with fast delivery.';
  const siteUrl = import.meta.env.VITE_BASE_URL || 'https://rkd-mart.com';
  const currentUrl = `${siteUrl}${location.pathname}`;
  
  // Page-specific data
  const {
    title,
    description,
    keywords,
    image = `${siteUrl}/images/rkd-mart-og-image.jpg`,
    type = 'website',
    noIndex = false
  } = pageData;
  
  // Generate structured data
  const generateStructuredData = () => {
    const baseStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": siteUrl,
      "description": siteDescription,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
    
    // Add organization data
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": siteName,
      "url": siteUrl,
      "logo": `${siteUrl}/images/logo.png`,
      "description": siteDescription,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-XXXXXXXXXX",
        "contactType": "customer service",
        "availableLanguage": ["English", "Hindi"]
      },
      "sameAs": [
        "https://facebook.com/rkdmart",
        "https://twitter.com/rkdmart",
        "https://instagram.com/rkdmart"
      ]
    };
    
    // Add breadcrumb data if available
    const breadcrumbData = pageData.breadcrumbs ? {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": pageData.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": `${siteUrl}${crumb.path}`
      }))
    } : null;
    
    return [baseStructuredData, organizationData, breadcrumbData].filter(Boolean);
  };
  
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const pageDescription = description || siteDescription;
  const pageKeywords = keywords || 'online marketplace, local shopping, groceries, electronics, fashion, home delivery, e-commerce, rkd mart';
  
  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="author" content={siteName} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@rkd_mart" />
        <meta name="twitter:creator" content="@rkd_mart" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={image} />
        
        {/* Additional SEO Tags */}
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="theme-color" content={settings?.themeColor || '#10b981'} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={currentUrl} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.rkd-mart.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />
        
        {/* Structured Data */}
        {generateStructuredData().map((data, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))}
        
        {/* Alternate Language Links */}
        <link rel="alternate" hreflang="en" href={currentUrl} />
        <link rel="alternate" hreflang="hi" href={`${currentUrl}?lang=hi`} />
        <link rel="alternate" hreflang="x-default" href={currentUrl} />
      </Helmet>
      
      {children}
    </>
  );
};

export default SEOHelmetProvider;
