import { useRef, useState } from "react";
import { Camera, ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmartImage } from "@/components/SmartImage";
import { uploadMedia } from "@/lib/media";

interface Props {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  accept?: string;
  folder?: string;
  max?: number;
  hint?: string;
}

/**
 * Upload media from a computer, phone gallery or phone camera — or paste any
 * hosted URL. Files land in the private media bucket and are served through
 * the public media proxy route.
 */
export function MediaUploader({
  label,
  value,
  onChange,
  multiple = true,
  accept = "image/*",
  folder = "products",
  max = 32,
  hint,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const room = Math.max(0, max - value.length);
      const picked = Array.from(files).slice(0, multiple ? room : 1);
      if (picked.length === 0) {
        toast.error(`Limit of ${max} files reached`);
        return;
      }
      const uploaded: string[] = [];
      const failures: string[] = [];
      for (const file of picked) {
        try {
          uploaded.push(await uploadMedia(file, folder));
        } catch (error) {
          failures.push(error instanceof Error ? error.message : `${file.name} failed`);
        }
      }
      if (uploaded.length > 0) {
        onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1));
        toast.success(`${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded`);
      }
      for (const message of failures.slice(0, 3)) toast.error(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  function addUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onChange(multiple ? [...value, trimmed] : [trimmed]);
    setUrl("");
  }

  const isVideo = accept.includes("video");

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value.length}
          {multiple ? ` / ${max}` : ""}
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={accept}
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload from device
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" /> Take photo
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={isVideo ? "Paste a YouTube or video link" : "Paste an image URL"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addUrl}>
          Add link
        </Button>
      </div>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {!isVideo && (
        <p className="text-xs text-muted-foreground">
          Photos are auto-cropped to a 4:5 gallery frame and compressed. Minimum 500px short edge,
          maximum 25MB per file.
        </p>
      )}

      {value.length > 0 && (
        <>
          {multiple && value.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Drag a photo to reorder — the first tile is the primary product image.
            </p>
          )}
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {value.map((item, index) => (
              <li
                key={`${item}-${index}`}
                draggable={multiple && value.length > 1}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  if (dragIndex === null || dragIndex === index) return;
                  e.preventDefault();
                  setOverIndex(index);
                }}
                onDragLeave={() => setOverIndex((prev) => (prev === index ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault();
                  move(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={cn(
                  "group relative overflow-hidden rounded border border-border transition",
                  multiple && value.length > 1 && "cursor-grab active:cursor-grabbing",
                  dragIndex === index && "opacity-40",
                  overIndex === index && "border-[#C29B38] ring-2 ring-[#C29B38]/50",
                )}
              >
                {isVideo ? (
                  <p className="break-all p-2 text-[10px] text-muted-foreground">{item}</p>
                ) : (
                  <SmartImage src={item} alt={`${label} ${index + 1}`} ratio="1/1" />
                )}
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded bg-background/90 text-destructive opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {multiple && value.length > 1 && (
                  <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Move earlier"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      className="grid h-6 w-6 place-items-center rounded bg-background/90 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    {index !== 0 && !isVideo && (
                      <button
                        type="button"
                        onClick={() => move(index, 0)}
                        className="rounded bg-background/90 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em]"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Move later"
                      disabled={index === value.length - 1}
                      onClick={() => move(index, index + 1)}
                      className="grid h-6 w-6 place-items-center rounded bg-background/90 disabled:opacity-30"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {!isVideo && index === 0 && multiple && (
                  <span className="absolute bottom-1 left-1 rounded bg-[#C29B38] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-[#1F1D1A] group-hover:opacity-0">
                    Primary
                  </span>
                )}
                <span className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded bg-background/80 text-[9px]">
                  <GripVertical className="h-3 w-3" />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {value.length === 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImagePlus className="h-4 w-4" /> Nothing added yet.
        </p>
      )}
    </div>
  );
}
