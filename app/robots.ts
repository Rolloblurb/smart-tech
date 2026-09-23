import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.smarttechstore.co.ke";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}