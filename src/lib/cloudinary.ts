/**
 * Helper utility to build Cloudinary optimized image URLs with dynamic transformations
 */

const cloudName = 
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
  process.env.CLOUDINARY_CLOUD_NAME || 
  process.env.VITE_CLOUDINARY_CLOUD_NAME || 
  'pgggwtrz';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
}

/**
 * Transforms a raw image URL or Cloudinary public ID into an optimized Cloudinary delivery URL
 */
export function getCloudinaryImageUrl(
  imagePath: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!imagePath) return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800';

  // If it's already an Unsplash or external HTTP URL, return directly (or wrap if hosted on Cloudinary)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    if (imagePath.includes('res.cloudinary.com')) {
      const parts = imagePath.split('/upload/');
      if (parts.length === 2) {
        const { width = 800, quality = 'auto', format = 'auto', crop = 'fill' } = options;
        const transformStr = `c_${crop},w_${width},q_${quality},f_${format}`;
        return `${parts[0]}/upload/${transformStr}/${parts[1]}`;
      }
    }
    return imagePath;
  }

  // Construct Cloudinary URL from public ID
  const { width = 800, quality = 'auto', format = 'auto', crop = 'fill' } = options;
  const transformStr = `c_${crop},w_${width},q_${quality},f_${format}`;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${imagePath}`;
}
