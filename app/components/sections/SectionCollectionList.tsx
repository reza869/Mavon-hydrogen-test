import {useFetcher, useLocation} from 'react-router';
import {useState, useEffect, useMemo, type CSSProperties} from 'react';
import {
  CollectionListSection,
  type NavigationPosition,
  type ButtonPosition,
  type ButtonType,
  type ButtonSize,
  type LayoutType,
  type ColorScheme,
} from './CollectionListSection';
import type {
  NavigationIconType,
  ButtonStyle,
  PaginationType,
} from '~/components/shared/SliderNavigation';
import type {HeadingSize, HeadingAlignment} from '~/components/shared/SectionHeader';
import type {
  CollectionData,
  ImageRatio,
  TitleType,
  TitleSize,
  IconType,
  ButtonType as CardButtonType,
} from '~/components/CollectionCard';

export interface SectionCollectionListProps {
  // Collection Settings
  /** Maximum number of collections to display (1-250) */
  collectionLimit?: number;
  /** Layout type: slider or grid */
  layout?: LayoutType;
  /** Desktop columns (2-6) */
  desktopColumnNum?: number;
  /** Mobile columns (1-2) */
  mobileColumnNum?: number;
  /** Make section full width */
  makeSectionFullwidth?: boolean;

  // Slider Settings
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

  // Collection Card Settings
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
 * Section Collection List Component
 * A self-contained component that fetches all collections and renders a collection list section
 *
 * Usage:
 * <SectionCollectionList
 *   collectionLimit={15}
 *   layout="slider"
 *   heading="Shop by collection"
 * />
 */
export function SectionCollectionList({
  collectionLimit = 15,
  layout = 'slider',
  desktopColumnNum = 4,
  mobileColumnNum = 2,
  makeSectionFullwidth = false,
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
  showButton = true,
  buttonLabel = '',
  buttonType = 'secondary',
  buttonSize = 'medium',
  buttonPosition = 'top',
  heading = 'Shop by collection',
  headingSize = 'large',
  subheading,
  desktopHeadingAlignment = 'left',
  mobileHeadingAlignment = 'left',
  desktopPaddingTop = '80',
  desktopPaddingBottom = '80',
  mobilePaddingTop = '50',
  mobilePaddingBottom = '50',
  sectionColorScheme = 'scheme-1',
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
  className = '',
}: SectionCollectionListProps) {
  // Use React Router's useFetcher to load collections data
  const fetcher = useFetcher<{collections: CollectionData[] | null}>();
  const [hasLoaded, setHasLoaded] = useState(false);
  // Store collections data in local state to persist during cart mutations
  const [collectionsData, setCollectionsData] = useState<CollectionData[] | null>(null);
  const location = useLocation();

  // Extract locale (language-country) from current URL path
  const locale = useMemo(() => {
    const firstPathPart = location.pathname.split('/')[1] || '';
    // Check if it matches locale pattern (XX-XX)
    if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
      const [language, country] = firstPathPart.toUpperCase().split('-');
      return {language, country};
    }
    return null;
  }, [location.pathname]);

  // Fetch collections data on mount
  useEffect(() => {
    if (!hasLoaded && fetcher.state === 'idle') {
      const params = new URLSearchParams({limit: String(collectionLimit)});
      if (locale) {
        params.set('country', locale.country);
        params.set('language', locale.language);
      }
      void fetcher.load(`/api/collections?${params.toString()}`);
      setHasLoaded(true);
    }
  }, [collectionLimit, fetcher, hasLoaded, locale]);

  // Store fetched data in local state when available
  useEffect(() => {
    if (fetcher.data?.collections && !collectionsData) {
      setCollectionsData(fetcher.data.collections);
    }
  }, [fetcher.data, collectionsData]);

  // Section styling for loading state
  const sectionStyle: CSSProperties = {
    '--section-padding-top-desktop': desktopPaddingTop,
    '--section-padding-bottom-desktop': desktopPaddingBottom,
    '--section-padding-top-mobile': mobilePaddingTop,
    '--section-padding-bottom-mobile': mobilePaddingBottom,
  } as CSSProperties;

  // Show loading skeleton only when we don't have collections data yet
  if (!collectionsData) {
    return (
      <section
        className={`section collection-list-section ${sectionColorScheme} ${makeSectionFullwidth ? 'container-fluid' : 'container'} ${className}`}
        style={sectionStyle}
      >
        {/* Loading skeleton header */}
        <div style={{marginBottom: '3rem'}}>
          <div
            style={{
              height: '3.2rem',
              width: '250px',
              backgroundColor: 'rgba(var(--color-foreground), 0.08)',
              borderRadius: '4px',
            }}
          />
        </div>
        {/* Loading skeleton collections */}
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
                  aspectRatio: imageRatio === 'portrait' ? '3/4' : imageRatio === 'landscape' ? '4/3' : '1/1',
                  backgroundColor: 'rgba(var(--color-foreground), 0.05)',
                  borderRadius: `${cardCornerRadius}px`,
                  marginBottom: '1rem',
                }}
              />
              <div
                style={{
                  height: '1.4rem',
                  width: '60%',
                  backgroundColor: 'rgba(var(--color-foreground), 0.08)',
                  borderRadius: '4px',
                  margin: '0 auto',
                }}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Determine if button should show based on collection count
  // If more than 8 collections, show the button automatically
  const shouldShowButton = showButton && (!!buttonLabel || collectionsData.length > 8);
  const effectiveButtonLabel = buttonLabel || (collectionsData.length > 8 ? 'View All Collections' : '');

  return (
    <CollectionListSection
      collections={collectionsData}
      layout={layout}
      desktopColumnNum={desktopColumnNum}
      mobileColumnNum={mobileColumnNum}
      makeSectionFullwidth={makeSectionFullwidth}
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
      showButton={shouldShowButton}
      buttonLabel={effectiveButtonLabel}
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
      imageRatio={imageRatio}
      cardCornerRadius={cardCornerRadius}
      showProductCount={showProductCount}
      showContentBelowImage={showContentBelowImage}
      showContentBelowImageMobile={showContentBelowImageMobile}
      cardTitleType={cardTitleType}
      cardTitleSize={cardTitleSize}
      useArrowIcon={useArrowIcon}
      cardIconType={cardIconType}
      cardButtonType={cardButtonType}
      className={className}
    />
  );
}
