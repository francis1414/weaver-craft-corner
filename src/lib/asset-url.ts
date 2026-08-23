/**
 * Media lives on Lovable's asset CDN, served from the Lovable origin.
 * When the app is hosted elsewhere (e.g. Vercel) the relative `/__l5e/...`
 * path 404s, so resolve those pointers against the canonical origin.
 */
export const ASSET_ORIGIN = "https://weaver-craft-corner.lovable.app";

/**
 * Relative media paths (CDN pointers and the storage proxy route) are only
 * publicly reachable on the canonical published origin — the preview host
 * gates them behind auth and other hosts (e.g. Vercel) 404. Resolve both.
 */
export function assetUrl(url: string): string {
  if (url.startsWith("/__l5e/") || url.startsWith("/api/public/media/")) {
    return `${ASSET_ORIGIN}${url}`;
  }
  return url;
}
