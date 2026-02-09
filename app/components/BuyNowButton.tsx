import type {CSSProperties} from 'react';
import {CartForm} from '@shopify/hydrogen';

interface BuyNowButtonProps {
  /** The variant ID to purchase */
  variantId: string;
  /** Quantity to purchase */
  quantity?: number;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom button text */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * A "Buy it now" button that redirects directly to checkout.
 * Full-width, solid black, pill-shaped design.
 */
export function BuyNowButton({
  variantId,
  quantity = 1,
  disabled = false,
  children = 'Buy it now',
  className = '',
  style = {},
}: BuyNowButtonProps) {
  const baseStyle: CSSProperties = {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: disabled ? '#ccc' : '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginTop: '12px',
    transition: 'background-color 0.2s ease',
    ...style,
  };

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`buy-now-button ${className}`.trim()}
        style={baseStyle}
      >
        {children}
      </button>
    );
  }

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{
        lines: [
          {
            merchandiseId: variantId,
            quantity,
          },
        ],
      }}
    >
      {(fetcher) => (
        <button
          type="submit"
          disabled={fetcher.state !== 'idle'}
          className={`buy-now-button ${className}`.trim()}
          style={baseStyle}
          formAction="/cart?redirect=checkout"
        >
          {fetcher.state !== 'idle' ? 'Processing...' : children}
        </button>
      )}
    </CartForm>
  );
}
