import {useState, useRef, type CSSProperties} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, Autoplay} from 'swiper/modules';
import type {Swiper as SwiperType} from 'swiper';
import {
  SingleSlideshow,
  type SingleSlideshowProps,
  type ColorScheme,
} from './SingleSlideshow';

// Types
export type SlideHeight = 'adapt' | 'small' | 'medium' | 'large';
export type NavigationStyle = 'split-controls' | 'inline-controls';
export type NavigationIconType = 'long-arrow' | 'small-arrow' | 'chevron';
export type NavigationContainer = 'fixed-container' | 'fullwidth';

export interface SectionSlideshowProps {
  slides: SingleSlideshowProps[];

  // Height
  slideHeight?: SlideHeight;

  // Autoplay
  autoRotateSlides?: boolean;
  changeSlides?: number;

  // Navigation
  navigationStyle?: NavigationStyle;
  navigationIconType?: NavigationIconType;
  navigationContainerDesktop?: NavigationContainer;

  // Mobile
  showContentBelowImageOnMobile?: boolean;

  // Padding
  desktopPaddingTop?: string;
  desktopPaddingBottom?: string;
  mobilePaddingTop?: string;
  mobilePaddingBottom?: string;

  // Navigation Colors
  navigationButtonColorScheme?: ColorScheme;
  enableNavigationColorsOnMobile?: boolean;

  // Pagination Custom Colors
  customColorPagination?: boolean;
  paginationColorDesktop?: string;
  paginationColorMobile?: string;

  className?: string;
}

// Arrow Icons
function LongArrowLeft() {
  return (
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
  );
}

function LongArrowRight() {
  return (
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
  );
}

function SmallArrowLeft() {
  return (
    <svg
      width="24"
      height="14"
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 1L1 7L7 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 7H23"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmallArrowRight() {
  return (
    <svg
      width="24"
      height="14"
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 1L23 7L17 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 7H1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
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
  );
}

function ChevronRight() {
  return (
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
  );
}

// Get arrow icons based on type
function getArrowIcons(type: NavigationIconType) {
  switch (type) {
    case 'long-arrow':
      return {Left: LongArrowLeft, Right: LongArrowRight};
    case 'small-arrow':
      return {Left: SmallArrowLeft, Right: SmallArrowRight};
    case 'chevron':
      return {Left: ChevronLeft, Right: ChevronRight};
    default:
      return {Left: LongArrowLeft, Right: LongArrowRight};
  }
}

/**
 * SectionSlideshow Component
 * Hero slideshow section with Swiper integration
 */
export function SectionSlideshow({
  slides,
  slideHeight = 'medium',
  autoRotateSlides = false,
  changeSlides = 5,
  navigationStyle = 'split-controls',
  navigationIconType = 'long-arrow',
  navigationContainerDesktop = 'fixed-container',
  showContentBelowImageOnMobile = false,
  desktopPaddingTop = '0',
  desktopPaddingBottom = '0',
  mobilePaddingTop = '0',
  mobilePaddingBottom = '50',
  navigationButtonColorScheme,
  enableNavigationColorsOnMobile = false,
  customColorPagination = false,
  paginationColorDesktop,
  paginationColorMobile,
  className = '',
}: SectionSlideshowProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = slides.length;

  // Navigation
  const canGoPrevious = totalSlides > 1;
  const canGoNext = totalSlides > 1;

  const goToPrevious = () => swiperRef.current?.slidePrev();
  const goToNext = () => swiperRef.current?.slideNext();
  const goToSlide = (index: number) => swiperRef.current?.slideTo(index);

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentIndex(swiper.realIndex);
  };

  // Get arrow icons
  const {Left: LeftIcon, Right: RightIcon} = getArrowIcons(navigationIconType);

  // Section styles
  const sectionStyle: CSSProperties = {
    '--section-padding-top-desktop': desktopPaddingTop,
    '--section-padding-bottom-desktop': desktopPaddingBottom,
    '--section-padding-top-mobile': mobilePaddingTop,
    '--section-padding-bottom-mobile': mobilePaddingBottom,
  } as CSSProperties;

  // Pagination custom colors (only applied when customColorPagination is true)
  const paginationCustomStyles: CSSProperties = customColorPagination
    ? ({
        ...(paginationColorDesktop && {
          '--pagination-color-desktop': paginationColorDesktop,
        }),
        ...(paginationColorMobile && {
          '--pagination-color-mobile': paginationColorMobile,
        }),
      } as CSSProperties)
    : {};

  // Height class
  const heightClass = `slideshow__banner--media--${slideHeight === 'adapt' ? 'adapt_image' : slideHeight}`;

  // Navigation style classes
  const navStyleClass =
    navigationStyle === 'split-controls'
      ? 'navigation--button-style-split'
      : 'navigation--button-style-inline';

  const navIconClass = `navigation--icon-${navigationIconType.replace('-', '_')}`;

  // Container class
  const containerClass =
    navigationContainerDesktop === 'fixed-container'
      ? 'container'
      : 'container-fluid';

  // Navigation colors class
  const navColorClass = navigationButtonColorScheme || '';
  const mobileNavColorClass = enableNavigationColorsOnMobile
    ? ''
    : 'slideshow--mobile-navs-hide-colors';

  return (
    <section
      className={`section slideshow-section ${heightClass} ${className}`}
      style={sectionStyle}
    >
      <div className="slideshow-wrapper">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
          loop={totalSlides > 1}
          autoplay={
            autoRotateSlides
              ? {
                  delay: changeSlides * 1000,
                  disableOnInteraction: false,
                }
              : false
          }
          slidesPerView={1}
          grabCursor={true}
          watchSlidesProgress={true}
          className="slideshow-swiper"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <SingleSlideshow
                {...slide}
                showContentBelowImageOnMobile={showContentBelowImageOnMobile}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Controls */}
        {totalSlides > 1 && (
          <div
            className={`slideshow--slider slider--controls--bullet slider--controls--button ${navStyleClass} ${navColorClass} ${mobileNavColorClass}`}
            style={paginationCustomStyles}
          >
            <div
              className={`slideshow--controls--inner ${navIconClass} ${containerClass}`}
            >
              {/* Pagination Dots */}
              <div className="slideshow--bullet-button pagination--dots">
                {Array.from({length: totalSlides}).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`swiper-pagination-bullet ${index === currentIndex ? 'swiper-pagination-bullet-active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrow Navigation */}
              <div className={`slideshow--navigation ${navIconClass}`}>
                <button
                  type="button"
                  className="swiper-button-prev slideshow--nav-button"
                  onClick={goToPrevious}
                  disabled={!canGoPrevious}
                  aria-label="Previous slide"
                >
                  <LeftIcon />
                </button>
                <button
                  type="button"
                  className="swiper-button-next slideshow--nav-button"
                  onClick={goToNext}
                  disabled={!canGoNext}
                  aria-label="Next slide"
                >
                  <RightIcon />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
