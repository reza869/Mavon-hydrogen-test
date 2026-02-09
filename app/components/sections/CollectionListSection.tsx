import {useState, useEffect, useRef, type CSSProperties} from 'react';
import {Link} from 'react-router';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, Autoplay} from 'swiper/modules';
import type {Swiper as SwiperType} from 'swiper';
import {
  SectionHeader,
  type HeadingSize,
  type HeadingAlignment,
} from '~/components/shared/SectionHeader';
import {
  SliderNavigation,
  type NavigationIconType,
  type ButtonStyle,
  type PaginationType,
} from '~/components/shared/SliderNavigation';
import {
  CollectionCard,
  type CollectionData,
  type ImageRatio,
  type TitleType,
  type TitleSize,
  type IconType,
  type ButtonType as CardButtonType,
} from '~/components/CollectionCard';

export type NavigationPosition = 'top' | 'middle' | 'bottom';
export type ButtonPosition = 'top' | 'bottom';
export type ButtonType = 'primary' | 'secondary';
export type ButtonSize = 'large' | 'medium' | 'small';
export type LayoutType = 'slider' | 'grid';
export type ColorScheme =
  | 'scheme-1'
  | 'scheme-2'
  | 'scheme-3'
  | 'scheme-4'
  | 'scheme-5';

export interface CollectionListSectionProps {
  /** Collections data */
  collections: CollectionData[];

  // Layout settings
  /** Layout type: slider or grid */
  layout?: LayoutType;
  /** Desktop columns (2-6) */
  desktopColumnNum?: number;
  /** Mobile columns (1-2) */
  mobileColumnNum?: number;
  /** Make section full width */
  makeSectionFullwidth?: boolean;

  // Slider settings
  /** Auto-rotate slides */
  autoRotate?: boolean;
  /** Seconds between auto-rotation */
  changesEvery?: string;
  /** Enable infinite loop */
  sliderLoop?: boolean;
  /** Show pagination indicator */
  showPagination?: boolean;
  /** Pagination style */
  paginationType?: PaginationType;
  /** Show navigation arrows */
  showNavigation?: boolean;
  /** Arrow icon style */
  navigationIconType?: NavigationIconType;
  /** Navigation button style */
  buttonStyle?: ButtonStyle;
  /** Navigation position */
  navigationPosition?: NavigationPosition;
  /** Use custom colors for navigation */
  customColorNavigation?: boolean;
  /** Navigation foreground color */
  navigationForegroundColor?: string;
  /** Navigation background color */
  navigationBackgroundColor?: string;
  /** Navigation hover background color */
  navigationHoverBackgroundColor?: string;
  /** Navigation hover text color */
  navigationHoverTextColor?: string;
  /** Button radius (for round style) */
  buttonRadius?: number;

  // Button settings
  /** Show "View All" button */
  showButton?: boolean;
  /** Button text */
  buttonLabel?: string;
  /** Button variant */
  buttonType?: ButtonType;
  /** Button size */
  buttonSize?: ButtonSize;
  /** Button position */
  buttonPosition?: ButtonPosition;

  // Section header settings
  /** Section heading */
  heading?: string;
  /** Heading size */
  headingSize?: HeadingSize;
  /** Subheading text */
  subheading?: string;
  /** Desktop heading alignment */
  desktopHeadingAlignment?: HeadingAlignment;
  /** Mobile heading alignment */
  mobileHeadingAlignment?: HeadingAlignment;

  // Section styling
  /** Desktop top padding (px) */
  desktopPaddingTop?: string;
  /** Desktop bottom padding (px) */
  desktopPaddingBottom?: string;
  /** Mobile top padding (px) */
  mobilePaddingTop?: string;
  /** Mobile bottom padding (px) */
  mobilePaddingBottom?: string;
  /** Color scheme */
  sectionColorScheme?: ColorScheme;

  // Collection Card settings
  /** Image aspect ratio */
  imageRatio?: ImageRatio;
  /** Card corner radius */
  cardCornerRadius?: number;
  /** Show product count */
  showProductCount?: boolean;
  /** Show content below image on desktop */
  showContentBelowImage?: boolean;
  /** Show content below image on mobile */
  showContentBelowImageMobile?: boolean;
  /** Card title type */
  cardTitleType?: TitleType;
  /** Card title size */
  cardTitleSize?: TitleSize;
  /** Use arrow icon on card */
  useArrowIcon?: boolean;
  /** Card arrow icon type */
  cardIconType?: IconType;
  /** Card button type (when titleType is 'button') */
  cardButtonType?: CardButtonType;

