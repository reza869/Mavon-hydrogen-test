import {Link, type FetcherWithComponents} from 'react-router';
import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {CartForm, getProductOptions} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {CustomImage} from './CustomImage';
import {NewBadge, SaleBadge} from './product/ProductBadge';
import {ProductPrice} from './product/ProductPrice';
import {QuickShopModal} from './product/QuickShopModal';
import {useAside} from './Aside';

/**
 * Product data type for ProductItem component
 * Extended to include all fields needed for Mavon features
 */
export interface ProductItemData {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  availableForSale?: boolean;
  featuredImage?: {
    id?: string;
    altText?: string | null;
    url: string;
    width?: number;
    height?: number;
  } | null;
  images?: {
    nodes: Array<{
      id?: string;
      altText?: string | null;
      url: string;
      width?: number;
      height?: number;
    }>;
  };
  priceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
    maxVariantPrice: {amount: string; currencyCode: string};
  };
  compareAtPriceRange?: {
    minVariantPrice: {amount: string; currencyCode: string};
    maxVariantPrice: {amount: string; currencyCode: string};
  };
  options?: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      firstSelectableVariant?: {
        id: string;
        image?: {
          id?: string;
          altText?: string | null;
          url: string;
          width?: number;
          height?: number;
        } | null;
      } | null;
      swatch?: {
        color?: string | null;
        image?: {
          previewImage?: {
            url: string;
          } | null;
        } | null;
      } | null;
    }>;
  }>;
  /** Total number of variants */
  variantsCount?: {
    count: number;
  };
  /** First available variant for simple products */
  firstVariant?: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
    }>;
  };
  /** Metafield for NEW badge expiry date */
  newBadgeDate?: {
    value: string;
  } | null;
  /** Metafield for countdown timer date */
  countdownDate?: {
    value: string;
  } | null;
}

/**
 * Props for ProductItem component
 * All display options are configurable via props
 */
export interface ProductItemProps {
  /** Product data */
  product: ProductItemData;
  /** Image loading strategy */
  loading?: 'eager' | 'lazy';
  /** Image aspect ratio - 'adapt' uses natural ratio, or specify like '1/1', '3/4', '4/3' */
  imageRatio?: 'adapt' | '1/1' | '3/4' | '4/3' | '16/9';
  /** Round the corners of the image */
  roundedCorners?: boolean;
  /** Corner radius in pixels (only used when roundedCorners is true) */
  cornerRadius?: number;
  /** Show second image on hover */
  showSecondImageOnHover?: boolean;
  /** Show product title */
  showTitle?: boolean;
  /** Show product price */
  showPrice?: boolean;
  /** Show product vendor */
  showVendor?: boolean;
  /** Show product rating (placeholder for future Judge.me integration) */
  showRating?: boolean;
  /** Show badges (NEW, SALE, Sold out) */
  showBadges?: boolean;
  /** Badge position */
  badgePosition?: 'top-left' | 'top-center' | 'top-right';
  /** Enable quick shop button */
  enableQuickShop?: boolean;
  /** Quick shop button style on desktop */
  quickShopStyle?: 'icon-button' | 'text-button';
  /** Quick shop button position on desktop */
  quickShopPosition?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** Show countdown timer */
  showCountdown?: boolean;
  /** Color scheme for countdown */
  countdownColorScheme?: string;
  /** Position countdown on image (desktop) */
  countdownOnImage?: boolean;
  /** Enable color swatches */
  enableColorSwatches?: boolean;
  /** Maximum color swatches to display before showing +N */
  maxSwatches?: number;
  /** Enable Add to Cart button for simple products (no variants) */
  enableAddToCart?: boolean;
  /** Add to Cart button style */
  addToCartStyle?: 'icon-button' | 'text-button';
  /** Add to Cart button position */
  addToCartPosition?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** Custom className for the product card */
  className?: string;
}

/**
 * Countdown Timer Component
 */
