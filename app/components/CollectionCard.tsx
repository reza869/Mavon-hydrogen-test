import {Link} from 'react-router';
import type {CSSProperties} from 'react';

export type ImageRatio = 'adapt' | 'portrait' | 'square' | 'landscape' | 'circle';
export type TitleType = 'text' | 'button';
export type TitleSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
export type IconType = 'arrow-up-right' | 'arrow-right';
export type ButtonType = 'primary' | 'secondary';

export interface CollectionData {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: {
    id?: string;
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  } | null;
  products?: {
    nodes: {id: string}[];
  };
}

export interface CollectionCardProps {
  /** Collection data */
  collection: CollectionData;
  /** Image aspect ratio */
  imageRatio?: ImageRatio;
  /** Corner radius in pixels */
  cornerRadius?: number;
  /** Show product count */
  showProductCount?: boolean;
  /** Show content below image on desktop */
  showContentBelowImage?: boolean;
  /** Show content below image on mobile */
  showContentBelowImageMobile?: boolean;
  /** Title display type */
  titleType?: TitleType;
  /** Title font size */
  titleSize?: TitleSize;
  /** Show arrow icon */
  useArrowIcon?: boolean;
  /** Arrow icon type */
  iconType?: IconType;
  /** Button type (only when titleType is 'button') */
  buttonType?: ButtonType;
  /** Image loading priority */
  loading?: 'lazy' | 'eager';
  /** Custom className */
  className?: string;
}

/**
 * Get aspect ratio CSS value
 */
function getAspectRatio(ratio: ImageRatio, imageWidth?: number, imageHeight?: number): string {
  switch (ratio) {
    case 'adapt':
      return imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : '1 / 1';
    case 'portrait':
      return '3 / 4';
    case 'square':
      return '1 / 1';
    case 'landscape':
      return '4 / 3';
    case 'circle':
      return '1 / 1';
    default:
      return '1 / 1';
  }
}

/**
 * Get font size for title
 */
function getTitleFontSize(size: TitleSize): string {
  switch (size) {
    case 'extra-small':
      return '1.2rem';
    case 'small':
      return '1.4rem';
    case 'medium':
      return '1.6rem';
    case 'large':
      return '1.8rem';
    case 'extra-large':
      return '2.2rem';
    default:
      return '1.6rem';
  }
}

/**
 * Arrow Up Right Icon
 */
function ArrowUpRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="12" x2="12" y2="4" />
      <polyline points="6 4 12 4 12 10" />
    </svg>
  );
}

/**
 * Arrow Right Icon
 */
function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="8" x2="13" y2="8" />
      <polyline points="9 4 13 8 9 12" />
    </svg>
  );
}

/**
 * Placeholder image for collections without images
 */
function PlaceholderImage() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{width: '100%', height: '100%'}}
    >
      <rect width="100" height="100" fill="rgba(var(--color-foreground), 0.05)" />
      <path
        d="M35 65L45 50L52 60L60 48L65 55"
        stroke="rgba(var(--color-foreground), 0.2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="40" r="5" fill="rgba(var(--color-foreground), 0.15)" />
    </svg>
  );
}

/**
 * Collection Card Component
 * Displays a collection with image, title, and optional product count
 */
