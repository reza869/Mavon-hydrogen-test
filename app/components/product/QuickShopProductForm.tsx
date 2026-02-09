import {useState, useCallback} from 'react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import type {FetcherWithComponents} from 'react-router';
import {QuantitySelector} from './QuantitySelector';
import {BuyNowButton} from './BuyNowButton';
import {useAside} from '~/components/Aside';

// Color name to hex mapping for color swatches
const colorMap: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#eab308',
  purple: '#9333ea',
  pink: '#ec4899',
  orange: '#f97316',
  gray: '#6b7280',
  grey: '#6b7280',
  brown: '#92400e',
  navy: '#1e3a5a',
  beige: '#d4c4a8',
  cream: '#fffdd0',
  gold: '#ffd700',
  silver: '#c0c0c0',
  'empire porcelain': '#e8e4df',
  porcelain: '#e8e4df',
};

function getColorValue(colorName: string): string {
  const normalizedName = colorName.toLowerCase().trim();
  return colorMap[normalizedName] || '#cccccc';
}

interface ProductVariant {
  id: string;
  availableForSale: boolean;
  currentlyNotInStock?: boolean;
  quantityAvailable?: number;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  image?: {
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
  product: {
    title: string;
    handle: string;
  };
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  title: string;
}

interface QuickShopProduct {
  id: string;
  title: string;
  handle: string;
  vendor?: string;
  options: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      firstSelectableVariant?: ProductVariant | null;
      swatch?: {
        color?: string | null;
        image?: {
          previewImage?: {
            url: string;
          } | null;
        } | null;
      } | null;
    }>;
  }>;
  selectedOrFirstAvailableVariant: ProductVariant | null;
  adjacentVariants: ProductVariant[];
  encodedVariantExistence: string;
  encodedVariantAvailability: string;
}

interface MappedOption {
  name: string;
  optionValues: Array<{
    name: string;
    selected: boolean;
    available: boolean;
    exists: boolean;
    swatch?: {
      color?: string | null;
      image?: {
        previewImage?: {
          url: string;
        } | null;
      } | null;
    } | null;
    firstSelectableVariant?: ProductVariant | null;
  }>;
}

