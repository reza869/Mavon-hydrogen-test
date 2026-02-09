import {type CSSProperties} from 'react';
import {Link} from 'react-router';

// Types
export type HeadingSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
export type HeadingLineHeight = 'normal' | 'medium' | 'high';
export type ContentPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
export type ContentAlignment = 'left' | 'center' | 'right';
export type ButtonType = 'primary' | 'secondary';
export type ButtonSize = 'large' | 'medium' | 'small';
export type ColorScheme =
  | 'color-scheme-1'
  | 'color-scheme-2'
  | 'color-scheme-3'
  | 'color-scheme-4'
  | 'color-scheme-5';

export interface SingleSlideshowProps {
  // Desktop Image
  desktopImage: string;

  // Heading
  heading?: string;
  headingSize?: HeadingSize;
  headingLineHeight?: HeadingLineHeight;

  // Subheading
  subheading?: string;

  // Overlay
  imageOverlayOpacity?: number;

  // Desktop Content Position
  desktopContentPosition?: ContentPosition;
  contentAlignment?: ContentAlignment;

  // Full Slide Link
  enableFullSlideLink?: boolean;
  fullSlideLink?: string;

  // Button One
  buttonOneLabel?: string;
  buttonOneLink?: string;
  buttonOneType?: ButtonType;
  buttonOneSize?: ButtonSize;

  // Button Two
  buttonTwoLabel?: string;
  buttonTwoLink?: string;
  buttonTwoType?: ButtonType;
  buttonTwoSize?: ButtonSize;

  // Colors (heading, subheading, buttons - uses scheme foreground/background)
  colorScheme?: ColorScheme;

  // Mobile Settings
  mobileImage?: string;
  mobileContentAlignment?: ContentAlignment;
  enableColorSchemeOnMobile?: boolean;
  mobileColorScheme?: ColorScheme;

  // Internal props (passed from parent)
  showContentBelowImageOnMobile?: boolean;
  loading?: 'eager' | 'lazy';
}

// Heading size to CSS class mapping
const HEADING_SIZE_MAP: Record<HeadingSize, string> = {
  'extra-small': 'h4',
  small: 'h3',
  medium: 'h2',
  large: 'h1',
  'extra-large': 'h0',
};

// Get position class for content wrapper
function getPositionClass(position: ContentPosition): string {
  const [vertical, horizontal] = position.split('-') as [string, string];

  // Map to original theme classes
  const justifyClass =
    vertical === 'top'
      ? 'justify-content-start'
      : vertical === 'bottom'
        ? 'justify-content-end'
        : 'justify-content-center';

  const alignClass =
    horizontal === 'left'
      ? 'align-items-start'
      : horizontal === 'right'
        ? 'align-items-end'
        : 'align-items-center';

  const posClass = `${horizontal}--position`;

  return `${justifyClass} ${alignClass} ${posClass}`;
}

// Get button CSS classes
function getButtonClasses(type: ButtonType, size: ButtonSize): string {
  return `button button--${type} button--${size}`;
}

/**
 * SingleSlideshow Component
 * Individual slide for the slideshow section
 * Follows original Mavon Liquid theme structure
 */
