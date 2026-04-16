/**
 * compressImage — client-side image compression using the Canvas API.
 *
 * Resizes to fit within maxWidth × maxHeight while preserving aspect ratio,
 * then encodes as WebP at the given quality. Runs entirely in the browser
 * before the file is uploaded to Convex Storage — reduces bandwidth + storage.
 *
 * Typical savings: 5 MB JPEG → 150–400 KB WebP (≈ 10–30× smaller)
 */
export async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.82
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { naturalWidth: w, naturalHeight: h } = img;

      // Scale down proportionally if larger than max dimensions
      if (w > maxWidth || h > maxHeight) {
        const scale = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not available")); return; }

      // Smooth downscaling for best quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Compression failed")); return; }
          // Rename to .webp so Convex Storage serves the correct MIME type
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(
            new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            })
          );
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };

    img.src = objectUrl;
  });
}

/** Preset configs matching the dimension specs shown to restaurant owners */
export const IMAGE_PRESETS = {
  logo:   { maxWidth: 400,  maxHeight: 400,  quality: 0.88 },
  banner: { maxWidth: 1280, maxHeight: 400,  quality: 0.82 },
  dish:   { maxWidth: 800,  maxHeight: 600,  quality: 0.80 },
} as const;
