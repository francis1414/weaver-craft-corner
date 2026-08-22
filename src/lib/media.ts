import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "product-media";

/** Public, never-expiring URL served by the media proxy route. */
export function mediaUrl(path: string): string {
  return `/api/public/media/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function safeName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "file";
}

export async function uploadMedia(file: File, folder = "products"): Promise<string> {
  const path = `${folder}/${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeName(file.name)}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    ...(file.type ? { contentType: file.type } : {}),
    upsert: false,
  });

  if (error) throw error;
  return mediaUrl(path);
}

/** Extracts a YouTube video id from watch, share, shorts or embed links. */
export function youtubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function youtubeEmbedUrl(url: string, loop = false): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}
