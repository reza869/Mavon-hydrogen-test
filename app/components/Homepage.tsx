import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {FeaturedCollectionSection} from '~/components/sections/FeaturedCollectionSection';
import {SectionFeaturedCollection, SectionCollectionList} from '~/components/sections';
import {SectionSlideshow} from '~/components/sections/SectionSlideshow';
import {SectionTextWithIcons, SectionScrollingText} from '~/components/sections';
import {homepageSlideshowSlides} from '~/data/slideshow-data';
import {homepageFeatures} from '~/data/text-with-icons-data';
import {homepageScrollingItems} from '~/data/scrolling-text-data';
import type {
  HomepageLoaderData,
  FeaturedCollectionData,
  RecommendedProductsData,
  FeaturedCollectionProductsData,
} from '~/lib/homepage.server';

/**
 * Homepage Component
 * Shared component for rendering the homepage content
 * Used by both _index.tsx and ($locale)._index.tsx routes
 */
export function Homepage({data}: {data: HomepageLoaderData}) {
  // Get slideshow settings from dashboard (with defaults)
  const ss = data.slideshowSettings;

  return (
    <div className="home">
      {/* Slideshow Section - Settings controlled from dashboard */}
      <SectionSlideshow
        slides={homepageSlideshowSlides}
        /* Slide Height - from dashboard */
        slideHeight={ss?.slideHeight || 'adapt'}
        /* Autoplay Settings - from dashboard */
        autoRotateSlides={ss?.autoRotateSlides ?? false}
        changeSlides={ss?.changeSlides ?? 5}
        /* Navigation Settings */
        navigationStyle={ss?.navigationStyle || 'split-controls'}
        navigationIconType={ss?.navigationIconType || 'long-arrow'}
        navigationContainerDesktop={ss?.navigationContainerDesktop || 'fullwidth'}
        /* Mobile Settings */
        showContentBelowImageOnMobile={ss?.showContentBelowImageOnMobile ?? true}
        /* Pagination Custom Colors */
        customColorPagination={ss?.customColorPagination ?? true}
        paginationColorDesktop={ss?.paginationColorDesktop || '#ffffff'}
        paginationColorMobile={ss?.paginationColorMobile || '#333333'}
        /* Section Padding - from dashboard */
        desktopPaddingTop={String(ss?.desktopPaddingTop ?? 0)}
        desktopPaddingBottom={String(ss?.desktopPaddingBottom ?? 0)}
        mobilePaddingTop={String(ss?.mobilePaddingTop ?? 0)}
        mobilePaddingBottom={String(ss?.mobilePaddingBottom ?? 50)}
      />

      {/* Text with Icons Section */}
      <SectionTextWithIcons
        features={homepageFeatures}
        /* Layout Settings */
        desktopColumns={3} /* Columns: 3 | 4 */
        contentPosition="horizontal" /* Position: horizontal | vertical */
        contentAlignment="left" /* Alignment: left | center | right */
        /* Section Styling */
        sectionColorScheme="scheme-2" /* Scheme: scheme-1 | scheme-2 | scheme-3 | scheme-4 | scheme-5 */
        /* Border */
        showBorder={true} /* Show border between items: true | false */
        borderColor="#B0B0B0" /* Border color (hex) */
        /* Section Padding */
        desktopPaddingTop="70"
        desktopPaddingBottom="70"
        mobilePaddingTop="60"
        mobilePaddingBottom="60"
        /* Container */
        makeSectionFullwidth={false} /* Fullwidth: true | false */
      />

      {/* Collection List Section */}
      <SectionCollectionList
        /* Collection Settings */
        collectionLimit={15} /* Maximum collections to display: 1-250 */
        layout="slider" /* Layout: slider | grid */
        desktopColumnNum={4} /* Desktop columns: 2-6 */
        mobileColumnNum={2} /* Mobile columns: 1-2 */
        makeSectionFullwidth={false} /* Use fluid container with 3rem side padding */
        /* Section Header Settings */
        heading="Shop by collection"
        subheading="Discover the future of fashion at Fashion Shopping, where the latest trends and styles await"
        headingSize="medium" /* Size: large | medium | small */
        desktopHeadingAlignment="left" /* Alignment: left | center | right */
        mobileHeadingAlignment="left" /* Alignment: left | center | right */
        /* Slider Settings */
        autoRotate={false}
        changesEvery="5" /* Seconds between auto-rotation */
        sliderLoop={true} /* Enable infinite loop: true | false */
        showPagination={true}
        paginationType="progressbar" /* Type: progressbar | counter | bullets */
        showNavigation={true}
        navigationIconType="long-arrow" /* Icon: long-arrow | chevron | small-arrow */
        buttonStyle="noborder" /* Style: noborder | round | square */
        buttonRadius={50} /* Radius percentage for round style: 0-50 */
        navigationPosition="top" /* Position: top | middle | bottom */
        /* Navigation Custom Colors */
        customColorNavigation={false}
        navigationForegroundColor="#121212"
        navigationBackgroundColor="#ffffff"
        navigationHoverBackgroundColor="#121212"
        navigationHoverTextColor="#ffffff"
        /* Button Settings */
        showButton={false}
        buttonLabel="" /* Button text */
        buttonType="secondary" /* Type: primary | secondary */
        buttonSize="medium" /* Size: large | medium | small */
        buttonPosition="top" /* Position: top | bottom */
        /* Collection Card Settings */
        imageRatio="square" /* Ratio: adapt | portrait | square | landscape | circle */
        cardCornerRadius={10} /* Corner radius in px */
        showProductCount={true}
        showContentBelowImage={true} /* Desktop: content below or on image */
        showContentBelowImageMobile={true} /* Mobile: content below or on image */
        cardTitleType="text" /* Type: text | button */
        cardTitleSize="medium" /* Size: extra-small | small | medium | large | extra-large */
        useArrowIcon={false}
        cardIconType="arrow-right" /* Icon: arrow-up-right | arrow-right */
        cardButtonType="primary" /* Type: primary | secondary */
        /* Section Styling */
        desktopPaddingTop="80" /* Desktop top padding in px */
        desktopPaddingBottom="80" /* Desktop bottom padding in px */
        mobilePaddingTop="50" /* Mobile top padding in px */
        mobilePaddingBottom="50" /* Mobile bottom padding in px */
        sectionColorScheme="scheme-1" /* Scheme: scheme-1 | scheme-2 | scheme-3 | scheme-4 | scheme-5 */
      />

      {/* Featured Collection Section - Client-side data fetching */}
      <SectionFeaturedCollection
        /* Collection Settings */
        collection="frontpage" /* Collection handle */
        maxProductToShow={8} /* Maximum products to display */
        desktopColumnNum={4} /* Desktop columns: 2-6 */
        mobileColumnNum={2} /* Mobile columns: 1-2 */
        /* Section Header Settings */
        heading="Featured Collection"
        headingSize="large" /* Size: large | medium | small */
        desktopHeadingAlignment="left" /* Alignment: left | center | right */
        mobileHeadingAlignment="center" /* Alignment: left | center | right */
        /* Slider Settings */
        enableSlider={false}
        autoRotate={false}
        changesEvery="5" /* Seconds between auto-rotation */
        sliderLoop={true} /* Enable infinite loop: true | false */
        showPagination={true}
        paginationType="counter" /* Type: progressbar | counter | bullets */
        showNavigation={true}
        navigationIconType="small-arrow" /* Icon: long-arrow | chevron | small-arrow */
        buttonStyle="noborder" /* Style: noborder | round | square */
        buttonRadius={50} /* Radius percentage for round style: 0-50 */
        navigationPosition="top" /* Position: top | middle | bottom */
        /* Navigation Custom Colors */
        customColorNavigation={false}
        navigationForegroundColor="#121212"
        navigationBackgroundColor="#ffffff"
        navigationHoverBackgroundColor="#121212"
        navigationHoverTextColor="#ffffff"
        /* Button Settings */
        showButton={true}
        buttonLabel="SEE COLLECTION" /* Button text */
        buttonType="secondary" /* Type: primary | secondary */
        buttonSize="medium" /* Size: large | medium | small */
        buttonPosition="top" /* Position: top | bottom */
        /* Section Styling */
        desktopPaddingTop="80" /* Desktop top padding in px */
        desktopPaddingBottom="80" /* Desktop bottom padding in px */
        mobilePaddingTop="50" /* Mobile top padding in px */
        mobilePaddingBottom="50" /* Mobile bottom padding in px */
        sectionColorScheme="scheme-1" /* Scheme: scheme-1 | scheme-2 | scheme-3 | scheme-4 | scheme-5 */
      />


      {/* Scrolling Text Section */}
      <SectionScrollingText
        items={homepageScrollingItems}
        /* Settings */
        speed={28} /* Speed in seconds: 2-30 */
        direction="left" /* Direction: left | right */
        textSize="h0" /* Size: body-text | h4 | h3 | h2 | h1 | h0 */
        columnGap="small" /* Gap: small | medium | large */
        imageCornerRadius={0} /* Corner radius for images: 0-150px */
        /* Section Styling */
        sectionColorScheme="scheme-2" /* Scheme: scheme-1 | scheme-2 | scheme-3 | scheme-4 | scheme-5 */
        /* Section Padding */
        desktopPaddingTop="25"
        desktopPaddingBottom="25"
        mobilePaddingTop="15"
        mobilePaddingBottom="15"
      />

      {/* Featured Collection Section with Server-loaded Data */}
      {/* <Suspense
        fallback={
          <div className="section--padding">Loading featured products...</div>
        }
      >
        <Await resolve={data.featuredCollectionProducts}>
          {(collectionData) =>
            collectionData?.collection && (
              <FeaturedCollectionSection
                collection={collectionData.collection}
                // Layout
                enableSlider={true}
                desktopColumnNum={4}
                mobileColumnNum={2}
                maxProductToShow={8}
                // Header
                heading="Featured Collection"
                headingSize="large"
                desktopHeadingAlignment="left"
                mobileHeadingAlignment="center"
                // Slider settings
                autoRotate={false}
                changesEvery="5"
                showPagination={true}
                paginationType="counter"
                showNavigation={true}
                navigationIconType="chevron"
                buttonStyle="round"
                navigationPosition="top"
                // Button
                showButton={true}
                buttonLabel="SEE COLLECTION"
                buttonType="secondary"
                buttonSize="medium"
                buttonPosition="top"
                // Section styling
                desktopPaddingTop="80"
                desktopPaddingBottom="80"
                mobilePaddingTop="50"
                mobilePaddingBottom="50"
                sectionColorScheme="scheme-1"
              />
            )
          }
        </Await>
      </Suspense> */}

      {/* Recommended Products Section */}
      {/* <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );
}

/**
 * Featured Collection Hero Component
 * Displays the main featured collection with image
 */
function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionData;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * Recommended Products Component
 * Displays a grid of recommended products with deferred loading
 */
function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsData | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product, index) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      loading={index < 8 ? 'eager' : 'lazy'}
                      // Image settings
                      imageRatio="3/4"
                      roundedCorners={true}
                      cornerRadius={10}
                      showSecondImageOnHover={true}
                      // Product info visibility
                      showTitle={true}
                      showPrice={true}
                      showVendor={false}
                      showRating={false}
                      // Badges
                      showBadges={true}
                      badgePosition="top-left"
                      // Quick shop
                      enableQuickShop={true}
                      quickShopStyle="icon-button"
                      quickShopPosition="bottom-right"
                      // Add to cart
                      enableAddToCart={true}
                      addToCartStyle="icon-button"
                      addToCartPosition="bottom-right"
                      // Other features
                      showCountdown={true}
                      enableColorSwatches={true}
                      maxSwatches={4}
                    />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

// Re-export for convenience
export {FeaturedCollection, RecommendedProducts};
