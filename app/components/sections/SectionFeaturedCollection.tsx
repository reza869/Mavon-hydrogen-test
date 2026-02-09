import {useFetcher, useLocation} from 'react-router';
import {useState, useEffect, useMemo, type CSSProperties} from 'react';
import {
  FeaturedCollectionSection,
  type NavigationPosition,
  type ButtonPosition,
  type ButtonType,
  type ButtonSize,
  type ColorScheme,
} from './FeaturedCollectionSection';
import type {
  NavigationIconType,
  ButtonStyle,
  PaginationType,
} from '~/components/shared/SliderNavigation';
import type {HeadingSize, HeadingAlignment} from '~/components/shared/SectionHeader';
import type {ProductItemProps, ProductItemData} from '~/components/ProductItem';

// Type for collection data
interface CollectionData {
  id: string;
  handle: string;
  title: string;
  description?: string;
  products: {
    nodes: ProductItemData[];
  };
}

export interface SectionFeaturedCollectionProps {
  // Collection Settings
  /** Collection handle to fetch products from */
  collection: string;
  /** Maximum products to show */
  maxProductToShow?: number;
  /** Desktop columns (2-6) */
  desktopColumnNum?: number;
  /** Mobile columns (1-2) */
  mobileColumnNum?: number;

  // Slider Settings
  /** Enable slider mode (false = grid) */
  enableSlider?: boolean;
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

  // Button Settings
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

  // Section Header Settings
  /** Section heading (defaults to collection title) */
  heading?: string;
  /** Heading size */
  headingSize?: HeadingSize;
  /** Subheading text */
  subheading?: string;
  /** Desktop heading alignment */
  desktopHeadingAlignment?: HeadingAlignment;
  /** Mobile heading alignment */
  mobileHeadingAlignment?: HeadingAlignment;

  // Section Styling
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

  // ProductItem props pass-through
  /** Props for ProductItem component */
  productItemProps?: Partial<Omit<ProductItemProps, 'product' | 'loading'>>;

  /** Custom className */
  className?: string;
}

/**
 * Section Featured Collection Component
 * A self-contained component that fetches collection data by handle and renders a featured collection section
 *
 * Usage:
 * <SectionFeaturedCollection
 *   collection="best-sellers"
 *   maxProductToShow={8}
 *   enableSlider={true}
 *   heading="Best Sellers"
 * />
 */
