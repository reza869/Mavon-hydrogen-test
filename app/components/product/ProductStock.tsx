import type {CSSProperties} from 'react';

/**
 * Stock status types matching Mavon's inventory states
 */
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'continue_selling';

interface ProductStockProps {
  /** Available quantity */
  quantity: number;
  /** Threshold below which stock is considered "low" (default: 10, matching Mavon) */
  lowStockThreshold?: number;
  /** Whether the variant is available for sale */
  availableForSale?: boolean;
  /** Whether inventory is managed by Shopify (if false, component won't render) */
  inventoryManagement?: string | null;
  /** Inventory policy - 'continue' allows selling when out of stock */
  inventoryPolicy?: 'deny' | 'continue';
  /** Whether to show the exact quantity count */
  showInventoryQuantity?: boolean;
  /** Whether to show the progress bar */
  showProgressBar?: boolean;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Custom colors for each stock status (RGB triplet format: "r, g, b") */
  colors?: {
    inStock?: string;
    lowStock?: string;
    outOfStock?: string;
    continueSelling?: string;
    progressBackground?: string;
  };
}

/**
 * Default colors matching Mavon's inventory status design
 * Using RGB triplet format for consistency with Mavon's CSS variables
 */
const DEFAULT_COLORS = {
  inStock: '62, 214, 96',        // Green
  lowStock: '238, 148, 65',       // Red
  outOfStock: '200, 200, 200',     // Red
  continueSelling: '62, 214, 96', // Yellow/Amber
  progressBackground: '229, 229, 229', // Light gray
};

/**
 * Calculates the progress bar width using Mavon's logic:
 * - Formula: (quantity * 100) / 30
 * - Capped at 65% to avoid visual overflow
 * - Returns 0 for negative quantities
 */
function calculateProgressWidth(quantity: number): number {
  if (quantity < 0) return 0;

  const width = (quantity * 100) / 30;

  // Cap at 65% as per Mavon's logic (when width > 70, set to 65)
  return width > 70 ? 65 : width;
}

/**
 * Determines the stock status based on quantity and settings
 */
function getStockStatus(
  quantity: number,
  availableForSale: boolean,
  lowStockThreshold: number,
  inventoryPolicy: 'deny' | 'continue',
): StockStatus {
  if (quantity > 0) {
    return quantity <= lowStockThreshold ? 'low_stock' : 'in_stock';
  }

  // Out of stock scenarios
  if (inventoryPolicy === 'continue') {
    return 'continue_selling';
  }

  return 'out_of_stock';
}

/**
 * Gets the display text for the stock status
 */
function getStockText(
  status: StockStatus,
  quantity: number,
  showQuantity: boolean,
): string {
  switch (status) {
    case 'in_stock':
      return showQuantity ? `${quantity} in stock` : 'In stock';
    case 'low_stock':
      return showQuantity ? `Only ${quantity} left in stock` : 'Low stock';
    case 'out_of_stock':
      return 'Out of stock';
    case 'continue_selling':
      return 'Available on backorder';
    default:
      return '';
  }
}

/**
 * ProductStock - Displays stock availability with progress bar indicator
 *
 * Matches Mavon's inventory-status.liquid and main-product.liquid logic:
 * - Shows only when inventory is managed by Shopify
 * - Progress bar width: (quantity * 100) / 30, capped at 65%
 * - Four status states: in_stock, low_stock, out_of_stock, continue_selling
 * - Color-coded status text and progress bar
 *
 * @example
 * // Basic usage
 * <ProductStock
 *   quantity={selectedVariant?.quantityAvailable ?? 0}
 *   availableForSale={selectedVariant?.availableForSale}
 * />
 *
 * @example
 * // With custom threshold and quantity display
 * <ProductStock
 *   quantity={15}
 *   lowStockThreshold={20}
 *   showInventoryQuantity={true}
 *   showProgressBar={true}
 * />
 */
export function ProductStock({
  quantity,
  lowStockThreshold = 10,
  availableForSale = true,
  inventoryManagement = 'shopify',
  inventoryPolicy = 'deny',
  showInventoryQuantity = true,
  showProgressBar = true,
  className = '',
  style = {},
  colors = {},
}: ProductStockProps) {
  // Only render if inventory is managed by Shopify (matching Mavon's logic)
  if (inventoryManagement !== 'shopify') {
    return null;
  }

  const mergedColors = { ...DEFAULT_COLORS, ...colors };

  const status = getStockStatus(
    quantity,
    availableForSale,
    lowStockThreshold,
    inventoryPolicy,
  );

  const progressWidth = calculateProgressWidth(quantity);
  const stockText = getStockText(status, quantity, showInventoryQuantity);

  // Get the appropriate color based on status
  const statusColor = {
    in_stock: mergedColors.inStock,
    low_stock: mergedColors.lowStock,
    out_of_stock: mergedColors.outOfStock,
    continue_selling: mergedColors.continueSelling,
  }[status];

  return (
    <div
      className={`product-variant-inventory ${className}`.trim()}
      style={{
        maxWidth: '50rem',
        ...style,
      }}
    >
      <div className="product-variant-inventory--inner">
        {/* Stock Status Text */}
        <div
          className="product__inventory"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              color: `rgb(${statusColor})`
            }}
          >
            {stockText}
          </span>
        </div>

        {/* Progress Bar */}
        {showProgressBar && (
          <div
            className="stock_countdown_progress w-full h-[6px] rounded-[3px]"
            style={{
              background: `rgb(${mergedColors.progressBackground})`,
            }}
          >
            <span
              className="stock_progress_bar block h-full rounded-l-[3px] transition-[width] duration-[0.2s] ease-linear"
              style={{
                background: `rgb(${statusColor})`,
                width: `${progressWidth}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