function CountdownTimer({
  targetDate,
  colorScheme,
}: {
  targetDate: string;
  colorScheme?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) return null;

  return (
    <div
      className="product-card__countdown flex items-center justify-center gap-0 bg-background border-t border-foreground/10"
      data-color-scheme={colorScheme}
    >
      <div className="countdown__item flex flex-col items-center px-3 py-2 border-r border-foreground/10">
        <span className="countdown__value text-[16px] font-medium leading-none">
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="countdown__label text-[11px] text-foreground/60 mt-1">Days</span>
      </div>
      <div className="countdown__item flex flex-col items-center px-3 py-2 border-r border-foreground/10">
        <span className="countdown__value text-[16px] font-medium leading-none">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="countdown__label text-[11px] text-foreground/60 mt-1">Hrs</span>
      </div>
      <div className="countdown__item flex flex-col items-center px-3 py-2 border-r border-foreground/10">
        <span className="countdown__value text-[16px] font-medium leading-none">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="countdown__label text-[11px] text-foreground/60 mt-1">Min</span>
      </div>
      <div className="countdown__item flex flex-col items-center px-3 py-2">
        <span className="countdown__value text-[16px] font-medium leading-none">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="countdown__label text-[11px] text-foreground/60 mt-1">Sec</span>
      </div>
    </div>
  );
}

/**
 * Color Swatch Component for ProductItem
 * Supports selecting a color to update the product card image
 */
function ColorSwatches({
  options,
  maxSwatches = 4,
  productHandle,
  selectedColor,
  onColorSelect,
}: {
  options: ProductItemData['options'];
  maxSwatches?: number;
  productHandle: string;
  selectedColor?: string | null;
  onColorSelect?: (colorName: string) => void;
}) {
  const colorOption = options?.find(
    (opt) => opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour'
  );

  if (!colorOption || colorOption.optionValues.length === 0) return null;

  const swatches = colorOption.optionValues;
  const visibleSwatches = swatches.slice(0, maxSwatches);
  const remainingCount = swatches.length - maxSwatches;

  // Scaled down version of product page swatches
  // Product page: wrapper 41px, inner 35px, padding 2px, border 1px
  // Product card: wrapper 28px, inner 22px, padding 2px, border 1px
  return (
    <div className="product-card__swatches flex items-center justify-center gap-[4px] mt-3">
      {visibleSwatches.map((swatch) => {
        const bgColor = swatch.swatch?.color || swatch.name;
        const bgImage = swatch.swatch?.image?.previewImage?.url;
        const isSelected = selectedColor === swatch.name;

        return (
          <button
            key={swatch.name}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onColorSelect?.(swatch.name);
            }}
            className="color-swatch-wrapper w-[28px] h-[28px] rounded-full p-[2px] cursor-pointer flex items-center justify-center transition-all duration-200 border border-transparent"
            data-selected={isSelected || undefined}
            title={swatch.name}
            aria-label={`Select ${swatch.name} color`}
            aria-pressed={isSelected}
          >
            <span
              className="color-swatch-inner w-[22px] h-[22px] rounded-full overflow-hidden"
              style={{
                backgroundColor: bgImage ? undefined : bgColor,
                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </button>
        );
      })}
      {remainingCount > 0 && (
        <Link
          to={`/products/${productHandle}`}
          className="text-[13px] text-foreground/60 hover:text-foreground transition-colors"
        >
          +{remainingCount}
        </Link>
      )}
    </div>
  );
}

/**
 * Quick Shop Button Component
 * On mobile (below 750px), always shows icon button regardless of desktop setting
 */
