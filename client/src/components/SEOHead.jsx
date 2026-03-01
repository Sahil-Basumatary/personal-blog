import { SEO } from "../config/seo";

export function SEOHead({
  title,
  description,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
  section,
  tags,
  prerenderStatusCode,
}) {
  const pageTitle = title ? `${title} | ${SEO.siteName}` : SEO.siteName;
  const pageDescription = description || "";
  const pageImage = image || SEO.defaultImage;
  const pageUrl = url ? `${SEO.baseUrl}${url}` : SEO.baseUrl;
  const pageAuthor = author || SEO.author;
  const imageAlt = title ? `${title} — ${SEO.siteName}` : SEO.siteName;
  const isArticle = type === "article";
  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="author" content={pageAuthor} />
      <link rel="canonical" href={pageUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {prerenderStatusCode && (
        <meta name="prerender-status-code" content={String(prerenderStatusCode)} />
      )}
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={SEO.siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      {pageImage.startsWith("https") && (
        <meta property="og:image:secure_url" content={pageImage} />
      )}
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />
      {isArticle && (
        <meta property="article:author" content={SEO.baseUrl} />
      )}
      {isArticle && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {isArticle && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {isArticle && section && (
        <meta property="article:section" content={section} />
      )}
      {isArticle && tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO.twitterHandle} />
      <meta name="twitter:creator" content={SEO.twitterHandle} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:image:alt" content={imageAlt} />
    </>
  );
}