  /** Custom className */
  className?: string;
}

/**
 * Get button CSS classes based on type and size
 */
function getButtonClasses(type: ButtonType, size: ButtonSize): string {
  const baseClass = 'button';
  const typeClass = type === 'primary' ? 'button--primary' : 'button--secondary';
  const sizeClass = `button--${size}`;
  return `${baseClass} ${typeClass} ${sizeClass}`;
}

/**
 * Collection List Section Component
 * Displays a list of collections in slider or grid layout
 * Uses Swiper for slider functionality with true infinite loop
 */
export function CollectionListSection({
  collections,
  // Layout
  layout = 'slider',
  desktopColumnNum = 4,
  mobileColumnNum = 2,
  makeSectionFullwidth = false,
  // Slider
  autoRotate = false,
  changesEvery = '5',
  sliderLoop = true,
  showPagination = true,
  paginationType = 'progressbar',
  showNavigation = true,
  navigationIconType = 'long-arrow',
  buttonStyle = 'noborder',
  navigationPosition = 'top',
  customColorNavigation = false,
  navigationForegroundColor = '#121212',
  navigationBackgroundColor = '#ffffff',
  navigationHoverBackgroundColor = '#121212',
  navigationHoverTextColor = '#ffffff',
  buttonRadius = 50,
  // Button
  showButton = true,
  buttonLabel = '',
  buttonType = 'secondary',
  buttonSize = 'medium',
  buttonPosition = 'top',
  // Header
  heading = 'Shop by collection',
  headingSize = 'large',
  subheading,
  desktopHeadingAlignment = 'left',
  mobileHeadingAlignment = 'left',
  // Styling
  desktopPaddingTop = '80',
  desktopPaddingBottom = '80',
  mobilePaddingTop = '50',
  mobilePaddingBottom = '50',
  sectionColorScheme = 'scheme-1',
  // Collection Card
  imageRatio = 'square',
  cardCornerRadius = 10,
  showProductCount = false,
  showContentBelowImage = true,
  showContentBelowImageMobile = true,
  cardTitleType = 'text',
  cardTitleSize = 'medium',
  useArrowIcon = false,
  cardIconType = 'arrow-up-right',
  cardButtonType = 'secondary',
  // Other
  className = '',
}: CollectionListSectionProps) {
  const isSlider = layout === 'slider';
  const collectionsUrl = '/collections';

  // Swiper instance ref for external navigation
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);
  const [itemsPerView, setItemsPerView] = useState(desktopColumnNum);

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 750;
      setItemsPerView(mobile ? mobileColumnNum : desktopColumnNum);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [desktopColumnNum, mobileColumnNum]);

  // Calculate total slide pages
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(collections.length / itemsPerView));
    setTotalSlides(pages);
  }, [collections.length, itemsPerView]);

  // Navigation state - depends on sliderLoop setting
  const canGoPrevious = sliderLoop ? totalSlides > 1 : currentIndex > 0;
  const canGoNext = sliderLoop ? totalSlides > 1 : currentIndex < totalSlides - 1;

  // Navigation functions
  const goToPrevious = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const goToNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const goToSlide = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  // Handle Swiper slide change
  const handleSlideChange = (swiper: SwiperType) => {
    // For loop mode, use realIndex
    setCurrentIndex(swiper.realIndex);
  };

  // Determine navigation and button positions
  const showNavInHeader =
    isSlider && showNavigation && navigationPosition === 'top';
  const showButtonInHeader = showButton && buttonLabel && buttonPosition === 'top';
  const showNavInMiddle =
    isSlider && showNavigation && navigationPosition === 'middle';
  const showButtonAtBottom =
    showButton && buttonLabel && buttonPosition === 'bottom';

  // Pagination logic based on type and navigation position
  const isProgressBar = paginationType === 'progressbar';
  const isBulletsOrCounter = paginationType === 'bullets' || paginationType === 'counter';

  // Progress bar: ALWAYS at bottom
  const showProgressBarAtBottom = isSlider && showPagination && isProgressBar;
  // Progress bar with arrows when navigationPosition is bottom
  const showProgressBarWithArrows = showProgressBarAtBottom && navigationPosition === 'bottom';
  // Progress bar alone (no arrows) when navigation is at top or middle
  const showProgressBarOnly = showProgressBarAtBottom && navigationPosition !== 'bottom';

  // Bullets/Counter:
  // - top → with navigation in header (showPaginationInHeader)
  // - middle → alone at bottom center (showBulletsCounterAloneAtBottom)
  // - bottom → with arrows at bottom (showBulletsCounterWithArrowsAtBottom)
  const showPaginationInHeader = showPagination && isBulletsOrCounter && navigationPosition === 'top';
  const showBulletsCounterAloneAtBottom = isSlider && showPagination && isBulletsOrCounter && navigationPosition === 'middle';
  const showBulletsCounterWithArrowsAtBottom = isSlider && showPagination && isBulletsOrCounter && navigationPosition === 'bottom';

  // Section container style
  const sectionStyle: CSSProperties = {
    '--section-padding-top-desktop': desktopPaddingTop,
    '--section-padding-bottom-desktop': desktopPaddingBottom,
    '--section-padding-top-mobile': mobilePaddingTop,
    '--section-padding-bottom-mobile': mobilePaddingBottom,
  } as CSSProperties;

  // Grid style for non-slider mode
  const gridStyle: CSSProperties = {
    '--desktop-cols': desktopColumnNum,
    '--mobile-cols': mobileColumnNum,
  } as CSSProperties;

  // Render collection card
  const renderCollection = (collection: CollectionData, index: number) => (
    <CollectionCard
      key={collection.id}
      collection={collection}
      imageRatio={imageRatio}
      cornerRadius={cardCornerRadius}
      showProductCount={showProductCount}
      showContentBelowImage={showContentBelowImage}
      showContentBelowImageMobile={showContentBelowImageMobile}
      titleType={cardTitleType}
      titleSize={cardTitleSize}
      useArrowIcon={useArrowIcon}
      iconType={cardIconType}
      buttonType={cardButtonType}
      loading={index < desktopColumnNum ? 'eager' : 'lazy'}
    />
  );

  // Header actions content
  const headerActions = (
    <>
      {showButtonInHeader && (
        <Link
          to={collectionsUrl}
          className={getButtonClasses(buttonType, buttonSize)}
        >
          {buttonLabel}
        </Link>
      )}
      {showNavInHeader && (
        <SliderNavigation
          onPrevious={goToPrevious}
          onNext={goToNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          navigationIconType={navigationIconType}
          buttonStyle={buttonStyle}
          buttonRadius={buttonRadius}
          showPagination={showPaginationInHeader}
          paginationType={paginationType}
          currentIndex={currentIndex}
          totalSlides={totalSlides}
          onGoToSlide={goToSlide}
          customColorNavigation={customColorNavigation}
          navigationForegroundColor={navigationForegroundColor}
          navigationBackgroundColor={navigationBackgroundColor}
          navigationHoverBackgroundColor={navigationHoverBackgroundColor}
          navigationHoverTextColor={navigationHoverTextColor}
          className="slider-nav--top"
        />
      )}
    </>
  );

  // Swiper breakpoints configuration
  const swiperBreakpoints = {
    0: {
      slidesPerView: mobileColumnNum,
      slidesPerGroup: mobileColumnNum,
      spaceBetween: 15,
    },
    750: {
      slidesPerView: desktopColumnNum,
      slidesPerGroup: desktopColumnNum,
      spaceBetween: 20,
    },
  };

  return (
    <section
      className={`section collection-list-section ${sectionColorScheme} ${makeSectionFullwidth ? 'container-fluid' : 'container'} ${className}`}
      style={sectionStyle}
    >
      {/* Section Header */}
      {heading && (
        <SectionHeader
          heading={heading}
          headingSize={headingSize}
          subheading={subheading}
          desktopHeadingAlignment={desktopHeadingAlignment}
          mobileHeadingAlignment={mobileHeadingAlignment}
          actions={(showButtonInHeader || showNavInHeader) ? headerActions : undefined}
        />
      )}

      {/* Collection Content */}
      <div className="collection-list-section__content">
        {isSlider ? (
          /* Slider Mode with Swiper */
          <div className="collection-slider-wrapper" style={{position: 'relative'}}>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={handleSlideChange}
              loop={sliderLoop && collections.length > itemsPerView}
              autoplay={
                autoRotate
                  ? {
                      delay: parseInt(changesEvery, 10) * 1000,
                      disableOnInteraction: false,
                    }
                  : false
              }
              breakpoints={swiperBreakpoints}
              grabCursor={true}
              watchSlidesProgress={true}
              className="collection-swiper"
            >
              {collections.map((collection, index) => (
                <SwiperSlide key={collection.id}>
                  {renderCollection(collection, index)}
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Middle Navigation */}
            {showNavInMiddle && (
              <div
                className="slider-nav--middle"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 1rem',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                <button
                  type="button"
                  className={`slider-arrow slider-arrow--prev slider-arrow--${buttonStyle}`}
                  onClick={goToPrevious}
                  disabled={!canGoPrevious}
                  aria-label="Previous slide"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '4.4rem',
                    height: '4.4rem',
                    border:
                      buttonStyle === 'noborder'
                        ? 'none'
                        : '1px solid rgba(var(--color-foreground), 0.2)',
                    background:
                      buttonStyle === 'noborder'
                        ? 'transparent'
                        : 'rgb(var(--color-background))',
                    borderRadius:
                      buttonStyle === 'round'
                        ? '50%'
                        : '0',
                    cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                    opacity: canGoPrevious ? 1 : 0.3,
                    color: 'rgb(var(--color-foreground))',
                    pointerEvents: 'auto',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`slider-arrow slider-arrow--next slider-arrow--${buttonStyle}`}
                  onClick={goToNext}
                  disabled={!canGoNext}
                  aria-label="Next slide"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '4.4rem',
                    height: '4.4rem',
                    border:
                      buttonStyle === 'noborder'
                        ? 'none'
                        : '1px solid rgba(var(--color-foreground), 0.2)',
                    background:
                      buttonStyle === 'noborder'
                        ? 'transparent'
                        : 'rgb(var(--color-background))',
                    borderRadius:
                      buttonStyle === 'round'
                        ? '50%'
                        : '0',
                    cursor: canGoNext ? 'pointer' : 'not-allowed',
                    opacity: canGoNext ? 1 : 0.3,
                    color: 'rgb(var(--color-foreground))',
                    pointerEvents: 'auto',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Grid Mode */
          <div
            className="collection-list-grid"
            style={gridStyle}
          >
            {collections.map((collection, index) => renderCollection(collection, index))}
          </div>
        )}

        {/* Bottom Navigation with Bullets/Counter (when navigationPosition is bottom and NOT progressbar) */}
        {showBulletsCounterWithArrowsAtBottom && (
          <div className="slider-pagination-bottom">
            <SliderNavigation
              onPrevious={goToPrevious}
              onNext={goToNext}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              navigationIconType={navigationIconType}
              buttonStyle={buttonStyle}
              buttonRadius={buttonRadius}
              showPagination={true}
              paginationType={paginationType}
              currentIndex={currentIndex}
              totalSlides={totalSlides}
              onGoToSlide={goToSlide}
              customColorNavigation={customColorNavigation}
              navigationForegroundColor={navigationForegroundColor}
              navigationBackgroundColor={navigationBackgroundColor}
              navigationHoverBackgroundColor={navigationHoverBackgroundColor}
              navigationHoverTextColor={navigationHoverTextColor}
            />
          </div>
        )}

        {/* Bullets/Counter alone at bottom (when navigationPosition is middle) */}
        {showBulletsCounterAloneAtBottom && (
          <div className="slider-pagination-bottom slider-pagination-bottom--center">
            {paginationType === 'counter' && (
              <span className="slider-pagination slider-pagination--counter">
                {currentIndex + 1} / {totalSlides}
              </span>
            )}
            {paginationType === 'bullets' && (
              <div className="slider-pagination slider-pagination--bullets">
                {Array.from({length: totalSlides}).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`slider-bullet ${index === currentIndex ? 'slider-bullet--active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress Bar Only - when navigation is at top or middle */}
        {showProgressBarOnly && (
          <div className="slider-pagination-bottom slider-pagination-bottom--no-arrows">
            <div
              className="slider-pagination slider-pagination--progressbar"
              style={{
                width: '100%',
                height: '0.2rem',
                background: 'rgba(var(--color-foreground), 0.1)',
                borderRadius: '0.15rem',
                overflow: 'hidden',
              }}
            >
              <div
                className="slider-progressbar__fill"
                style={{
                  height: '100%',
                  width: `${((currentIndex + 1) / totalSlides) * 100}%`,
                  background: 'rgb(var(--color-foreground))',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Progress Bar with Arrows - when navigation position is bottom */}
        {showProgressBarWithArrows && (
          <div className="slider-pagination-bottom">
            <button
              type="button"
              className={`slider-arrow slider-arrow--prev slider-arrow--${buttonStyle}`}
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              aria-label="Previous slide"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4.4rem',
                height: '4.4rem',
                border: buttonStyle === 'noborder' ? 'none' : '1px solid rgba(var(--color-foreground), 0.2)',
                background: buttonStyle === 'noborder' ? 'transparent' : 'rgb(var(--color-background))',
                borderRadius: buttonStyle === 'round' ? '50%' : '0',
                cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                opacity: canGoPrevious ? 1 : 0.3,
                color: 'rgb(var(--color-foreground))',
                padding: 0,
              }}
            >
              <svg
                width="41"
                height="8"
                viewBox="0 0 41 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.646447 4.35355C0.451184 4.15829 0.451184 3.84171 0.646447 3.64645L3.82843 0.464466C4.02369 0.269204 4.34027 0.269204 4.53553 0.464466C4.7308 0.659728 4.7308 0.976311 4.53553 1.17157L1.70711 4L4.53553 6.82843C4.7308 7.02369 4.7308 7.34027 4.53553 7.53553C4.34027 7.7308 4.02369 7.7308 3.82843 7.53553L0.646447 4.35355ZM41 4V4.5H1V4V3.5H41V4Z"
                  fill="currentColor"
                  fillOpacity="1"
                />
              </svg>
            </button>
            <div
              className="slider-pagination slider-pagination--progressbar"
              style={{
                flex: 1,
                height: '0.2rem',
                background: 'rgba(var(--color-foreground), 0.1)',
                borderRadius: '0.15rem',
                overflow: 'hidden',
              }}
            >
              <div
                className="slider-progressbar__fill"
                style={{
                  height: '100%',
                  width: `${((currentIndex + 1) / totalSlides) * 100}%`,
                  background: 'rgb(var(--color-foreground))',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <button
              type="button"
              className={`slider-arrow slider-arrow--next slider-arrow--${buttonStyle}`}
              onClick={goToNext}
              disabled={!canGoNext}
              aria-label="Next slide"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4.4rem',
                height: '4.4rem',
                border: buttonStyle === 'noborder' ? 'none' : '1px solid rgba(var(--color-foreground), 0.2)',
                background: buttonStyle === 'noborder' ? 'transparent' : 'rgb(var(--color-background))',
                borderRadius: buttonStyle === 'round' ? '50%' : '0',
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                opacity: canGoNext ? 1 : 0.3,
                color: 'rgb(var(--color-foreground))',
                padding: 0,
              }}
            >
              <svg
                width="41"
                height="8"
                viewBox="0 0 41 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40.3536 4.35355C40.5488 4.15829 40.5488 3.84171 40.3536 3.64645L37.1716 0.464466C36.9763 0.269204 36.6597 0.269204 36.4645 0.464466C36.2692 0.659728 36.2692 0.976311 36.4645 1.17157L39.2929 4L36.4645 6.82843C36.2692 7.02369 36.2692 7.34027 36.4645 7.53553C36.6597 7.7308 36.9763 7.7308 37.1716 7.53553L40.3536 4.35355ZM0 4V4.5H40V4V3.5H0V4Z"
                  fill="currentColor"
                  fillOpacity="1"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      {showButtonAtBottom && (
        <div className="collection-list-section__button--bottom">
          <Link
            to={collectionsUrl}
            className={getButtonClasses(buttonType, buttonSize)}
          >
            {buttonLabel}
          </Link>
        </div>
      )}
    </section>
  );
}
