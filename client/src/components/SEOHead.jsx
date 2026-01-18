import { SEO } from "../config/seo";

export function SEOHead({
  title,
  description,
  image,
  url,
  type = "article",
  publishedTime,
  modifiedTime,
  author,
}) {
  const pageTitle = title ? `${title} | ${SEO.siteName}` : SEO.siteName;
  const pageDescription = description || "";
  const pageImage = image || SEO.defaultImage;
  const pageUrl = url ? `${SEO.baseUrl}${url}` : SEO.baseUrl;
  const pageAuthor = author || SEO.author;
  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="author" content={pageAuthor} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={SEO.siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO.twitterHandle} />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
    </>
  );
}