interface QuickShopProductFormProps {
  product: QuickShopProduct;
  mappedOptions: MappedOption[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
  onClose: () => void;
  onAddToCart?: () => void;
}

/**
 * QuickShopProductForm - A product form for the quick shop modal
 * Handles variant selection without URL navigation (stays in modal)
 */
export function QuickShopProductForm({
  product,
  mappedOptions,
  selectedVariant,
  onVariantChange,
  onClose,
  onAddToCart,
}: QuickShopProductFormProps) {
  const [quantity, setQuantity] = useState(1);

  const isColorOption = (optionName: string) => {
    return optionName.toLowerCase() === 'color' || optionName.toLowerCase() === 'colour';
  };

  // Handle option selection - find the variant with the new selection
  const handleOptionSelect = useCallback(
    (optionName: string, valueName: string) => {
      if (!selectedVariant) return;

      // Build new selected options
      const newSelectedOptions = selectedVariant.selectedOptions.map((opt) =>
        opt.name === optionName ? {...opt, value: valueName} : opt,
      );

      // Get all variants for matching
      const allVariants = [
        product.selectedOrFirstAvailableVariant,
        ...product.adjacentVariants,
        ...(product.options?.flatMap((opt) =>
          opt.optionValues
            .map((val) => val.firstSelectableVariant)
            .filter(Boolean),
        ) || []),
      ].filter((v): v is ProductVariant => v !== null && v !== undefined);

      // Remove duplicates
      const uniqueVariants = Array.from(
        new Map(allVariants.map((v) => [v.id, v])).values()
      );

      // Find matching variant
      const newVariant = uniqueVariants.find((variant) =>
        newSelectedOptions.every((newOpt) =>
          variant.selectedOptions.some(
            (varOpt) => varOpt.name === newOpt.name && varOpt.value === newOpt.value,
          ),
        ),
      );

      if (newVariant) {
        onVariantChange(newVariant);
      }
    },
    [selectedVariant, product, onVariantChange],
  );

  return (
    <div className="quick-shop-product-form">
      {mappedOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        const isColor = isColorOption(option.name);
        const selectedValue = option.optionValues.find((v) => v.selected)?.name;

        return (
          <div className="product-options mb-[20px]" key={option.name}>
            <p className="mb-4 leading-normal">
              <strong>{option.name}</strong>: <span>{selectedValue}</span>
            </p>
            <div className="product-options-grid flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {name, selected, available, exists, swatch} = value;

                // Color swatch wrapper classes
                const colorSwatchWrapperClasses = `
                  color-swatch-wrapper
                  w-[41px] h-[41px] rounded-full p-[2px] cursor-pointer
                  flex items-center justify-center relative
                  transition-all duration-200
                  border
                  ${selected ? 'border-foreground' : 'border-transparent hover:border-foreground/30'}
                  ${available ? 'opacity-100' : 'opacity-50'}
                `;

                // Size button classes
                const sizeButtonClasses = `
                  px-4 py-2 min-w-[48px] border border-[#e5e5e5] rounded-[5px] font-medium
                  cursor-pointer transition-all duration-200 relative
                  ${selected ? 'bg-foreground text-white' : 'bg-background text-[#1a1a1a]'}
                  ${selected ? 'opacity-100' : 'opacity-60'}
                `;

                const backgroundColor = swatch?.color || getColorValue(name);

                if (isColor) {
                  return (
                    <button
                      type="button"
                      className={`product-options-item ${colorSwatchWrapperClasses} ${exists && !selected ? 'links' : ''}`}
                      key={option.name + name}
                      disabled={!exists}
                      title={name}
                      data-selected={selected || undefined}
                      onClick={() => handleOptionSelect(option.name, name)}
                    >
                      <span
                        className="color-swatch-inner w-[35px] h-[35px] rounded-full overflow-hidden flex items-center justify-center"
                        style={{backgroundColor}}
                      >
                        <ColorSwatch swatch={swatch} name={name} />
                      </span>
                      {!available && <UnavailableCrossLine />}
                    </button>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      className={`product-options-item ${sizeButtonClasses} ${exists && !selected ? 'links' : ''}`}
                      key={option.name + name}
                      disabled={!exists}
                      title={name}
                      onClick={() => handleOptionSelect(option.name, name)}
                    >
                      {name}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      <div className="product-form__actions py-4">
        {/* Quantity Selector and Add to Cart - Inline Layout */}
        <div className="product-form__cart-row flex items-end gap-5 mb-6">
          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
            labelClassName="text-[1.4rem] font-medium mb-[0.8rem] block color-foreground"
            containerClassName="inline-flex items-center border border-foreground-20 rounded-[2.4rem] overflow-hidden bg-background h-[5rem]"
            decreaseClassName="quantity-btn w-[4rem] border-none bg-transparent cursor-pointer text-[1.8rem] leading-none color-foreground"
            increaseClassName="quantity-btn w-[4rem] border-none bg-transparent cursor-pointer text-[1.8rem] leading-none color-foreground"
            inputClassName="w-[4rem] text-center border-none text-[1.4rem] font-medium outline-none bg-transparent color-foreground"
            disabledClassName="!text-foreground-50 !cursor-not-allowed"
          />
          <CartForm
            route="/cart"
            inputs={{
              lines: selectedVariant
                ? [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity,
                      selectedVariant,
                    } as OptimisticCartLineInput,
                  ]
                : [],
            }}
            action={CartForm.ACTIONS.LinesAdd}
          >
            {(fetcher) => (
              <QuickShopAddToCartButton
                fetcher={fetcher}
                selectedVariant={selectedVariant}
                onAddToCart={onAddToCart}
              />
            )}
          </CartForm>
        </div>

        {/* Buy Now Button */}
        {selectedVariant && (
          <BuyNowButton
            variantId={selectedVariant.id}
            quantity={quantity}
            disabled={!selectedVariant.availableForSale}
            className="w-full button"
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Separate component for Add to Cart button to properly use hooks
 */
function QuickShopAddToCartButton({
  fetcher,
  selectedVariant,
  onAddToCart,
}: {
  fetcher: FetcherWithComponents<unknown>;
  selectedVariant: ProductVariant | null;
  onAddToCart?: () => void;
}) {
  const {open: openAside} = useAside();
  const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';

  // Call callback immediately when button is clicked
  // The cart uses optimistic updates, so it will show the item right away
  const handleClick = () => {
    if (selectedVariant?.availableForSale) {
      // Open cart drawer directly from this button
      // Small delay to let the form submission start first
      setTimeout(() => {
        openAside('cart');
        onAddToCart?.();
      }, 150);
    }
  };

  return (
    <button
      type="submit"
      disabled={!selectedVariant || !selectedVariant.availableForSale || isLoading}
      className="button button--secondary product-form__add-to-cart inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 min-w-[140px]"
      onClick={handleClick}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span>Adding...</span>
        </>
      ) : (
        <>
          <CartIcon />
          <span>{selectedVariant?.availableForSale ? 'Add To Cart' : 'Sold Out'}</span>
        </>
      )}
    </button>
  );
}

function ColorSwatch({
  swatch,
  name,
}: {
  swatch?: {
    color?: string | null;
    image?: {
      previewImage?: {
        url: string;
      } | null;
    } | null;
  } | null;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;

  if (image) {
    return (
      <img src={image} alt={name} className="w-full h-full object-cover" />
    );
  }

  // Color is handled by the parent button's backgroundColor
  return null;
}

function UnavailableCrossLine() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="absolute w-[140%] h-px bg-[#666] -rotate-45" />
    </div>
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

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
