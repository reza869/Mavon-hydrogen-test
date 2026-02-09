interface ProductBadgeProps {
  /** The text to display in the badge */
  label: string;
  /** Custom className for additional styling */
  className?: string;
  /** Color Scheme for additional styling */
  colorScheme?: string;
  /** Show percentage for additional styling */
  showPercentageItem?: boolean;
}

/**
 * A customizable badge component for displaying product labels like "NEW", "SALE", etc.
 */
export function ProductBadge({
  label,
  className,
  colorScheme
}: ProductBadgeProps) {
  return (
    <span
      className={`product-badge ${className}`}
      data-color-scheme={colorScheme}
    >
      {label}
    </span>
  );
}

interface NewBadgeProps {
  /** The date value from metafield (ISO date string or Date object) */
  newUntilDate?: string | Date | null;
  /** Color Scheme for additional styling */
  colorScheme?: string;
  /** Custom label text (default: "NEW") */
  label?: string;
  /** Custom className */
  className?: string;
}

/**
 * A "NEW" badge that only displays if the current date is before the metafield date.
 * Uses the product metafield `meta.product_new_badge` (date type).
 */
export function NewBadge({
  newUntilDate,
  label = 'NEW',
  colorScheme,
  className
}: NewBadgeProps) {
  // Don't render if no date provided
  if (!newUntilDate) return null;

  const expiryDate = new Date(newUntilDate);
  const today = new Date();

  // Don't render if the date is invalid or has passed
  if (isNaN(expiryDate.getTime()) || today > expiryDate) return null;

  return (
    <ProductBadge
      label={label}
      colorScheme={colorScheme}
      className={className}
    />
  );
}

interface SaleBadgeProps {
  /** Current price */
  price?: {amount: string};
  /** Compare at price (original price) */
  compareAtPrice?: {amount: string} | null;
  /** Whether the variant is available for sale */
  availableForSale?: boolean;
  /** Show percentage discount */
  showPercentage?: boolean;
  /** Show percentage discount for product item */
  showPercentageItem?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * A "SALE" badge that displays when a product has a compare-at price.
 * Shows "Sold out" badge (black) when variant is not available, with discount percentage if on sale.
 * Optionally shows the discount percentage alongside the SALE text.
 */
export function SaleBadge({
  price,
  compareAtPrice,
  availableForSale,
  showPercentage,
  showPercentageItem,
}: SaleBadgeProps) {
  // Calculate discount if there's a compare at price
  let discountPercent = 0;
  const hasDiscount =
    compareAtPrice &&
    price &&
    parseFloat(price.amount) < parseFloat(compareAtPrice.amount);

  if (hasDiscount) {
    const currentPrice = parseFloat(price.amount);
    const originalPrice = parseFloat(compareAtPrice.amount);
    discountPercent = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100,
    );
  }

  const discountPercentageSale = showPercentageItem ? `-${discountPercent}% SALE` : "SALE";
  // Show "Sold out" badge only (no discount percentage) if not available
  if (!availableForSale) {
    return (
      <ProductBadge
        label="Sold out"
        colorScheme="scheme-3"
        className="bg-background text-foreground leading-none py-[4px] px-[10px] block rounded-[3px] border border-foreground-10 text-[13px] tracking-[1px]"
      />
    );
  }

  // Don't render if no sale
  if (!hasDiscount) return null;

  return (
    <div className="flex items-center flex-row gap-[4px]">
      <ProductBadge
        label = {discountPercentageSale}
        colorScheme="scheme-5"
        className="bg-background text-foreground leading-none py-[4px] px-[10px] block rounded-[3px] border border-foreground-10 text-[13px] tracking-[1px]"
        showPercentageItem={showPercentageItem}
      />
      {showPercentage && !showPercentageItem && (
        <ProductBadge
          label={`-${discountPercent}%`}
          colorScheme="scheme-3"
          className="bg-background text-foreground leading-none py-[4px] px-[10px] block rounded-[3px] border border-foreground-10 text-[13px]"
        />
      )}
    </div>
  );
}