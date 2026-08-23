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

/** Hard limits checked before anything is sent to storage. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MIN_IMAGE_EDGE = 500;

/** Target gallery frame — every product photo is normalised to 4:5. */
const THUMB_WIDTH = 1400;
const THUMB_HEIGHT = 1750;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} could not be read as an image`));
    };
    img.src = url;
  });
}

/**
 * Validates and normalises a photo in the browser: rejects oversized or
 * low-resolution files, then centre-crops to a consistent 4:5 frame and
 * re-encodes as WebP so gallery cards stay uniform and light.
 */
export async function prepareImage(file: File): Promise<File> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB — keep photos under 25MB`,
    );
  }
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  const img = await loadImage(file);
  if (Math.min(img.naturalWidth, img.naturalHeight) < MIN_IMAGE_EDGE) {
    throw new Error(
      `${file.name} is only ${img.naturalWidth}×${img.naturalHeight}px — use at least ${MIN_IMAGE_EDGE}px on the short edge`,
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = THUMB_WIDTH;
  canvas.height = THUMB_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  const scale = Math.max(THUMB_WIDTH / img.naturalWidth, THUMB_HEIGHT / img.naturalHeight);
  const drawWidth = img.naturalWidth * scale;
  const drawHeight = img.naturalHeight * scale;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    (THUMB_WIDTH - drawWidth) / 2,
    (THUMB_HEIGHT - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", 0.88),
  );
  if (!blob) return file;

  const base = safeName(file.name).replace(/\.[a-z0-9]+$/, "");
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

export async function uploadMedia(file: File, folder = "products"): Promise<string> {
  const prepared = await prepareImage(file);
  const path = `${folder}/${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeName(prepared.name)}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, prepared, {
    cacheControl: "31536000",
    ...(prepared.type ? { contentType: prepared.type } : {}),
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
