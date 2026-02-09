import {useState, useEffect, useCallback, type CSSProperties, type ReactNode} from 'react';

export interface ProductSliderProps<T> {
  /** Array of items to display */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Number of items visible on desktop */
  desktopColumnNum: number;
  /** Number of items visible on mobile */
  mobileColumnNum: number;
  /** Gap between items in rem */
  gap?: number;
  /** Enable auto-rotation */
  autoRotate?: boolean;
  /** Seconds between auto-rotation */
  changesEvery?: number;
  /** Controlled current index */
  currentIndex?: number;
  /** Callback when index changes */
  onIndexChange?: (index: number) => void;
  /** Callback to get slider controls */
  onControlsReady?: (controls: SliderControls) => void;
  /** Custom className */
  className?: string;
}

export interface SliderControls {
  goToPrevious: () => void;
  goToNext: () => void;
  goToSlide: (index: number) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentIndex: number;
  totalSlides: number;
}

/**
 * Generic Product Slider Component
 * Uses CSS transforms for smooth animations without external libraries
 */
export function ProductSlider<T>({
  items,
  renderItem,
  desktopColumnNum,
  mobileColumnNum,
  gap = 2,
  autoRotate = false,
  changesEvery = 5,
  currentIndex: controlledIndex,
  onIndexChange,
  onControlsReady,
  className = '',
}: ProductSliderProps<T>) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(desktopColumnNum);
  const [isMobile, setIsMobile] = useState(false);

  // Use controlled or internal index
  const currentIndex = controlledIndex ?? internalIndex;
  const setCurrentIndex = useCallback(
    (index: number) => {
      if (onIndexChange) {
        onIndexChange(index);
      } else {
        setInternalIndex(index);
      }
    },
    [onIndexChange],
  );

  // Calculate total slide pages
  const totalSlides = Math.max(1, Math.ceil(items.length / itemsPerView));

  // Navigation state
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalSlides - 1;

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 750;
      setIsMobile(mobile);
      setItemsPerView(mobile ? mobileColumnNum : desktopColumnNum);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [desktopColumnNum, mobileColumnNum]);

  // Reset index when items per view changes
  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(Math.max(0, totalSlides - 1));
    }
  }, [totalSlides, currentIndex, setCurrentIndex]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [canGoPrevious, currentIndex, setCurrentIndex]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [canGoNext, currentIndex, setCurrentIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) {
        setCurrentIndex(index);
      }
    },
    [totalSlides, setCurrentIndex],
  );

  // Provide controls to parent
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady({
        goToPrevious,
        goToNext,
        goToSlide,
        canGoPrevious,
        canGoNext,
        currentIndex,
        totalSlides,
      });
    }
  }, [
    onControlsReady,
    goToPrevious,
    goToNext,
    goToSlide,
    canGoPrevious,
    canGoNext,
    currentIndex,
    totalSlides,
  ]);

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((currentIndex + 1) % totalSlides);
    }, changesEvery * 1000);

    return () => clearInterval(interval);
  }, [autoRotate, changesEvery, totalSlides, currentIndex, setCurrentIndex]);

  // Calculate transform percentage
  // Each slide page shows `itemsPerView` items
  const translateX = currentIndex * 100;

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  };

  const trackStyle: CSSProperties = {
    display: 'flex',
    transform: `translateX(-${translateX}%)`,
    transition: 'transform 0.4s ease-out',
  };

  // Calculate item width based on items per view
  // Width = 100% / itemsPerView, accounting for gaps
  const itemWidth = `calc((100% - ${(itemsPerView - 1) * gap}rem) / ${itemsPerView})`;

  const itemStyle: CSSProperties = {
    flexShrink: 0,
    width: itemWidth,
    marginRight: `${gap}rem`,
  };

  // Last item doesn't need margin
  const lastItemStyle: CSSProperties = {
    ...itemStyle,
    marginRight: 0,
  };

  return (
    <div className={`product-slider ${className}`} style={containerStyle}>
      <div className="product-slider__track" style={trackStyle}>
        {/* Render items in groups for proper sliding */}
        {Array.from({length: totalSlides}).map((_, slideIndex) => {
          const startIndex = slideIndex * itemsPerView;
          const slideItems = items.slice(startIndex, startIndex + itemsPerView);

          return (
            <div
              key={slideIndex}
              className="product-slider__page"
              style={{
                display: 'flex',
                flexShrink: 0,
                width: '100%',
                gap: `${gap}rem`,
              }}
            >
              {slideItems.map((item, itemIndex) => {
                const globalIndex = startIndex + itemIndex;
                const isLast = itemIndex === slideItems.length - 1;
                return (
                  <div
                    key={globalIndex}
                    className="product-slider__item"
                    style={{
                      flexShrink: 0,
                      flex: `0 0 calc((100% - ${(itemsPerView - 1) * gap}rem) / ${itemsPerView})`,
                    }}
                  >
                    {renderItem(item, globalIndex)}
                  </div>
                );
              })}
              {/* Fill empty slots to maintain layout */}
              {slideItems.length < itemsPerView &&
                Array.from({length: itemsPerView - slideItems.length}).map(
                  (_, emptyIndex) => (
                    <div
                      key={`empty-${emptyIndex}`}
                      className="product-slider__item product-slider__item--empty"
                      style={{
                        flexShrink: 0,
                        flex: `0 0 calc((100% - ${(itemsPerView - 1) * gap}rem) / ${itemsPerView})`,
                      }}
                    />
                  ),
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