export function SectionFeaturedCollection({
  collection,
  maxProductToShow = 8,
  desktopColumnNum = 4,
  mobileColumnNum = 2,
  enableSlider = true,
  autoRotate = false,
  changesEvery = '5',
  sliderLoop = true,
  showPagination = true,
  paginationType = 'counter',
  showNavigation = true,
  navigationIconType = 'chevron',
  buttonStyle = 'round',
  navigationPosition = 'top',
  customColorNavigation = false,
  navigationForegroundColor = '#121212',
  navigationBackgroundColor = '#ffffff',
  navigationHoverBackgroundColor = '#121212',
  navigationHoverTextColor = '#ffffff',
  buttonRadius = 50,
  showButton = true,
  buttonLabel = 'SEE COLLECTION',
  buttonType = 'secondary',
  buttonSize = 'medium',
  buttonPosition = 'top',
  heading,
  headingSize = 'large',
  subheading,
  desktopHeadingAlignment = 'left',
  mobileHeadingAlignment = 'left',
  desktopPaddingTop = '80',
  desktopPaddingBottom = '80',
  mobilePaddingTop = '50',
  mobilePaddingBottom = '50',
  sectionColorScheme = 'scheme-1',
  productItemProps = {},
  className = '',
}: SectionFeaturedCollectionProps) {
  // Use React Router's useFetcher to load collection data
  const fetcher = useFetcher<{collection: CollectionData | null}>();
  const [hasLoaded, setHasLoaded] = useState(false);
  // Store collection data in local state to persist during cart mutations
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const location = useLocation();

  // Extract locale (language-country) from current URL path (e.g., /EN-BD/... -> {language: EN, country: BD})
  const locale = useMemo(() => {
    const firstPathPart = location.pathname.split('/')[1] || '';
    // Check if it matches locale pattern (XX-XX)
    if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
      const [language, country] = firstPathPart.toUpperCase().split('-');
      return {language, country};
    }
    return null;
  }, [location.pathname]);

  // Fetch collection data on mount - pass locale as query params
  useEffect(() => {
    if (!hasLoaded && fetcher.state === 'idle') {
      const params = new URLSearchParams({first: String(maxProductToShow)});
      if (locale) {
        params.set('country', locale.country);
        params.set('language', locale.language);
      }
      void fetcher.load(`/api/collection/${collection}?${params.toString()}`);
      setHasLoaded(true);
    }
  }, [collection, maxProductToShow, fetcher, hasLoaded, locale]);

  // Store fetched data in local state when available
  useEffect(() => {
    if (fetcher.data?.collection && !collectionData) {
      setCollectionData(fetcher.data.collection);
    }
  }, [fetcher.data, collectionData]);

  // Section styling for loading state
  const sectionStyle: CSSProperties = {
    '--section-padding-top-desktop': desktopPaddingTop,
    '--section-padding-bottom-desktop': desktopPaddingBottom,
    '--section-padding-top-mobile': mobilePaddingTop,
    '--section-padding-bottom-mobile': mobilePaddingBottom,
  } as CSSProperties;

  // Show loading skeleton only when we don't have collection data yet
  // Once loaded, keep showing the content even during cart mutations
  if (!collectionData) {
    return (
      <section
        className={`section featured-collection-section ${sectionColorScheme} container ${className}`}
        style={sectionStyle}
      >
        {/* Loading skeleton header */}
        <div style={{marginBottom: '3rem'}}>
          <div
            style={{
              height: '3.2rem',
              width: '200px',
              backgroundColor: 'rgba(var(--color-foreground), 0.08)',
              borderRadius: '4px',
            }}
          />
        </div>
        {/* Loading skeleton products */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${desktopColumnNum}, 1fr)`,
            gap: '2rem',
          }}
        >
          {Array.from({length: desktopColumnNum}).map((_, i) => (
            <div key={i}>
              <div
                style={{
                  aspectRatio: '3/4',
                  backgroundColor: 'rgba(var(--color-foreground), 0.05)',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                }}
              />
              <div
                style={{
                  height: '1.4rem',
                  width: '80%',
                  backgroundColor: 'rgba(var(--color-foreground), 0.08)',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                }}
              />
              <div
                style={{
                  height: '1.2rem',
                  width: '40%',
                  backgroundColor: 'rgba(var(--color-foreground), 0.05)',
                  borderRadius: '4px',
                }}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <FeaturedCollectionSection
      collection={collectionData}
      maxProductToShow={maxProductToShow}
      desktopColumnNum={desktopColumnNum}
      mobileColumnNum={mobileColumnNum}
      enableSlider={enableSlider}
      autoRotate={autoRotate}
      changesEvery={changesEvery}
      sliderLoop={sliderLoop}
      showPagination={showPagination}
      paginationType={paginationType}
      showNavigation={showNavigation}
      navigationIconType={navigationIconType}
      buttonStyle={buttonStyle}
      navigationPosition={navigationPosition}
      customColorNavigation={customColorNavigation}
      navigationForegroundColor={navigationForegroundColor}
      navigationBackgroundColor={navigationBackgroundColor}
      navigationHoverBackgroundColor={navigationHoverBackgroundColor}
      navigationHoverTextColor={navigationHoverTextColor}
      buttonRadius={buttonRadius}
      showButton={showButton}
      buttonLabel={buttonLabel}
      buttonType={buttonType}
      buttonSize={buttonSize}
      buttonPosition={buttonPosition}
      heading={heading}
      headingSize={headingSize}
      subheading={subheading}
      desktopHeadingAlignment={desktopHeadingAlignment}
      mobileHeadingAlignment={mobileHeadingAlignment}
      desktopPaddingTop={desktopPaddingTop}
      desktopPaddingBottom={desktopPaddingBottom}
      mobilePaddingTop={mobilePaddingTop}
      mobilePaddingBottom={mobilePaddingBottom}
      sectionColorScheme={sectionColorScheme}
      productItemProps={productItemProps}
      className={className}
    />
  );
}