import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './product/ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
  index = 1,
}: {
  layout: CartLayout;
  line: CartLine;
  index?: number;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  if (layout === 'aside') {
    return (
      <li key={id} className="flex gap-8 py-6">
        {/* Product Image - larger */}
        {image && (
          <Link
            to={lineItemUrl}
            onClick={close}
            className="shrink-0"
          >
            <Image
              alt={title}
              data={image}
              width={100}
              height={130}
              className="w-49 h-65 object-cover rounded bg-[rgba(var(--color-foreground),0.04)]"
            />
          </Link>
        )}

        {/* Product Details */}
        <div className="flex-1 flex flex-col min-w-0 gap-2">
          {/* Title */}
          <Link
            to={lineItemUrl}
            onClick={close}
            className="text-[1.6rem] font-medium text-[rgb(var(--color-foreground))] hover:underline leading-tight"
          >
            {product.title}
          </Link>

          {/* Variant Options */}
          <div className="mt-1 text-[1.4rem] text-[rgba(var(--color-foreground),0.75)]">
            {selectedOptions.map((opt, i) => (
              <span key={opt.name}>
                {opt.name}: {opt.value}
                {i < selectedOptions.length - 1 && ', '}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="mt-1 text-[1.5rem] font-medium text-[rgb(var(--color-foreground))]">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>

          {/* Quantity Controls */}
          <CartLineQuantityAside line={line} />
        </div>
      </li>
    );
  }

  // Page layout (table row)
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <tr className="cart-item" id={`CartItem-${index}`}>
      {/* Product Image */}
      <td className="w-40 max-[749px]:w-[80px] pt-16 max-[749px]:py-6 align-top">
        {image && (
          <Link prefetch="intent" to={lineItemUrl} className="block">
            <Image
              alt={title}
              data={image}
              
              loading="lazy"
            
              className="max-[749px]:w-[70px] h-auto object-cover bg-[rgba(var(--color-foreground),0.04)]"
            />
          </Link>
        )}
      </td>

      {/* Product Details */}
      <td className="w-200 max-[749px]:py-6 pt-16 pl-16 max-[749px]:pl-5 align-top">
        <span className="block text-[1.4rem] text-[rgba(var(--color-foreground),0.6)] mb-2">
          {product.vendor || 'Mavon - Fashion Shopify Theme'}
        </span>
        <Link
          prefetch="intent"
          to={lineItemUrl}
          className="block text-[1.6rem] font-medium underline text-[rgb(var(--color-foreground))] leading-[1.4] hover:no-underline"
        >
          {product.title}
        </Link>
        <dl className="mt-3">
          {selectedOptions.map((option) => (
            <div key={option.name} className="text-[1.4rem] text-[rgba(var(--color-foreground),0.6)] leading-[1.6]">
              <dt className="inline">{option.name}:</dt>
              <dd className="inline">{option.value}</dd>
            </div>
          ))}
        </dl>
        {/* Mobile quantity controls - shown only on mobile */}
        <div className="hidden max-[749px]:flex mt-4">
          <div className="flex items-center gap-6">
            <div className="inline-flex items-center border border-[rgba(var(--color-foreground),0.1)] rounded-full overflow-hidden">
              <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
                <button
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || !!isOptimistic}
                  name="decrease-quantity"
                  value={prevQuantity}
                  className="w-11 h-11 flex items-center justify-center bg-transparent border-none cursor-pointer text-[rgb(var(--color-foreground))] text-[1.6rem] transition-colors hover:bg-[rgba(var(--color-foreground),0.04)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span aria-hidden="true">−</span>
                </button>
              </CartLineUpdateButton>
              <input
                type="number"
                className="w-10 h-11 text-center border-x border-[rgba(var(--color-foreground),0.1)] text-[1.4rem] bg-transparent text-[rgb(var(--color-foreground))] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={quantity}
                readOnly
                aria-label="Quantity"
              />
              <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
                <button
                  aria-label="Increase quantity"
                  name="increase-quantity"
                  value={nextQuantity}
                  disabled={!!isOptimistic}
                  className="w-11 h-11 flex items-center justify-center bg-transparent border-none cursor-pointer text-[rgb(var(--color-foreground))] text-[1.6rem] transition-colors hover:bg-[rgba(var(--color-foreground),0.04)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span aria-hidden="true">+</span>
                </button>
              </CartLineUpdateButton>
            </div>
            <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} asIcon />
          </div>
        </div>
      </td>

      {/* Mobile Total (hidden on desktop) */}
      <td className="hidden max-[749px]:table-cell py-10 max-[749px]:py-6 px-4 align-middle text-[1.6rem] font-normal text-[rgb(var(--color-foreground))] text-right pr-0">
        <ProductPrice price={line?.cost?.totalAmount} />
      </td>

      {/* Quantity Controls - Desktop only */}
      <td className="w-80 max-[749px]:hidden pt-16 pl-24 text-left align-top">
        <div className="flex items-center gap-6">
          <div className="inline-flex items-center border border-[rgba(var(--color-foreground),0.1)] rounded-full overflow-hidden">
            <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
              <button
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || !!isOptimistic}
                name="decrease-quantity"
                value={prevQuantity}
                className="w-16 h-16 flex items-center justify-center bg-transparent border-none cursor-pointer text-[rgb(var(--color-foreground))] text-[1.6rem] transition-colors hover:bg-[rgba(var(--color-foreground),0.04)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span aria-hidden="true">−</span>
              </button>
            </CartLineUpdateButton>
            <input
              type="number"
              className="w-16 h-16 text-center text-[1.4rem] bg-transparent text-[rgb(var(--color-foreground))] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={quantity}
              readOnly
              aria-label="Quantity"
            />
            <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
              <button
                aria-label="Increase quantity"
                name="increase-quantity"
                value={nextQuantity}
                disabled={!!isOptimistic}
                className="w-16 h-16 flex items-center justify-center bg-transparent border-none cursor-pointer text-[rgb(var(--color-foreground))] text-[1.6rem] transition-colors hover:bg-[rgba(var(--color-foreground),0.04)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span aria-hidden="true">+</span>
              </button>
            </CartLineUpdateButton>
          </div>
          <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} asIcon />
        </div>
      </td>

      {/* Desktop Total (hidden on mobile) */}
      <td className="w-40 max-[749px]:hidden pl-16 pt-16 text-[1.6rem] font-normal text-[rgb(var(--color-foreground))] align-top text-right pr-0">
        <ProductPrice price={line?.cost?.totalAmount} />
      </td>
    </tr>
  );
}

