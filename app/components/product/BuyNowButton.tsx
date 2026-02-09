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
  /** Custom className for button */
  className?: string;
  /** Custom className for disabled state */
  disabledClassName?: string;
  /** Processing text */
  processingText?: string;
}

/**
 * A "Buy it now" button that redirects directly to checkout.
 * Styles are passed via className props for reusability.
 */
export function BuyNowButton({
  variantId,
  quantity = 1,
  disabled = false,
  children = 'Buy it now',
  className = '',
  disabledClassName = '',
  processingText = 'Processing...',
}: BuyNowButtonProps) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`buy-now-button ${className} ${disabledClassName}`.trim()}
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
          formAction="/cart?redirect=checkout"
        >
          {fetcher.state !== 'idle' ? processingText : children}
        </button>
      )}
    </CartForm>
  );
}
