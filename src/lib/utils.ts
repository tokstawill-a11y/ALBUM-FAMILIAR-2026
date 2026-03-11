/**
 * Sanitizes a URL by removing hardcoded localhost prefixes that might have been 
 * saved during local development, ensuring they work in production.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Remove hardcoded localhost:3000 if it exists
  if (url.includes("localhost:3000")) {
    return url.replace(/^https?:\/\/localhost:3000/, "");
  }
  
  return url;
}
