import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

interface AddToCartButtonProps {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  /** Show cart icon before text */
  showIcon?: boolean;
  /** Custom className for button */
  className?: string;
  /** Custom className for icon */
  iconClassName?: string;
  /** Loading text */
  loadingText?: string;
}

/**
 * Add to cart button with cart icon.
 * Styles are passed via className props for reusability.
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  showIcon = true,
  className = '',
  iconClassName = '',
  loadingText = 'Adding...',
}: AddToCartButtonProps) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        const isLoading = fetcher.state !== 'idle';

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled ?? isLoading}
              className={`add-to-cart-btn ${className}`.trim()}
            >
              {showIcon && <CartIcon className={iconClassName} />}
              {isLoading ? loadingText : children}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}

function CartIcon({className = ''}: {className?: string}) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
