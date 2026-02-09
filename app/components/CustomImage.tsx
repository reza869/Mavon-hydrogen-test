import type {CSSProperties} from 'react';

interface CustomImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Original image width */
  width?: number;
  /** Original image height */
  height?: number;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Loading strategy */
  loading?: 'eager' | 'lazy';
  /** Decoding hint */
  decoding?: 'sync' | 'async' | 'auto';
  /** Fetch priority */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Custom srcset widths (defaults to Mavon's standard widths) */
  srcSetWidths?: readonly number[] | number[];
  /** Whether to generate srcset automatically */
  generateSrcSet?: boolean;
  /** Custom srcset string (overrides auto-generation) */
  srcSet?: string;
  /** Aspect ratio for intrinsic sizing (e.g., "16/9", "1/1") */
  aspectRatio?: string;
  /** Object fit behavior */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Object position */
  objectPosition?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

/** Default Mavon srcset widths matching Liquid theme output */
const DEFAULT_SRCSET_WIDTHS = [246, 493, 600, 713, 823, 990, 1100, 1206, 1346, 1426, 1646, 1946];

/** Default sizes attribute for product images */
const DEFAULT_SIZES =
  '(min-width: 1200px) 605px, (min-width: 990px) calc(55.0vw - 10rem), (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw / 1 - 4rem)';

/**
 * Generate srcset string from URL and width array
 * Uses width descriptors (w) for optimal browser selection
 */
function generateSrcSetFromUrl(baseUrl: string, widths: number[]): string {
  return widths
    .map((w) => {
      try {
        const url = new URL(baseUrl);
        url.searchParams.set('width', String(w));
        return `${url.toString()} ${w}w`;
      } catch {
        // If URL parsing fails, append width parameter manually
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}width=${w} ${w}w`;
      }
    })
    .join(', ');
}

/**
 * CustomImage - Reusable image component matching Mavon Liquid theme behavior
 *
 * Features:
 * - Automatic srcset generation with width descriptors
 * - Configurable responsive sizes
 * - Shopify CDN compatible
 * - No cropping (width-only transforms)
 * - Full control over all image attributes
 *
 * @example
 * // Basic usage
 * <CustomImage src={product.image.url} alt={product.title} />
 *
 * @example
 * // With custom sizes for collection grid
 * <CustomImage
 *   src={image.url}
 *   alt={image.altText}
 *   sizes="(min-width: 992px) 25vw, (min-width: 750px) 33vw, 50vw"
 * />
 *
 * @example
 * // Thumbnail with smaller srcset
 * <CustomImage
 *   src={image.url}
 *   srcSetWidths={[80, 160, 240]}
 *   sizes="80px"
 *   loading="lazy"
 * />
 */
export function CustomImage({
  src,
  alt = '',
  width,
  height,
  sizes = DEFAULT_SIZES,
  className = '',
  style,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  srcSetWidths = DEFAULT_SRCSET_WIDTHS,
  generateSrcSet: shouldGenerateSrcSet = true,
  srcSet,
  aspectRatio,
  objectFit,
  objectPosition,
  onLoad,
  onError,
}: CustomImageProps) {
  // Generate srcset if not provided and generation is enabled
  const computedSrcSet = srcSet ?? (shouldGenerateSrcSet ? generateSrcSetFromUrl(src, srcSetWidths) : undefined);

  // Build inline styles
  const computedStyle: CSSProperties = {
    ...style,
    ...(aspectRatio && {aspectRatio}),
    ...(objectFit && {objectFit}),
    ...(objectPosition && {objectPosition}),
  };

  // Build props object, using lowercase fetchpriority for DOM compatibility
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> & {fetchpriority?: string} = {
    src,
    alt,
    width,
    height,
    sizes,
    srcSet: computedSrcSet,
    className: className || undefined,
    style: Object.keys(computedStyle).length > 0 ? computedStyle : undefined,
    loading,
    decoding,
    onLoad,
    onError,
  };

  // Add fetchpriority as lowercase to avoid React warning
  if (fetchPriority) {
    imgProps.fetchpriority = fetchPriority;
  }

  return <img {...imgProps} />;
}

/**
 * Pre-configured image sizes for common use cases
 */
export const IMAGE_SIZES = {
  /** Product page main image */
  productMain:
    '(min-width: 1200px) 605px, (min-width: 990px) calc(55.0vw - 10rem), (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw / 1 - 4rem)',
  /** Product card in grid */
  productCard:
    '(min-width: 1200px) calc((100vw - 10rem) / 4), (min-width: 990px) calc((100vw - 10rem) / 3), (min-width: 750px) calc((100vw - 10rem) / 2), calc(100vw - 3rem)',
  /** Collection banner */
  collectionBanner: '100vw',
  /** Thumbnail */
  thumbnail: '80px',
  /** Cart line item */
  cartItem: '150px',
  /** Hero/Slideshow */
  hero: '100vw',
} as const;

/**
 * Pre-configured srcset widths for common use cases
 */
export const SRCSET_WIDTHS = {
  productMain: {
    default: [246, 493, 600, 713, 823, 990, 1100, 1206, 1346, 1426, 1646, 1946],
    thumbnail: [80, 160, 240, 320],
    productCard: [200, 400, 600, 800, 1000],
  },
  /** Full range for large images */
  full: [246, 493, 600, 713, 823, 990, 1100, 1206, 1346, 1426, 1646, 1946],
  /** Medium range for cards */
  medium: [200, 400, 600, 800, 1000],
  /** Small range for thumbnails */
  small: [80, 160, 240, 320],
  /** Hero/banner images */
  hero: [600, 900, 1200, 1600, 2000, 2400],
} as const;
