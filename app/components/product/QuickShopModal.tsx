import {useState, useEffect, useCallback, useMemo} from 'react';
import {createPortal} from 'react-dom';
import {useFetcher, Link} from 'react-router';
import {ProductGallery} from './ProductGallery';
import {ProductVendor} from './ProductVendor';
import {ProductPrice} from './ProductPrice';
import {ProductStock} from './ProductStock';
import {QuickShopProductForm} from './QuickShopProductForm';

interface QuickShopModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when product is added to cart - modal will close and cart should open */
  onAddToCart?: () => void;
  /** Product handle to fetch */
  productHandle: string;
}

interface ProductVariant {
  id: string;
  availableForSale: boolean;
  currentlyNotInStock?: boolean;
  quantityAvailable?: number;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  image?: {
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
  product: {
    title: string;
    handle: string;
  };
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  title: string;
}

interface QuickShopProduct {
  id: string;
  title: string;
  handle: string;
  vendor?: string;
  descriptionHtml?: string;
  images: {
    nodes: Array<{
      id?: string;
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    }>;
  };
  options: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      firstSelectableVariant?: ProductVariant | null;
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
  selectedOrFirstAvailableVariant: ProductVariant | null;
  adjacentVariants: ProductVariant[];
  encodedVariantExistence: string;
  encodedVariantAvailability: string;
}

/**
 * QuickShopModal - A modal component that displays product info for quick shopping
 * Matches Mavon's quick-view modal design with product gallery, info, and add to cart form
 */
export function QuickShopModal({
  isOpen,
  onClose,
  onAddToCart,
  productHandle,
}: QuickShopModalProps) {
  const fetcher = useFetcher<{product: QuickShopProduct}>({key: `quick-shop-${productHandle}`});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [product, setProduct] = useState<QuickShopProduct | null>(null);
  // Handle add to cart - close modal (cart drawer is opened by the button directly)
  const handleAddToCart = useCallback(() => {
    // Close the modal
    onClose();
    // Also call the parent callback if provided
    onAddToCart?.();
  }, [onClose, onAddToCart]);

  // Fetch product data when modal opens (only if not already loaded)
  useEffect(() => {
    if (isOpen && productHandle && fetcher.state === 'idle' && !product) {
      fetcher.load(`/api/quick-shop/${productHandle}`);
    }
  }, [isOpen, productHandle, fetcher, product]);

  // Store product data in local state when fetcher loads it
  useEffect(() => {
    if (fetcher.data?.product && !product) {
      setProduct(fetcher.data.product);
      const variant = fetcher.data.product.selectedOrFirstAvailableVariant;
      setSelectedVariant(variant);
    }
  }, [fetcher.data, product]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProduct(null);
      setSelectedVariant(null);
    }
  }, [isOpen]);

  // Build mapped options based on selected variant
  const mappedOptions = useMemo(() => {
    if (!product || !selectedVariant) return [];

    // Get all variants for availability checking
    const allVariants = [
      product.selectedOrFirstAvailableVariant,
      ...product.adjacentVariants,
      ...(product.options?.flatMap((opt) =>
        opt.optionValues
          .map((val) => val.firstSelectableVariant)
          .filter(Boolean),
      ) || []),
    ].filter((v): v is ProductVariant => v !== null && v !== undefined);

    // Remove duplicates by ID
    const uniqueVariants = Array.from(
      new Map(allVariants.map((v) => [v.id, v])).values()
    );

    return product.options.map((option) => {
      const selectedOptionValue = selectedVariant.selectedOptions.find(
        (opt) => opt.name === option.name
      )?.value;

      return {
        name: option.name,
        optionValues: option.optionValues.map((optValue) => {
          // Check if this option value is selected
          const isSelected = selectedOptionValue === optValue.name;

          // Check if a variant exists with this option value
          const variantWithOption = uniqueVariants.find((variant) =>
            variant.selectedOptions.some(
              (opt) => opt.name === option.name && opt.value === optValue.name
            )
          );

          // Check availability - does a variant exist that is available for sale?
          const isAvailable = uniqueVariants.some(
            (variant) =>
              variant.availableForSale &&
              variant.selectedOptions.some(
                (opt) => opt.name === option.name && opt.value === optValue.name
              )
          );

          return {
            name: optValue.name,
            selected: isSelected,
            available: isAvailable,
            exists: !!variantWithOption,
            swatch: optValue.swatch,
            firstSelectableVariant: optValue.firstSelectableVariant,
          };
        }),
      };
    });
  }, [product, selectedVariant]);

  // Handle variant selection
  const handleVariantChange = useCallback((newVariant: ProductVariant) => {
    setSelectedVariant(newVariant);
  }, []);

  // Handle keyboard escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVariant(null);
    }
  }, [isOpen]);

  // Don't render on server or when closed
  if (!isOpen || typeof document === 'undefined') return null;

  // Only show loading on initial load when product hasn't been loaded yet
  const isLoading = !product;

  // Use portal to render modal at document body level (fixes z-index issues with sliders)
  return createPortal(
    <div
      className="quick-shop-modal fixed inset-0 z-999 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quick shop"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="quick-shop-modal__content relative bg-background rounded-[10px] shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors text-foreground"
          onClick={onClose}
          aria-label="Close quick shop"
        >
          <CloseIcon />
        </button>

        {isLoading || !product ? (
          <div className="flex items-center justify-center p-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="quick-shop-modal__inner grid grid-cols-1 md:grid-cols-2 gap-0 max-h-[90vh] overflow-y-auto">
            {/* Left Column - Product Gallery */}
            <div className="quick-shop-modal__gallery p-6 bg-foreground/[0.02]">
              <ProductGallery
                images={product.images?.nodes || []}
                selectedVariantImage={selectedVariant?.image}
                aspectRatio="adapt"
                imageZoom="none"
                className="quick-shop-gallery"
              />
            </div>

            {/* Right Column - Product Info */}
            <div className="quick-shop-modal__info p-6 overflow-y-auto">
              {/* Vendor */}
              <ProductVendor
                vendor={product.vendor}
                showLabel={true}
                linkToVendor={true}
                className="text-[14px] text-foreground/70 mb-2"
                classNameLink="no-underline hover:underline"
              />

              {/* Title */}
              <h2 className="quick-shop-modal__title text-[24px] font-heading font-semibold leading-tight mb-4">
                {product.title}
              </h2>

              {/* Price */}
              <div className="quick-shop-modal__price mb-4">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                  groupClassName="flex items-center gap-3"
                  className="text-[18px] leading-none text-foreground"
                  compareClassName="text-foreground/50 leading-none line-through"
                />
              </div>

              {/* Stock Indicator */}
              <div className="quick-shop-modal__stock mb-6">
                <ProductStock
                  quantity={selectedVariant?.quantityAvailable ?? 0}
                  lowStockThreshold={10}
                  availableForSale={selectedVariant?.availableForSale}
                  inventoryManagement="shopify"
                  inventoryPolicy={selectedVariant?.currentlyNotInStock ? 'continue' : 'deny'}
                  showInventoryQuantity={true}
                  showProgressBar={true}
                />
              </div>

              {/* Product Form (Options, Quantity, Add to Cart, Buy Now) */}
              <QuickShopProductForm
                product={product}
                mappedOptions={mappedOptions}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
                onClose={onClose}
                onAddToCart={handleAddToCart}
              />

              {/* View Full Details Link */}
              <Link
                to={`/products/${product.handle}`}
                className="quick-shop-modal__view-full flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity mt-6"
                onClick={onClose}
              >
                <span className="underline">View full details</span>
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin w-8 h-8 text-foreground/30"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
