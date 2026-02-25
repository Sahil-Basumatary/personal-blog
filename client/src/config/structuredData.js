import { SEO } from "./seo";

function authorEntity() {
  return {
    "@type": "Person",
    name: SEO.author,
    url: SEO.baseUrl,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO.siteName,
    url: SEO.baseUrl,
    description:
      "Thoughts on software engineering, system design, and the journey from student to industry.",
    author: authorEntity(),
    inLanguage: "en-GB",
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SEO.author,
    url: SEO.baseUrl,
    image: SEO.defaultImage,
    sameAs: [
      `https://twitter.com/${SEO.twitterHandle.replace("@", "")}`,
    ],
  };
}

export function blogPostingSchema(post) {
  const wordCount = post.content
    ? post.content.split(/\s+/).filter(Boolean).length
    : 0;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SEO.baseUrl}/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.excerpt || "",
    image: SEO.defaultImage,
    url: `${SEO.baseUrl}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    author: authorEntity(),
    publisher: {
      "@type": "Person",
      name: SEO.author,
      url: SEO.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: SEO.defaultImage,
      },
    },
    articleSection: post.categoryLabel,
    wordCount,
    inLanguage: "en-GB",
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: post.upvotes || 0,
    },
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${SEO.baseUrl}${item.url}` }),
    })),
  };
}
