import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  if (layout === 'aside') {
    return (
      <div className="flex flex-col h-full relative">
        {/* Scrollable cart items */}
        <div className="flex-1 overflow-y-auto px-5">
          <CartEmpty hidden={linesCount} layout={layout} />
          <ul>
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>

        {/* Fixed summary at bottom */}
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    );
  }

  // Page layout with table structure
  return (
    <div className="container color-scheme-1 pt-32">
      <CartEmpty hidden={linesCount} layout={layout} />
      {cartHasItems && (
        <div>
          <table className="w-full border-collapse mb-16">
            <thead>
              <tr>
                <th
                  colSpan={2}
                  className="w-[60%] text-left pb-7 border-b border-[rgba(var(--color-foreground),0.1)] text-[1.6rem] leading-[1.3] font-normal uppercase tracking-[0.13rem] text-[rgba(var(--color-foreground),0.75)]"
                  scope="col"
                >
                  Product
                </th>
                <th
                  className="hidden max-[749px]:table-cell text-right py-6 px-4 pr-0 border-b border-[rgba(var(--color-foreground),0.1)] text-[1rem] leading-[1.2] font-normal uppercase tracking-[0.13rem] text-[rgba(var(--color-foreground),0.75)]"
                  colSpan={1}
                  scope="col"
                >
                  Total
                </th>
                <th
                  className="max-[749px]:hidden pl-24 pb-7 border-b border-[rgba(var(--color-foreground),0.1)] text-[1.6rem] leading-[1.3] font-normal uppercase tracking-[0.13rem] text-[rgba(var(--color-foreground),0.75)] text-left"
                  colSpan={1}
                  scope="col"
                >
                  Quantity
                </th>
                <th
                  className="max-[749px]:hidden text-right pb-7 pl-16 border-b border-[rgba(var(--color-foreground),0.1)] text-[1.6rem] leading-[1.3] font-normal uppercase tracking-[0.13rem] text-[rgba(var(--color-foreground),0.75)]"
                  colSpan={1}
                  scope="col"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(cart?.lines?.nodes ?? []).map((line, index) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  index={index + 1}
                />
              ))}
            </tbody>
          </table>
          <CartSummary cart={cart} layout={layout} />
        </div>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();

  if (layout === 'aside') {
    return (
      <div hidden={hidden} className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-16 h-16 text-[rgba(var(--color-foreground),0.1)] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p className="text-[1.5rem] text-[rgba(var(--color-foreground),0.75)] mb-4">
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you started!
        </p>
        <Link
          to="/collections/all"
          onClick={close}
          prefetch="viewport"
          className="inline-block px-6 py-3 bg-[rgb(var(--color-button))] text-[rgb(var(--color-button-text))] rounded-full text-[1.4rem] font-medium hover:bg-[rgb(var(--primary-button-hover-background))] transition-colors"
        >
          Continue shopping →
        </Link>
      </div>
    );
  }

  return (
    <div hidden={hidden} className="flex flex-col items-center justify-center text-center py-20">
      {/* Main heading */}
      <h1 className="text-[3.2rem] font-bold text-[rgb(var(--color-foreground))] mb-8">
        Your cart is empty
      </h1>

      {/* Continue shopping button */}
      <Link
        to="/collections"
        onClick={close}
        prefetch="viewport"
        className="inline-block px-8 py-4 bg-[rgb(var(--color-foreground))] text-[rgb(var(--color-background))] rounded-full text-[1.4rem] font-medium hover:opacity-90 transition-opacity mb-16"
      >
        Continue shopping
      </Link>

      {/* Login section */}
      <h2 className="text-[2rem] font-bold text-[rgb(var(--color-foreground))] mb-2">
        Have an account?
      </h2>
      <p className="text-[1.5rem] text-[rgba(var(--color-foreground),0.75)]">
        <Link
          to="/account/login"
          className="underline text-[rgb(var(--color-foreground))] hover:opacity-75 transition-opacity"
        >
          Log in
        </Link>
        {' '}to check out faster.
      </p>
    </div>
  );
}