function QuickShopButton({
  style,
  position,
  onClick,
  disabled = false,
}: {
  style: 'icon-button' | 'text-button';
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  onClick?: () => void;
  disabled?: boolean;
}) {
  const positionClasses = {
    'bottom-right': 'right-6 bottom-6',
    'bottom-left': 'left-6 bottom-6',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-6',
  };

  // Icon button (always shown on mobile, or when style is icon-button)
  const iconButton = (
    <button
      type="button"
      disabled={disabled}
      className={`quick-shop-btn quick-shop-btn--icon absolute ${positionClasses[position]} w-[40px] h-[40px] rounded-full bg-background shadow-md flex items-center justify-center hover:bg-[#333333] hover:text-[#ffffff] transition-colors z-1 border-0 text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-foreground`}
      onClick={() => {
        if (!disabled) onClick?.();
      }}
      aria-label={disabled ? 'Sold out' : 'Quick shop'}
    >
      <PlusIcon />
    </button>
  );

  // Text button (only shown on desktop when style is text-button)
  // Mavon uses "Select Options" text for products with variants
  const textButton = (
    <button
      type="button"
      disabled={disabled}
      className={`quick-shop-btn quick-shop-btn--text absolute ${positionClasses[position]} shadow-md h6 button button--primary mb-0`}
      data-color-scheme="scheme-3"
      style={{ '--button-font-weight': 700 }}
      onClick={() => {
        if (!disabled) onClick?.();
      }}
    >
      <span>{'Select Options'}</span>
    </button>
  );

  // If style is icon-button, always show icon button
  if (style === 'icon-button') {
    return iconButton;
  }

  // If style is text-button, show text on desktop (>=750px), icon on mobile (<750px)
  return (
    <>
      {/* Mobile: Icon button (below 750px) */}
      <span className="block md-750:hidden">{iconButton}</span>
      {/* Desktop: Text button (750px and above) */}
      <span className="hidden md-750:block">{textButton}</span>
    </>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z"></path>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.20039 12.8C4.53765 12.8 4.00039 13.3373 4.00039 14C4.00039 14.6627 4.53765 15.2 5.20039 15.2C5.86313 15.2 6.40039 14.6627 6.40039 14C6.40039 13.3373 5.86313 12.8 5.20039 12.8Z" fill="currentColor"/>
      <path d="M11.6 12.8C10.9373 12.8 10.4 13.3373 10.4 14C10.4 14.6627 10.9373 15.2 11.6 15.2C12.2627 15.2 12.8 14.6627 12.8 14C12.8 13.3373 12.2627 12.8 11.6 12.8Z" fill="currentColor"/>
      <path d="M14.9587 3.30667C14.8693 3.21412 14.762 3.14061 14.6433 3.09058C14.5246 3.04055 14.3969 3.01508 14.268 3.016H3.81601L3.71734 2.38933C3.67062 2.09498 3.52197 1.82672 3.29735 1.63117C3.07273 1.43561 2.78639 1.32515 2.48801 1.31867H1.33334C1.15653 1.31867 0.986958 1.38891 0.861933 1.51393C0.736909 1.63895 0.666672 1.80853 0.666672 1.98533C0.666672 2.16214 0.736909 2.33171 0.861933 2.45674C0.986958 2.58176 1.15653 2.652 1.33334 2.652H2.46534L3.58001 9.708C3.64869 10.126 3.85872 10.5072 4.17351 10.7864C4.48829 11.0656 4.88821 11.226 5.30934 11.24H11.9827C12.3641 11.2394 12.7328 11.1053 13.0274 10.8604C13.322 10.6155 13.5242 10.2746 13.5987 9.89733L14.5587 4.716C14.5846 4.58936 14.5835 4.459 14.5556 4.33286C14.5277 4.20672 14.4736 4.08762 14.3969 3.98326C14.3202 3.87889 14.2225 3.79148 14.1102 3.72661C13.998 3.66174 13.8736 3.62082 13.7453 3.60667L14.9587 3.30667ZM13.22 4.34533L12.284 9.39867C12.2685 9.48315 12.2245 9.55973 12.1594 9.61551C12.0942 9.67128 12.012 9.70291 11.9267 9.70533H5.35601C5.26922 9.70647 5.18454 9.67703 5.11688 9.62213C5.04921 9.56722 5.00279 9.49027 4.98534 9.40467L4.03734 4.34933L13.22 4.34533Z" fill="currentColor"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Add to Cart Button for ProductItem (simple products without variants)
 * Uses CartForm to add directly to cart drawer
 */
function AddToCartProductButton({
  style,
  position,
  variantId,
  productTitle,
  disabled = false,
  onAddToCart,
}: {
  style: 'icon-button' | 'text-button';
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variantId: string;
  productTitle: string;
  disabled?: boolean;
  onAddToCart?: () => void;
}) {
  const positionClasses = {
    'bottom-right': 'right-6 bottom-6',
    'bottom-left': 'left-6 bottom-6',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-6',
  };

  const lines = useMemo(() => [{merchandiseId: variantId, quantity: 1}], [variantId]);

  // If style is icon-button, always show icon button
  if (style === 'icon-button') {
    return (
      <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
        {(fetcher: FetcherWithComponents<unknown>) => (
          <AddToCartButtonInner
            fetcher={fetcher}
            disabled={disabled}
            productTitle={productTitle}
            positionClasses={positionClasses[position]}
            variant="icon"
            onAddToCart={onAddToCart}
          />
        )}
      </CartForm>
    );
  }

  // If style is text-button, show text on desktop (>=750px), icon on mobile (<750px)
  return (
    <>
      {/* Mobile: Icon button (below 750px) */}
      <span className="block md-750:hidden">
        <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
          {(fetcher: FetcherWithComponents<unknown>) => (
            <AddToCartButtonInner
              fetcher={fetcher}
              disabled={disabled}
              productTitle={productTitle}
              positionClasses={positionClasses[position]}
              variant="icon"
              onAddToCart={onAddToCart}
            />
          )}
        </CartForm>
      </span>
      {/* Desktop: Text button (750px and above) */}
      <span className="hidden md-750:block">
        <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
          {(fetcher: FetcherWithComponents<unknown>) => (
            <AddToCartButtonInner
              fetcher={fetcher}
              disabled={disabled}
              productTitle={productTitle}
              positionClasses={positionClasses[position]}
              variant="text"
              onAddToCart={onAddToCart}
            />
          )}
        </CartForm>
      </span>
    </>
  );
}

/**
 * Inner button component - opens cart drawer after successful add to cart
 */
function AddToCartButtonInner({
  fetcher,
  disabled,
  productTitle,
  positionClasses,
  variant,
  onAddToCart,
}: {
  fetcher: FetcherWithComponents<unknown>;
  disabled: boolean;
  productTitle: string;
  positionClasses: string;
  variant: 'icon' | 'text';
  onAddToCart?: () => void;
}) {
  const isLoading = fetcher.state !== 'idle';
  const isDisabled = disabled || isLoading;

  // Track previous fetcher state to detect completion
  const prevStateRef = useRef(fetcher.state);

  // Open cart drawer when add to cart completes successfully
  useEffect(() => {
    // Detect when fetcher goes from 'loading' to 'idle' (submission complete)
    if (prevStateRef.current === 'loading' && fetcher.state === 'idle' && fetcher.data) {
      onAddToCart?.();
    }
    prevStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.data, onAddToCart]);

  if (variant === 'icon') {
    return (
      <button
        type="submit"
        disabled={isDisabled}
        className={`add-to-cart-btn add-to-cart-btn--icon absolute ${positionClasses} w-[40px] h-[40px] rounded-full bg-background shadow-md flex items-center justify-center hover:bg-[#333333] hover:text-[#ffffff] transition-colors z-1 border-0 text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-foreground`}
        aria-label={disabled ? `${productTitle} - Sold out` : `Add ${productTitle} to cart`}
      >
        {isLoading ? <LoadingSpinner /> : <CartIcon />}
      </button>
    );
  }

  const buttonText = isLoading ? 'Adding...' : 'Add to Cart';
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`add-to-cart-btn add-to-cart-btn--text absolute ${positionClasses} quick-add__submit product-grid-item__actions__btn h6 button button--primary mb-0 shadow-md`}
      data-color-scheme="scheme-3"
      style={{ '--button-font-weight': 700 }}
    >
      {isLoading ? <LoadingSpinner /> : <span>{buttonText}</span>}
    </button>
  );
}

