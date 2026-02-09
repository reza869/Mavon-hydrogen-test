import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import type {CSSProperties} from 'react';

interface AddToCartButtonProps {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  /** Show cart icon before text */
  showIcon?: boolean;
  /** Button style variant */
  variant?: 'primary' | 'secondary';
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  showIcon = true,
  variant = 'primary',
  className = 'button button--secondary',
  style = {},
}: AddToCartButtonProps) {
  const isPrimary = variant === 'primary';

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    ...style,
  };

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
              style={buttonStyle}
            >
              {showIcon && <CartIcon />}
              {isLoading ? 'Adding...' : children}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}

function CartIcon() {
  return (
    <svg
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