/**
 * Quantity controls for aside/drawer layout
 */
function CartLineQuantityAside({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="mt-3 flex items-center gap-4">
      {/* Quantity box */}
      <div className="relative
          flex items-center
          w-[110px] h-[45px]
          border
          border-[rgba(var(--color-foreground),.08)]
          rounded-[5px]
          overflow-hidden">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="w-14 h-14 flex items-center justify-center text-[1.4rem] text-[rgb(var(--color-foreground))] hover:bg-[rgba(var(--color-foreground),0.04)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
        </CartLineUpdateButton>
        <span className="w-14 h-14 flex items-center justify-center text-[1.4rem] text-[rgb(var(--color-foreground))]">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="w-14 h-14 flex items-center justify-center text-[1.4rem] text-[rgb(var(--color-foreground))] hover:bg-[rgba(var(--color-foreground),0.04)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </CartLineUpdateButton>
      </div>

      {/* Remove link */}
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} asLink />
    </div>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity">
      <small>Quantity: {quantity} &nbsp;&nbsp;</small>
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span>&#8722; </span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          <span>&#43;</span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
  asLink = false,
  asIcon = false,
}: {
  lineIds: string[];
  disabled: boolean;
  asLink?: boolean;
  asIcon?: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className={
          asIcon
            ? "w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer text-[rgba(var(--color-foreground),0.5)] transition-colors hover:text-[rgb(var(--color-foreground))] disabled:opacity-40 disabled:cursor-not-allowed"
            : asLink
              ? "text-[1.6rem] text-[rgb(var(--color-foreground))] underline hover:no-underline disabled:opacity-40 disabled:cursor-not-allowed"
              : ""
        }
        aria-label="Remove item"
      >
        {asIcon ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        ) : (
          'Remove'
        )}
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
