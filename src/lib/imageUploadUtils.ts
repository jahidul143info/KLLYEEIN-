/**
 * Mobile-optimized image compression and upload helper.
 * Handles high-resolution mobile camera photos (iPhone/Android),
 * auto-downscales to web-friendly sizes (1600px max, ~200-400KB),
 * and uploads to the server/Cloudinary reliably.
 */

export interface ProcessedImageResult {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compresses an image file client-side before uploading.
 * This prevents mobile 413 Payload Too Large errors and speeds up uploads on 4G/5G.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    // If SVG or already tiny, skip canvas compression
    if (file.type === 'image/svg+xml' || (file.size < 80 * 1024 && file.type === 'image/webp')) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          file,
          dataUrl: reader.result as string,
          width: 0,
          height: 0,
          originalSize: file.size,
          compressedSize: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from device.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image format. Please select standard PNG or JPG.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Downscale if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas 2D context not available');
          }

          // Render image onto canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP or JPEG
          const outputType = 'image/jpeg';
          const dataUrl = canvas.toDataURL(outputType, quality);

          // Convert DataURL to Blob / File
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback using dataUrl
                const newFile = dataURItoFile(dataUrl, file.name.replace(/\.[^/.]+$/, '') + '.jpg');
                resolve({
                  file: newFile,
                  dataUrl,
                  width,
                  height,
                  originalSize: file.size,
                  compressedSize: newFile.size,
                });
                return;
              }

              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                { type: outputType, lastModified: Date.now() }
              );

              resolve({
                file: compressedFile,
                dataUrl,
                width,
                height,
                originalSize: file.size,
                compressedSize: compressedFile.size,
              });
            },
            outputType,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts a base64 Data URI to a File object
 */
export function dataURItoFile(dataURI: string, filename: string): File {
  const arr = dataURI.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Uploads a processed image to the server/Cloudinary API
 */
export async function uploadImageToServer(
  file: File,
  folder = 'kllyeein-gadgets/products'
): Promise<{ url: string; public_id?: string; rawUrl?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error || 'Failed to upload image to server');
  }

  return {
    url: data.url,
    public_id: data.public_id,
    rawUrl: data.rawUrl,
  };
}