export function CollectionCard({
  collection,
  imageRatio = 'square',
  cornerRadius = 10,
  showProductCount = false,
  showContentBelowImage = true,
  showContentBelowImageMobile = true,
  titleType = 'text',
  titleSize = 'medium',
  useArrowIcon = false,
  iconType = 'arrow-up-right',
  buttonType = 'secondary',
  loading = 'lazy',
  className = '',
}: CollectionCardProps) {
  const collectionUrl = `/collections/${collection.handle}`;
  const productCount = collection.products?.nodes?.length || 0;
  const hasImage = !!collection.image?.url;
  const isCircle = imageRatio === 'circle';

  // Container styles
  const containerStyle: CSSProperties = {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
  };

  // Image container styles
  const imageContainerStyle: CSSProperties = {
    position: 'relative',
    aspectRatio: getAspectRatio(imageRatio, collection.image?.width, collection.image?.height),
    borderRadius: isCircle ? '50%' : `${cornerRadius}px`,
    overflow: 'hidden',
    backgroundColor: 'rgba(var(--color-foreground), 0.05)',
  };

  // Image styles
  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  };

  // Overlay styles (for content on image)
  const overlayStyle: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '1.5rem',
    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  };

  // Content below image styles
  const contentBelowStyle: CSSProperties = {
    marginTop: '2.5rem',
    textAlign: 'center',
  };

  // Title text styles
  const titleTextStyle: CSSProperties = {
    fontSize: getTitleFontSize(titleSize),
    fontWeight: 600,
    margin: 0,
    color: 'rgb(var(--color-foreground))',
  };

  // Title on image styles
  const titleOnImageStyle: CSSProperties = {
    fontSize: getTitleFontSize(titleSize),
    fontWeight: 600,
    margin: 0,
    color: '#fff',
  };

  // Product count styles
  const countStyle: CSSProperties = {
    fontSize: '1.3rem',
    color: 'rgba(var(--color-foreground), 0.6)',
    marginTop: '0.3rem',
  };

  // Product count on image styles
  const countOnImageStyle: CSSProperties = {
    fontSize: '1.3rem',
    color: 'rgba(255,255,255,0.8)',
    marginTop: '0.3rem',
  };

  // Button title styles
  const buttonBaseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: getTitleFontSize(titleSize),
    fontWeight: 500,
    padding: '0.8rem 1.6rem',
    borderRadius: '50px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const primaryButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: 'rgb(var(--color-foreground))',
    color: 'rgb(var(--color-background))',
    border: 'none',
  };

  const secondaryButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: 'transparent',
    color: 'rgb(var(--color-foreground))',
    border: '1px solid rgba(var(--color-foreground), 0.2)',
  };

  // Determine if content should show on image or below
  const showOnImage = !showContentBelowImage;

  // Render icon
  const renderIcon = () => {
    if (!useArrowIcon) return null;
    return iconType === 'arrow-up-right' ? <ArrowUpRightIcon /> : <ArrowRightIcon />;
  };

  // Render title content
  const renderTitleContent = (onImage: boolean) => {
    const title = collection.title;
    const style = onImage ? titleOnImageStyle : titleTextStyle;
    const cStyle = onImage ? countOnImageStyle : countStyle;

    if (titleType === 'button') {
      const bStyle = buttonType === 'primary' ? primaryButtonStyle : secondaryButtonStyle;
      return (
        <span style={bStyle}>
          {title}
          {renderIcon()}
        </span>
      );
    }

    return (
      <>
        <h3 style={style}>
          {title}
          {useArrowIcon && titleType === 'text' && (
            <span style={{marginLeft: '0.5rem', display: 'inline-flex', verticalAlign: 'middle'}}>
              {renderIcon()}
            </span>
          )}
        </h3>
        {showProductCount && (
          <p style={cStyle}>({productCount} Items)</p>
        )}
      </>
    );
  };

  return (
    <Link
      to={collectionUrl}
      className={`collection-card ${className}`}
      style={containerStyle}
      prefetch="intent"
    >
      <div className="collection-card__image-container" style={imageContainerStyle}>
        {hasImage ? (
          <img
            src={collection.image!.url}
            alt={collection.image!.altText || collection.title}
            width={collection.image!.width}
            height={collection.image!.height}
            loading={loading}
            style={imageStyle}
            className="collection-card__image"
          />
        ) : (
          <PlaceholderImage />
        )}

        {/* Content on image (desktop) */}
        {showOnImage && (
          <div
            className="collection-card__overlay collection-card__overlay--desktop"
            style={overlayStyle}
          >
            {renderTitleContent(true)}
          </div>
        )}

        {/* Content on image (mobile) - only if mobile setting is different */}
        {!showContentBelowImageMobile && showContentBelowImage && (
          <div
            className="collection-card__overlay collection-card__overlay--mobile"
            style={{...overlayStyle, display: 'none'}}
          >
            {renderTitleContent(true)}
          </div>
        )}
      </div>

      {/* Content below image */}
      {showContentBelowImage && (
        <div
          className="collection-card__content collection-card__content--desktop"
          style={contentBelowStyle}
        >
          {renderTitleContent(false)}
        </div>
      )}

      {/* Content below image (mobile) - only if mobile setting is different */}
      {showContentBelowImageMobile && !showContentBelowImage && (
        <div
          className="collection-card__content collection-card__content--mobile"
          style={{...contentBelowStyle, display: 'none'}}
        >
          {renderTitleContent(false)}
        </div>
      )}
    </Link>
  );
}