/**
 * ProductItem Component
 * Reusable product card matching Mavon Liquid theme functionality
 */
export function ProductItem({
  product,
  loading,
  imageRatio = 'adapt',
  roundedCorners = false,
  cornerRadius = 10,
  showSecondImageOnHover = false,
  showTitle = true,
  showPrice = true,
  showVendor = false,
  showRating = false,
  showBadges = true,
  badgePosition = 'top-left',
  enableQuickShop = true,
  quickShopStyle = 'icon-button',
  quickShopPosition = 'bottom-right',
  showCountdown = false,
  countdownColorScheme = 'scheme-5',
  countdownOnImage = false,
  enableColorSwatches = true,
  maxSwatches = 4,
  enableAddToCart = true,
  addToCartStyle = 'icon-button',
  addToCartPosition = 'bottom-right',
  className = '',
}: ProductItemProps) {
  const baseVariantUrl = useVariantUrl(product.handle);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quickShopOpen, setQuickShopOpen] = useState(false);
  const {open: openAside} = useAside();

  // Handle add to cart from quick shop modal
  // The modal now handles opening the cart drawer directly via useAside
  const handleQuickShopAddToCart = useCallback(() => {
    setQuickShopOpen(false);
  }, []);

  // Get color option and find variant image for selected color
  const colorOption = product.options?.find(
    (opt) => opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour'
  );

  // Get the image for selected color variant, or fall back to featured image
  const selectedVariantImage = useMemo(() => {
    if (!selectedColor || !colorOption) return null;
    const selectedOptionValue = colorOption.optionValues.find(
      (opt) => opt.name === selectedColor
    );
    return selectedOptionValue?.firstSelectableVariant?.image || null;
  }, [selectedColor, colorOption]);

  // Build variant URL with selected color
  const variantUrl = useMemo(() => {
    if (!selectedColor) return baseVariantUrl;
    const url = new URL(baseVariantUrl, 'http://localhost');
    url.searchParams.set('Color', selectedColor);
    return url.pathname + url.search;
  }, [baseVariantUrl, selectedColor]);

  // Get primary and secondary images
  const primaryImage = selectedVariantImage || product.featuredImage;
  const secondaryImage = selectedVariantImage ? null : product.images?.nodes?.[1];

  // Determine if product is on sale - safely check for compare at price
  const compareAtAmount = product.compareAtPriceRange?.minVariantPrice?.amount;
  const currentAmount = product.priceRange?.minVariantPrice?.amount;
  const hasCompareAtPrice =
    compareAtAmount &&
    currentAmount &&
    parseFloat(compareAtAmount) > 0 &&
    parseFloat(compareAtAmount) > parseFloat(currentAmount);

  // Check if countdown should show
  const hasCountdown = showCountdown && product.countdownDate?.value;
  const countdownExpired = useMemo(() => {
    if (!product.countdownDate?.value) return true;
    return new Date() > new Date(product.countdownDate.value);
  }, [product.countdownDate]);

  // Check if product is simple (only 1 variant) - show Add to Cart instead of Quick Shop
  const isSimpleProduct = product.variantsCount?.count === 1;
  const firstVariantId = product.firstVariant?.nodes?.[0]?.id;

  // Image style based on props
  const imageContainerStyle: React.CSSProperties = {
    aspectRatio: imageRatio === 'adapt' ? undefined : imageRatio.replace('/', ' / '),
    borderRadius: roundedCorners ? `${cornerRadius}px` : undefined,
  };

  // Badge position classes
  const badgePositionClasses = {
    'top-left': 'left-6 top-6',
    'top-center': 'left-1/2 -translate-x-1/2 top-6',
    'top-right': 'right-6 top-6',
  }[badgePosition];

  return (
    <div
      className={`product-card group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - relative wrapper for buttons positioned outside Link */}
      <div className="product-card__media-wrapper relative">
        <Link
          className="product-card__link block"
          prefetch="intent"
          to={variantUrl}
        >
          {/* Image Container */}
          <div
            className="product-card__media relative overflow-hidden bg-foreground/5"
            style={imageContainerStyle}
          >
            {/* Primary Image */}
            {primaryImage && (
              <CustomImage
                src={primaryImage.url}
                alt={primaryImage.altText || product.title}
                width={primaryImage.width}
                height={primaryImage.height}
                loading={loading}
                className={`product-card__image w-full h-full object-cover transition-opacity duration-300 ${
                  showSecondImageOnHover && secondaryImage && isHovered
                    ? 'opacity-0'
                    : 'opacity-100'
                }`}
                sizes="(min-width: 1200px) 300px, (min-width: 768px) 250px, 50vw"
              />
            )}

            {/* Secondary Image (on hover) */}
            {showSecondImageOnHover && secondaryImage && (
              <CustomImage
                src={secondaryImage.url}
                alt={secondaryImage.altText || `${product.title} - alternate view`}
                width={secondaryImage.width}
                height={secondaryImage.height}
                loading="lazy"
                className={`product-card__image product-card__image--secondary absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(min-width: 1200px) 300px, (min-width: 768px) 250px, 50vw"
              />
            )}

            {/* Badges */}
            {showBadges && (
              <div className={`product-card__badges absolute ${badgePositionClasses} flex flex-row items-start gap-[4px] z-1`}>
                {/* NEW Badge - only show if available for sale */}
                {product.availableForSale !== false && (
                  <NewBadge
                    newUntilDate={product.newBadgeDate?.value}
                    className="bg-foreground text-background leading-none py-[5px] px-[10px] block rounded-[3px] tracking-[1px] font-medium uppercase text-[13px]"
                  />
                )}

                {/* Sold Out / SALE Badge */}
                <SaleBadge
                  price={product.priceRange?.minVariantPrice}
                  compareAtPrice={product.compareAtPriceRange?.minVariantPrice}
                  availableForSale={product.availableForSale}
                  showPercentage={true}
                  showPercentageItem={true}
                />
              </div>
            )}

            {/* Countdown on Image */}
            {countdownOnImage && hasCountdown && !countdownExpired && (
              <div className="product-card__countdown-overlay absolute bottom-0 left-0 right-0">
                <CountdownTimer
                  targetDate={product.countdownDate!.value}
                  colorScheme={countdownColorScheme}
                />
              </div>
            )}
          </div>
        </Link>

        {/* Add to Cart Button - OUTSIDE Link for proper form submission */}
        {/* Shows disabled button for sold out products (matching Mavon behavior) */}
        {enableAddToCart && isSimpleProduct && firstVariantId && (
          <AddToCartProductButton
            style={addToCartStyle}
            position={addToCartPosition}
            variantId={firstVariantId}
            productTitle={product.title}
            disabled={product.availableForSale === false}
            onAddToCart={() => openAside('cart')}
          />
        )}

        {/* Quick Shop Button - OUTSIDE Link for proper click handling */}
        {/* Shows disabled button for sold out products (matching Mavon behavior) */}
        {enableQuickShop && !isSimpleProduct && (
          <QuickShopButton
            style={quickShopStyle}
            position={quickShopPosition}
            disabled={product.availableForSale === false}
            onClick={() => setQuickShopOpen(true)}
          />
        )}
      </div>

      <Link
        className="product-card__link block"
        prefetch="intent"
        to={variantUrl}
      >

        {/* Countdown below image (if not on image) */}
        {!countdownOnImage && hasCountdown && !countdownExpired && (
          <CountdownTimer
            targetDate={product.countdownDate!.value}
            colorScheme={countdownColorScheme}
          />
        )}

        {/* Product Info */}
        <div className="product-card__info pt-8 text-center">
          {/* Vendor */}
          {showVendor && product.vendor && (
            <p className="product-card__vendor text-[12px] text-foreground/60 mb-1 uppercase tracking-wide">
              {product.vendor}
            </p>
          )}

          {/* Title */}
          {showTitle && (
            <h3 className="product-card__title mb-[8px] font-medium leading-snug hover:underline h6">
              {product.title}
            </h3>
          )}

          {/* Rating Placeholder */}
          {showRating && (
            <div className="product-card__rating flex items-center justify-center gap-1 mb-2">
              {/* TODO: Integrate with Judge.me or similar */}
              <span className="text-[12px] text-foreground/50">No reviews yet</span>
            </div>
          )}

          {/* Price */}
          {showPrice && product.priceRange?.minVariantPrice && (
            <ProductPrice
              price={product.priceRange.minVariantPrice}
              compareAtPrice={hasCompareAtPrice ? product.compareAtPriceRange?.minVariantPrice : null}
              showFromPrefix={
                product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice?.amount
              }
              className="product-card__sale-price text-[16px] text-foreground font-normal leading-none flex gap-1.5 justify-center"
              compareClassName="product-card__compare-price text-[13px] text-foreground/50 font-normal line-through"
              groupClassName="product-card__price flex items-center justify-center flex-wrap gap-x-2 gap-y-0"
              fromPrefixClassName="text-foreground/60 font-normal"
            />
          )}
        </div>
      </Link>

      {/* Color Swatches (outside Link to allow independent navigation) */}
      {enableColorSwatches && product.options && (
        <ColorSwatches
          options={product.options}
          maxSwatches={maxSwatches}
          productHandle={product.handle}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
      )}

      {/* Quick Shop Modal */}
      {enableQuickShop && !isSimpleProduct && (
        <QuickShopModal
          isOpen={quickShopOpen}
          onClose={() => setQuickShopOpen(false)}
          onAddToCart={handleQuickShopAddToCart}
          productHandle={product.handle}
        />
      )}
    </div>
  );
}

/**
 * GraphQL Fragment for ProductItem
 * Include this in your collection/product queries to get all required fields
*/
export const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    vendor
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          id
          image {
            id
            altText
            url
            width
            height
          }
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    variantsCount: variantsCount {
      count
    }
    firstVariant: variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
    newBadgeDate: metafield(namespace: "meta", key: "product_new_badge") {
      value
    }
    countdownDate: metafield(namespace: "meta", key: "product_countdown") {
      value
    }
  }
` as const;
