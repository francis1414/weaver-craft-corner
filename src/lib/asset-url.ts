/**
 * Media lives on Lovable's asset CDN, served from the Lovable origin.
 * When the app is hosted elsewhere (e.g. Vercel) the relative `/__l5e/...`
 * path 404s, so resolve those pointers against the canonical origin.
 */
export const ASSET_ORIGIN = "https://weaver-craft-corner.lovable.app";

export function assetUrl(url: string): string {
  return url.startsWith("/__l5e/") ? `${ASSET_ORIGIN}${url}` : url;
}
