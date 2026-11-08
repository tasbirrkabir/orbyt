import type { MetadataRoute } from "next";
import { ESSAYS } from "@/content/insights";
import { DETAILED_SERVICES } from "@/content/services-data";
import { CASE_STUDIES } from "@/content/orbyt";
import { LEGAL } from "@/content/legal";

const BASE_URL = "https://orbytonward.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/software-development-company-bangladesh`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/work`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/insights`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/team`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/process`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Case study routes
  const caseStudyRoutes: MetadataRoute.Sitemap = CASE_STUDIES.map((cs) => ({
    url: `${BASE_URL}/work/${cs.id}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // Service landing pages
  const serviceRoutes: MetadataRoute.Sitemap = DETAILED_SERVICES.map((service) => ({
    url: `${BASE_URL}/services/${service.slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Insights / Articles
  const insightRoutes: MetadataRoute.Sitemap = ESSAYS.map((essay) => ({
    url: `${BASE_URL}/insights/${essay.slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  // Legal documents
  const legalRoutes: MetadataRoute.Sitemap = LEGAL.map((doc) => ({
    url: `${BASE_URL}/legal/${doc.slug}`,
    lastModified: currentDate,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    ...staticRoutes,
    ...caseStudyRoutes,
    ...serviceRoutes,
    ...insightRoutes,
    ...legalRoutes,
  ];
}
