import {useState, useEffect, useCallback} from 'react';
import {CustomImage, IMAGE_SIZES} from '../CustomImage';

interface GalleryImage {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

type MediaAspectRatio = 'square' | 'portrait' | 'landscape' | '16-9' | 'adapt';
type MediaRounding = 'none' | 'image' | '2rem' | '3rem';
type ImageZoomMode = 'lightbox' | 'hover' | 'none';

interface ProductGalleryProps {
  /** Array of product images */
  images: GalleryImage[];
  /** Currently selected variant's image */
  selectedVariantImage?: GalleryImage | null;
  /** Custom className */
  className?: string;
  /** Aspect ratio for media container */
  aspectRatio?: MediaAspectRatio;
  /** Whether to show transparent background */
  transparent?: boolean;
  /** Border radius modifier */
  rounded?: MediaRounding;
  /** Image zoom mode */
  imageZoom?: ImageZoomMode;
}

/**
 * Get the media modifier class based on aspect ratio.
 */
function getMediaModifier(aspectRatio: MediaAspectRatio): string {
  switch (aspectRatio) {
    case 'square':
      return 'media--square';
    case 'portrait':
      return 'media--portrait';
    case 'landscape':
      return 'media--landscape';
    case '16-9':
      return 'media--16-9';
    case 'adapt':
      return ''; // Adaptive uses inline padding-bottom
    default:
      return 'media--square';
  }
}

/**
 * Product image gallery with main image and thumbnail navigation.
 * Uses Mavon's .media class system for aspect ratio containers.
 * Images are absolutely positioned with object-fit: cover.
 * Automatically switches to variant image when variant changes.
 * Includes lightbox modal for full-size image viewing.
 */
export function ProductGallery({
  images,
  selectedVariantImage,
  className = '',
  aspectRatio = 'adapt',
  transparent = true,
  rounded = 'image',
  imageZoom = 'lightbox',
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Number of thumbnails visible at once - 3 on mobile, 5 on desktop
  const thumbnailsPerView = isMobile ? 3 : 5;

  // Update active index and scroll thumbnail slider when variant image changes
  // The selected variant thumbnail should be positioned as the FIRST thumbnail in the slider
  useEffect(() => {
    if (selectedVariantImage && images.length > 0) {
      const variantImageIndex = images.findIndex(
        (img) =>
          img.id === selectedVariantImage.id || img.url === selectedVariantImage.url,
      );
      if (variantImageIndex !== -1) {
        setActiveIndex(variantImageIndex);
        // Scroll thumbnail slider to position the selected thumbnail at the START (first position)
        // This matches Mavon Liquid behavior where selected variant image is always first in slider
        if (images.length > thumbnailsPerView) {
          // Max scroll position ensures we don't scroll past the last set of thumbnails
          const maxScrollPosition = images.length - thumbnailsPerView;
          // Position selected thumbnail at the start (index 0 of visible thumbnails)
          const newScrollPosition = Math.min(variantImageIndex, maxScrollPosition);
          setThumbnailScrollPosition(newScrollPosition);
        } else {
          // If fewer images than thumbnailsPerView, no need to scroll
          setThumbnailScrollPosition(0);
        }
      }
    }
  }, [selectedVariantImage, images, thumbnailsPerView]);

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setLightboxOpen(false);
          break;
        case 'ArrowLeft':
          setLightboxIndex((prev) =>
            prev > 0 ? prev - 1 : displayImages.length - 1
          );
          break;
        case 'ArrowRight':
          setLightboxIndex((prev) =>
            prev < displayImages.length - 1 ? prev + 1 : 0
          );
          break;
      }
    };

    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, images.length]);

  const displayImages = images.length > 0 ? images : [];
  const mainImage = displayImages[activeIndex] || selectedVariantImage;

  // Open lightbox on main image click
  const openLightbox = useCallback((index: number) => {
    if (imageZoom === 'lightbox') {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  }, [imageZoom]);

  // Navigate lightbox
  const goToPrevious = useCallback(() => {
    setLightboxIndex((prev) =>
      prev > 0 ? prev - 1 : displayImages.length - 1
    );
  }, [displayImages.length]);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev < displayImages.length - 1 ? prev + 1 : 0
    );
  }, [displayImages.length]);

  // Build media container classes (matches Mavon: product__media media media--transparent)
  const mediaModifier = getMediaModifier(aspectRatio);
  const mediaClasses = [
    'product__media',
    'media',
    transparent ? 'media--transparent' : '',
    mediaModifier,
  ]
    .filter(Boolean)
    .join(' ');

  // For adaptive aspect ratio, calculate padding from image dimensions
  // Mavon Liquid: padding-bottom: {{ 1 / ratio * 100 }}%
  const getAdaptivePadding = (): string | undefined => {
    if (aspectRatio !== 'adapt' || !mainImage?.width || !mainImage?.height) {
      return undefined;
    }
    const ratio = mainImage.width / mainImage.height;
    return `${(1 / ratio) * 100}%`;
  };

  const adaptivePadding = getAdaptivePadding();

  return (
    <div className={`product-gallery ${className}`.trim()}>
      {/* Main Image - Mavon .media pattern with padding-bottom technique */}
      <div
        className={`product__modal-opener rounded-[2.5rem] ${mediaClasses} ${imageZoom === 'lightbox' ? 'cursor-zoom-in' : ''}`}
        style={adaptivePadding ? {paddingBottom: adaptivePadding} : undefined}
        onClick={() => openLightbox(activeIndex)}
        role={imageZoom === 'lightbox' ? 'button' : undefined}
        tabIndex={imageZoom === 'lightbox' ? 0 : undefined}
        onKeyDown={(e) => {
          if (imageZoom === 'lightbox' && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openLightbox(activeIndex);
          }
        }}
      >
        {/* Zoom Icon */}
        {imageZoom === 'lightbox' && (
          <span className="product__media-icon product__media-icon--lightbox">
            <ZoomIcon />
          </span>
        )}

        {mainImage ? (
          <CustomImage
            src={mainImage.url}
            alt={mainImage.altText || ''}
            width={mainImage.width}
            height={mainImage.height}
            sizes={IMAGE_SIZES.productMain}
            className={`image-magnify-${imageZoom}`}
            loading="eager"
          />
        ) : (
          <div className="media__placeholder">No image available</div>
        )}
      </div>

      {/* Thumbnail Gallery with Slider */}
      {displayImages.length > 1 && (
        <div className="thumbnail-slider mt-4">
          {/* Previous Button */}
          {displayImages.length > thumbnailsPerView && (
            <button
              type="button"
              className="slider-button slider-button--prev"
              onClick={() => {
                if (thumbnailScrollPosition > 0) {
                  setThumbnailScrollPosition(thumbnailScrollPosition - 1);
                }
              }}
              disabled={thumbnailScrollPosition === 0}
              aria-label="Previous thumbnails"
            >
              <SliderArrowLeft />
            </button>
          )}

          {/* Thumbnails Container */}
          <div className="thumbnail-list-wrapper">
            <ul
              className="thumbnail-list"
              style={{
                // Move by one thumbnail width + gap per scroll position
                // Gap is 0.8rem on mobile, 1.2rem on desktop
                gap: isMobile ? '0.8rem' : '1.2rem',
                transform: `translateX(calc(-${thumbnailScrollPosition} * ((100% - ${(thumbnailsPerView - 1) * (isMobile ? 0.8 : 1.2)}rem) / ${thumbnailsPerView} + ${isMobile ? 0.8 : 1.2}rem)))`,
              }}
            >
              {displayImages.map((image, index) => {
                const isActive = activeIndex === index;
                const thumbnailGap = isMobile ? 0.8 : 1.2;
                return (
                  <li
                    key={image.id || index}
                    className="thumbnail-list__item"
                    style={{
                      // Width: (100% - total gaps) / thumbnailsPerView
                      width: `calc((100% - ${(thumbnailsPerView - 1) * thumbnailGap}rem) / ${thumbnailsPerView})`
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className="thumbnail"
                      aria-label={`View image ${index + 1}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <CustomImage
                        src={image.url}
                        alt={image.altText || ''}
                        width={416}
                        height={416}
                        sizes="(min-width: 1200px) 104px, (min-width: 750px) 74px, 54px"
                        srcSetWidths={[54, 74, 104, 162, 208, 324, 416]}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Next Button */}
          {displayImages.length > thumbnailsPerView && (
            <button
              type="button"
              className="slider-button slider-button--next"
              onClick={() => {
                if (thumbnailScrollPosition < displayImages.length - thumbnailsPerView) {
                  setThumbnailScrollPosition(thumbnailScrollPosition + 1);
                }
              }}
              disabled={thumbnailScrollPosition >= displayImages.length - thumbnailsPerView}
              aria-label="Next thumbnails"
            >
              <SliderArrowRight />
            </button>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && displayImages.length > 0 && (
        <ProductMediaModal
          images={displayImages}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onSelectImage={setLightboxIndex}
        />
      )}
    </div>
  );
}

/**
 * Expand/Fullscreen icon matching Mavon's lightbox icon
 */
function ZoomIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="icon icon-zoom"
      fill="none"
      viewBox="0 0 20 20"
      width="20"
      height="20"
    >
      {/* Top-left corner */}
      <polyline
        points="1 7 1 1 7 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Top-right corner */}
      <polyline
        points="13 1 19 1 19 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Bottom-left corner */}
      <polyline
        points="1 13 1 19 7 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Bottom-right corner */}
      <polyline
        points="13 19 19 19 19 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Lightbox modal component for full-size image viewing
 * Matches Mavon's product-media-modal pattern
 */
interface ProductMediaModalProps {
  images: GalleryImage[];
  activeIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelectImage: (index: number) => void;
}

function ProductMediaModal({
  images,
  activeIndex,
  onClose,
  onPrevious,
  onNext,
  onSelectImage,
}: ProductMediaModalProps) {
  const activeImage = images[activeIndex];

  return (
    <div
      className="product-media-modal media-modal fixed inset-0 z-[999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Product image gallery"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="product-media-modal__dialog relative w-full h-full flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          className="product-media-modal__toggle absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          onClick={onClose}
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>

        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          {/* Previous Button */}
          {images.length > 1 && (
            <button
              type="button"
              className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              onClick={onPrevious}
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
          )}

          {/* Image */}
          <div className="relative max-w-full max-h-full">
            {activeImage && (
              <img
                src={activeImage.url}
                alt={activeImage.altText || ''}
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              type="button"
              className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              onClick={onNext}
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 p-4 bg-black/50">
            {images.map((image, index) => (
              <button
                key={image.id || index}
                type="button"
                onClick={() => onSelectImage(index)}
                className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  index === activeIndex
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <img
                  src={image.url}
                  alt={image.altText || ''}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

/**
 * Close icon component
 */
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="24"
      height="24"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Chevron left icon component
 */
function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="24"
      height="24"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/**
 * Chevron right icon component
 */
function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="24"
      height="24"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/**
 * Slider arrow left icon for thumbnail navigation
 */
function SliderArrowLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/**
 * Slider arrow right icon for thumbnail navigation
 */
function SliderArrowRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
