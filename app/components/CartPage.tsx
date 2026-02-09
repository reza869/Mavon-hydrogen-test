import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartMain} from '~/components/CartMain';
import {SectionFeaturedCollection} from '~/components/sections';

interface CartPageProps {
  cart: CartApiQueryFragment | null;
}

/**
 * Shared Cart Page Component
 * Used by both /cart and /$locale/cart routes
 */
export function CartPage({cart}: CartPageProps) {
  return (
    <div className="cart">
      
      <CartMain layout="page" cart={cart} />
      <SectionFeaturedCollection
        /* Collection Settings */
        collection="best-seller" /* Collection handle */
        maxProductToShow={4} /* Maximum products to display */
        desktopColumnNum={4} /* Desktop columns: 2-6 */
        mobileColumnNum={2} /* Mobile columns: 1-2 */
        /* Section Header Settings */
        heading="You may also like"
        headingSize="medium" /* Size: large | medium | small */
        desktopHeadingAlignment="center" /* Alignment: left | center | right */
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
        showButton={false}
        buttonLabel="SEE COLLECTION" /* Button text */
        buttonType="secondary" /* Type: primary | secondary */
        buttonSize="medium" /* Size: large | medium | small */
        buttonPosition="top" /* Position: top | bottom */
        /* Section Styling */
        desktopPaddingTop="110" /* Desktop top padding in px */
        desktopPaddingBottom="80" /* Desktop bottom padding in px */
        mobilePaddingTop="50" /* Mobile top padding in px */
        mobilePaddingBottom="50" /* Mobile bottom padding in px */
        sectionColorScheme="scheme-1" /* Scheme: scheme-1 | scheme-2 | scheme-3 | scheme-4 | scheme-5 */
      />
    </div>
  );
}
