import type {CSSProperties} from 'react';

export type NavigationIconType = 'long-arrow' | 'chevron' | 'small-arrow';
export type ButtonStyle = 'square' | 'round' | 'noborder';
export type PaginationType = 'counter' | 'bullets' | 'progressbar';

export interface SliderNavigationProps {
  /** Navigate to previous slide */
  onPrevious: () => void;
  /** Navigate to next slide */
  onNext: () => void;
  /** Can navigate to previous */
  canGoPrevious: boolean;
  /** Can navigate to next */
  canGoNext: boolean;
  /** Arrow icon style */
  navigationIconType?: NavigationIconType;
  /** Button border style */
  buttonStyle?: ButtonStyle;
  /** Button radius (for round style) */
  buttonRadius?: number;
  /** Show pagination indicator */
  showPagination?: boolean;
  /** Pagination display style */
  paginationType?: PaginationType;
  /** Current slide index (0-based) */
  currentIndex: number;
  /** Total number of slide pages */
  totalSlides: number;
  /** Navigate to specific slide (for bullets) */
  onGoToSlide?: (index: number) => void;
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
  /** Custom className */
  className?: string;
}

/**
 * Long Arrow Icon - Extended line with arrow
 */
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

/**
 * Chevron Icon - Standard chevron arrows
 */
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

/**
 * Small Arrow Icon - Simple arrow with line
 */
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

/**
 * Get arrow icons based on type
 */
function getArrowIcons(type: NavigationIconType) {
  switch (type) {
    case 'long-arrow':
      return {Left: LongArrowLeft, Right: LongArrowRight};
    case 'chevron':
      return {Left: ChevronLeft, Right: ChevronRight};
    case 'small-arrow':
      return {Left: SmallArrowLeft, Right: SmallArrowRight};
    default:
      return {Left: ChevronLeft, Right: ChevronRight};
  }
}

/**
 * Counter Pagination - "1 / 8" style
 */
function PaginationCounter({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const style: CSSProperties = {
    fontSize: '1.4rem',
    color: 'rgba(var(--color-foreground), 0.6)',
    fontWeight: 500,
    minWidth: '5rem',
    textAlign: 'center',
  };

  return (
    <span className="slider-pagination slider-pagination--counter" style={style}>
      {current + 1} / {total}
    </span>
  );
}

/**
 * Bullets Pagination - Dot indicators
 */
function PaginationBullets({
  current,
  total,
  onGoToSlide,
}: {
  current: number;
  total: number;
  onGoToSlide?: (index: number) => void;
}) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    gap: '0.8rem',
    alignItems: 'center',
  };

  const bulletStyle = (isActive: boolean): CSSProperties => ({
    width: '0.8rem',
    height: '0.8rem',
    borderRadius: '50%',
    background: isActive
      ? 'rgb(var(--color-foreground))'
      : 'rgba(var(--color-foreground), 0.2)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: 0,
  });

  return (
    <div
      className="slider-pagination slider-pagination--bullets"
      style={containerStyle}
    >
      {Array.from({length: total}).map((_, index) => (
        <button
          key={index}
          type="button"
          className={`slider-bullet ${index === current ? 'slider-bullet--active' : ''}`}
          style={bulletStyle(index === current)}
          onClick={() => onGoToSlide?.(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

/**
 * Progressbar Pagination - Progress bar indicator
 */
function PaginationProgressbar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const progress = ((current + 1) / total) * 100;

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: '12rem',
    height: '0.3rem',
    background: 'rgba(var(--color-foreground), 0.1)',
    borderRadius: '0.15rem',
    overflow: 'hidden',
  };

  const fillStyle: CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    background: 'rgb(var(--color-foreground))',
    transition: 'width 0.3s ease',
  };

  return (
    <div
      className="slider-pagination slider-pagination--progressbar"
      style={containerStyle}
    >
      <div className="slider-progressbar__fill" style={fillStyle} />
    </div>
  );
}

/**
 * Slider Navigation Component
 * Provides navigation arrows and pagination for sliders
 */
export function SliderNavigation({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  navigationIconType = 'chevron',
  buttonStyle = 'round',
  buttonRadius = 50,
  showPagination = false,
  paginationType = 'counter',
  currentIndex,
  totalSlides,
  onGoToSlide,
  customColorNavigation = false,
  navigationForegroundColor = '#121212',
  navigationBackgroundColor = '#ffffff',
  navigationHoverBackgroundColor = '#121212',
  navigationHoverTextColor = '#ffffff',
  className = '',
}: SliderNavigationProps) {
  const {Left: LeftIcon, Right: RightIcon} = getArrowIcons(navigationIconType);

  // Determine border radius based on button style
  const borderRadius = buttonStyle === 'round'
    ? `${buttonRadius}%`
    : buttonStyle === 'square'
      ? '0'
      : '0';

  const buttonBaseStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '4.4rem',
    height: '4.4rem',
    border:
      buttonStyle === 'noborder'
        ? 'none'
        : customColorNavigation
          ? `1px solid ${navigationForegroundColor}`
          : '1px solid rgba(var(--color-foreground), 0.2)',
    background:
      buttonStyle === 'noborder'
        ? 'transparent'
        : customColorNavigation
          ? navigationBackgroundColor
          : 'rgb(var(--color-background))',
    borderRadius,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: customColorNavigation ? navigationForegroundColor : 'rgb(var(--color-foreground))',
    padding: 0,
    '--hover-bg': navigationHoverBackgroundColor,
    '--hover-color': navigationHoverTextColor,
  } as CSSProperties;

  const disabledStyle: CSSProperties = {
    opacity: 0.3,
    cursor: 'not-allowed',
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  return (
    <div
      className={`slider-navigation ${className}`}
      style={containerStyle}
    >
      <button
        type="button"
        className={`slider-arrow slider-arrow--prev slider-arrow--${buttonStyle}`}
        onClick={onPrevious}
        disabled={!canGoPrevious}
        style={{
          ...buttonBaseStyle,
          ...(!canGoPrevious ? disabledStyle : {}),
        }}
        aria-label="Previous slide"
      >
        <LeftIcon />
      </button>

      {showPagination && (
        <>
          {paginationType === 'counter' && (
            <PaginationCounter current={currentIndex} total={totalSlides} />
          )}
          {paginationType === 'bullets' && (
            <PaginationBullets
              current={currentIndex}
              total={totalSlides}
              onGoToSlide={onGoToSlide}
            />
          )}
          {paginationType === 'progressbar' && (
            <PaginationProgressbar current={currentIndex} total={totalSlides} />
          )}
        </>
      )}

      <button
        type="button"
        className={`slider-arrow slider-arrow--next slider-arrow--${buttonStyle}`}
        onClick={onNext}
        disabled={!canGoNext}
        style={{
          ...buttonBaseStyle,
          ...(!canGoNext ? disabledStyle : {}),
        }}
        aria-label="Next slide"
      >
        <RightIcon />
      </button>
    </div>
  );
}
