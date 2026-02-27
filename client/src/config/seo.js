const baseUrl = import.meta.env.VITE_SITE_URL || "https://blog.sahilbzy.com";
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
export const SEO = {
  siteName: "Sahil Blogs",
  baseUrl,
  apiBaseUrl,
  defaultImage: `${baseUrl}/images/original-logo.png`,
  twitterHandle: "@sahilbzy",
  author: "Sahil Basumatary",
};

export function getOgImageUrl(title, category) {
  const params = new URLSearchParams({ title });
  if (category) params.set("category", category);
  return `${apiBaseUrl}/og?${params.toString()}`;
}

