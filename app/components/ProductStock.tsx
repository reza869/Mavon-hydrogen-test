import type {CSSProperties} from 'react';

interface ProductStockProps {
  /** Available quantity */
  quantity: number;
  /** Maximum quantity for progress bar calculation */
  maxQuantity?: number;
  /** Threshold below which stock is considered "low" */
  lowStockThreshold?: number;
  /** Whether the variant is available for sale (overrides quantity check) */
  availableForSale?: boolean;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * Displays stock availability with a progress bar indicator.
 * Shows green for normal stock, red for low stock or out of stock.
 */
export function ProductStock({
  quantity,
  maxQuantity = 100,
  lowStockThreshold = 10,
  availableForSale = true,
  className = '',
  style = {},
}: ProductStockProps) {
  const isOutOfStock = !availableForSale || quantity <= 0;
  const isLowStock = !isOutOfStock && quantity <= lowStockThreshold;

  // Determine color: red for out of stock or low stock, green for normal
  const stockColor = isOutOfStock || isLowStock ? '#ef4444' : '#22c55e';

  // Calculate percentage (0% for out of stock)
  const percentage = isOutOfStock
    ? 0
    : Math.min((quantity / maxQuantity) * 100, 100);

  // Determine text
  const stockText = isOutOfStock ? 'Out of stock' : `${quantity} in stock`;

  return (
    <div className={`product-stock ${className}`.trim()} style={style}>
      <p
        style={{
          color: stockColor,
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '6px',
        }}
      >
        {stockText}
      </p>
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e5e5e5',
          borderRadius: '2px',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: stockColor,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
