import { MetadataRoute } from "next"
import { landingPagesData } from "@/lib/landing-pages-data"
import { blogPosts } from "@/lib/blog-posts"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.proxiva.co.ke"

  // Core Pages
  const routes = [
    "",
    "/blog",
    "/login",
    "/register",
    "/support",
    "/topup",
    "/buy",
    "/buy-emails",
    "/docs",
    "/docs/faq",
    "/guides/getting-started",
    "/guides/smtp-setup",
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }))

  // Landing Product Pages
  const landingPages = Object.keys(landingPagesData).map(slug => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  // Blog Articles Pages
  const blogRoutes = Object.keys(blogPosts).map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...routes, ...landingPages, ...blogRoutes]
}