export function SingleSlideshow({
  desktopImage,
  heading,
  headingSize = 'large',
  headingLineHeight = 'normal',
  subheading,
  imageOverlayOpacity = 0,
  desktopContentPosition = 'middle-left',
  contentAlignment = 'left',
  enableFullSlideLink = false,
  fullSlideLink = '/',
  buttonOneLabel,
  buttonOneLink = '/',
  buttonOneType = 'primary',
  buttonOneSize = 'medium',
  buttonTwoLabel,
  buttonTwoLink = '/',
  buttonTwoType = 'secondary',
  buttonTwoSize = 'medium',
  colorScheme,
  mobileImage,
  mobileContentAlignment = 'center',
  enableColorSchemeOnMobile = false,
  mobileColorScheme = 'color-scheme-1',
  showContentBelowImageOnMobile = false,
  loading = 'lazy',
}: SingleSlideshowProps) {
  const headingClass = HEADING_SIZE_MAP[headingSize];
  const hasButtons = buttonOneLabel || buttonTwoLabel;
  const positionClass = getPositionClass(desktopContentPosition);

  // Image container style with overlay opacity
  const imageContainerStyle: CSSProperties = {
    '--overlay-opacity': imageOverlayOpacity / 100,
  } as CSSProperties;

  // Color scheme class (for heading, subheading, buttons)
  const colorSchemeClass = colorScheme || '';

  // Mobile color scheme class
  const mobileColorClass = enableColorSchemeOnMobile ? mobileColorScheme : '';

  // Content visibility classes for mobile
  const desktopContentClass = showContentBelowImageOnMobile
    ? 'd-sm-none'
    : '';
  const mobileContentClass = showContentBelowImageOnMobile
    ? 'd-sm-only-visible'
    : 'd-sm-none';

  // Render content box (used for both desktop and mobile)
  const renderContentBox = (isMobile: boolean = false) => {
    const visibilityClass = isMobile ? mobileContentClass : desktopContentClass;
    const alignmentClass = isMobile
      ? `slider--alignment__mobile--${mobileContentAlignment}`
      : `slider--alignment__desktop--${contentAlignment}`;
    const schemeClass = isMobile && enableColorSchemeOnMobile
      ? mobileColorClass
      : colorSchemeClass;

    return (
      <div
        className={`slideshow__text banner__box ${schemeClass} media--transparent ${visibilityClass} ${alignmentClass}`}
      >
        {heading && (
          <h2
            className={`banner__heading ${headingClass} line--${headingLineHeight} mb-0`}
          >
            {heading.split('\n').map((line, index) => (
              <span key={index}>{line}</span>
            ))}
          </h2>
        )}

        {subheading && (
          <div
            className="banner__text"
            dangerouslySetInnerHTML={{__html: subheading}}
          />
        )}

        {hasButtons && (
          <div className="banner__buttons slideshow--banner-button">
            {buttonOneLabel && (
              <Link
                to={buttonOneLink}
                className={getButtonClasses(buttonOneType, buttonOneSize)}
              >
                {buttonOneLabel}
              </Link>
            )}
            {buttonTwoLabel && (
              <Link
                to={buttonTwoLink}
                className={getButtonClasses(buttonTwoType, buttonTwoSize)}
              >
                {buttonTwoLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    );
  };

  // Slide content
  const slideContent = (
    <>
      {/* Image Container - Single container with desktop/mobile images */}
      <div className="slideshow__media" style={imageContainerStyle}>
        {/* Desktop Image */}
        <img
          src={desktopImage}
          alt={heading || 'Slideshow image'}
          className="slideshow__image slideshow__image--desktop"
          loading={loading}
          fetchPriority={loading === 'eager' ? 'high' : undefined}
        />
        {/* Mobile Image */}
        <img
          src={mobileImage || desktopImage}
          alt={heading || 'Slideshow image'}
          className="slideshow__image slideshow__image--mobile"
          loading={loading}
        />
      </div>

      {/* Content Wrapper - Following original structure */}
      <div
        className={`slideshow__text-wrapper ${positionClass} slider--alignment__desktop--${contentAlignment} slider--alignment__mobile--${mobileContentAlignment}`}
      >
        {/* Desktop Content */}
        {renderContentBox(false)}

        {/* Mobile Content (only when content below image is enabled) */}
        {showContentBelowImageOnMobile && renderContentBox(true)}
      </div>
    </>
  );

  return (
    <div className={`slideshow-slide ${showContentBelowImageOnMobile ? 'slideshow-slide--content-below' : ''}`}>
      {enableFullSlideLink ? (
        <Link to={fullSlideLink} className="slideshow-slide__link">
          {slideContent}
        </Link>
      ) : (
        slideContent
      )}
    </div>
  );
}
