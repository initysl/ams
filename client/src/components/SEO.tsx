// src/components/SEO.tsx
import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  author?: string;
  robots?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'AttendEase - Attendance Management System',
  description = 'Streamline attendance tracking with AttendEase - a digital QR code-based attendance management system.',
  keywords = 'attendance management, QR code attendance, student tracking',
  canonical = 'https://amsqr.up.railway.app',
  image = 'https://amsqr.up.railway.app/at.svg',
  type = 'website',
  twitterCard = 'summary_large_image',
  author,
  robots = 'index, follow',
}) => {
  return (
    <>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='robots' content={robots} />
      <link rel='canonical' href={canonical} />

      {/* Author meta tag if provided */}
      {author && <meta name='author' content={author} />}

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={canonical} />
      <meta property='og:image' content={image} />
      <meta property='og:site_name' content='AttendEase' />

      {/* Twitter */}
      <meta name='twitter:card' content={twitterCard} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
      <meta name='twitter:url' content={canonical} />
    </>
  );
};

export default SEO;
