import {Image} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import type {CSSProperties} from 'react';

interface GalleryImage {
  id?: string;
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

interface ProductGalleryProps {
  /** Array of product images */
  images: GalleryImage[];
  /** Currently selected variant's image */
  selectedVariantImage?: GalleryImage | null;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * Product image gallery with main image and thumbnail navigation.
 * Automatically switches to variant image when variant changes.
 */
export function ProductGallery({
  images,
  selectedVariantImage,
  className = '',
  style = {},
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Update active index when variant image changes
  useEffect(() => {
    if (selectedVariantImage && images.length > 0) {
      const variantImageIndex = images.findIndex(
        (img) => img.id === selectedVariantImage.id || img.url === selectedVariantImage.url
      );
      if (variantImageIndex !== -1) {
        setActiveIndex(variantImageIndex);
      }
    }
  }, [selectedVariantImage, images]);

  const displayImages = images.length > 0 ? images : [];
  const mainImage = displayImages[activeIndex] || selectedVariantImage;

  const thumbnailButtonStyle = (isActive: boolean): CSSProperties => ({
    width: '80px',
    height: '80px',
    padding: 0,
    border: isActive ? '2px solid #1a1a1a' : '2px solid transparent',
    borderRadius: '4px',
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0,
    backgroundColor: '#f5f5f5',
  });

  return (
    <div className={`product-gallery ${className}`.trim()} style={style}>
      {/* Main Image */}
      <div
        style={{
          aspectRatio: '1/1',
          backgroundColor: '#f5f5f5',
          marginBottom: '12px',
          overflow: 'hidden',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mainImage ? (
          <Image
            data={mainImage}
            sizes="(min-width: 1024px) 600px, (min-width: 768px) 50vw, 100vw"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
            }}
          >
            No image available
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {displayImages.map((image, index) => (
            <button
              key={image.id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              style={thumbnailButtonStyle(activeIndex === index)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                data={image}
                sizes="80px"
                style={{width: '100%', height: '100%', objectFit: 'contain'}}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
