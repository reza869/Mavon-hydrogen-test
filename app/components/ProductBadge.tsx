import type {CSSProperties} from 'react';

export type BadgeVariant = 'solid' | 'outline' | 'soft';
export type BadgeColor = 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'orange' | 'black';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface ProductBadgeProps {
  /** The text to display in the badge */
  label: string;
  /** Badge style variant */
  variant?: BadgeVariant;
  /** Badge color theme */
  color?: BadgeColor;
  /** Badge size */
  size?: BadgeSize;
  /** Custom className for additional styling */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

const colorStyles: Record<BadgeColor, Record<BadgeVariant, CSSProperties>> = {
  green: {
    solid: {backgroundColor: '#22c55e', color: '#ffffff'},
    outline: {backgroundColor: 'transparent', color: '#22c55e', border: '1px solid #22c55e'},
    soft: {backgroundColor: '#dcfce7', color: '#166534'},
  },
  red: {
    solid: {backgroundColor: '#ef4444', color: '#ffffff'},
    outline: {backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444'},
    soft: {backgroundColor: '#fee2e2', color: '#991b1b'},
  },
  blue: {
    solid: {backgroundColor: '#3b82f6', color: '#ffffff'},
    outline: {backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6'},
    soft: {backgroundColor: '#dbeafe', color: '#1e40af'},
  },
  yellow: {
    solid: {backgroundColor: '#eab308', color: '#ffffff'},
    outline: {backgroundColor: 'transparent', color: '#eab308', border: '1px solid #eab308'},
    soft: {backgroundColor: '#fef9c3', color: '#854d0e'},
  },
  purple: {
    solid: {backgroundColor: '#a855f7', color: '#ffffff'},
    outline: {backgroundColor: 'transparent', color: '#a855f7', border: '1px solid #a855f7'},
    soft: {backgroundColor: '#f3e8ff', color: '#6b21a8'},
  },
  orange: {
    solid: {backgroundColor: '#f97316', color: '#ffffff'},
    outline: {backgroundColor: 'transparent', color: '#f97316', border: '1px solid #f97316'},
    soft: {backgroundColor: '#ffedd5', color: '#9a3412'},
  },
  black: {
    solid: {backgroundColor: '#1f2937', color: '#ffffff'},
    outline: {backgroundColor: 'transparent', color: '#1f2937', border: '1px solid #1f2937'},
    soft: {backgroundColor: '#f3f4f6', color: '#1f2937'},
  },
};

const sizeStyles: Record<BadgeSize, CSSProperties> = {
  sm: {fontSize: '10px', padding: '2px 6px'},
  md: {fontSize: '12px', padding: '4px 10px'},
  lg: {fontSize: '14px', padding: '6px 14px'},
};

/**
 * A customizable badge component for displaying product labels like "NEW", "SALE", etc.
 */
export function ProductBadge({
  label,
  variant = 'solid',
  color = 'green',
  size = 'md',
  className = '',
  style = {},
}: ProductBadgeProps) {
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...colorStyles[color][variant],
    ...style,
  };

  return (
    <span className={`product-badge ${className}`.trim()} style={baseStyles}>
      {label}
    </span>
  );
}

interface NewBadgeProps {
  /** The date value from metafield (ISO date string or Date object) */
  newUntilDate?: string | Date | null;
  /** Badge style variant */
  variant?: BadgeVariant;
  /** Badge color theme */
  color?: BadgeColor;
  /** Badge size */
  size?: BadgeSize;
  /** Custom label text (default: "NEW") */
  label?: string;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * A "NEW" badge that only displays if the current date is before the metafield date.
 * Uses the product metafield `meta.product_new_badge` (date type).
 */
export function NewBadge({
  newUntilDate,
  variant = 'solid',
  color = 'green',
  size = 'md',
  label = 'NEW',
  className = '',
  style = {},
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
      variant={variant}
      color={color}
      size={size}
      className={className}
      style={style}
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
  /** Badge style variant */
  variant?: BadgeVariant;
  /** Badge color theme */
  color?: BadgeColor;
  /** Badge size */
  size?: BadgeSize;
  /** Show percentage discount */
  showPercentage?: boolean;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * A "SALE" badge that displays when a product has a compare-at price.
 * Shows "Sold out" badge (black) when variant is not available, with discount percentage if on sale.
 * Optionally shows the discount percentage alongside the SALE text.
 */
export function SaleBadge({
  price,
  compareAtPrice,
  availableForSale = true,
  variant = 'solid',
  color = 'red',
  size = 'md',
  showPercentage = true,
  className = '',
  style = {},
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

  // Show "Sold out" badge (black) if not available, with discount percentage if on sale
  if (!availableForSale) {
    return (
      <div style={{display: 'inline-flex', gap: '4px'}}>
        <ProductBadge
          label="Sold out"
          variant="solid"
          color="black"
          size={size}
          className={className}
          style={style}
        />
        {hasDiscount && showPercentage && (
          <ProductBadge
            label={`-${discountPercent}%`}
            variant={variant}
            color="black"
            size={size}
            className={className}
            style={style}
          />
        )}
      </div>
    );
  }

  // Don't render if no sale
  if (!hasDiscount) return null;

  return (
    <div style={{display: 'inline-flex', gap: '4px'}}>
      <ProductBadge
        label="SALE"
        variant="outline"
        color={color}
        size={size}
        className={className}
        style={style}
      />
      {showPercentage && (
        <ProductBadge
          label={`-${discountPercent}%`}
          variant={variant}
          color="black"
          size={size}
          className={className}
          style={style}
        />
      )}
    </div>
  );
}
