import {Link, useNavigate} from 'react-router';
import {useState} from 'react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from '../Aside';
import {QuantitySelector} from './QuantitySelector';
import {BuyNowButton} from './BuyNowButton';
import type {ProductFragment} from 'storefrontapi.generated';

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

export function ProductForm({
  productOptions,
  selectedVariant,
  onSizeGuideClick,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  onSizeGuideClick?: () => void;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);

  const isColorOption = (optionName: string) => {
    return optionName.toLowerCase() === 'color' || optionName.toLowerCase() === 'colour';
  };

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        const isColor = isColorOption(option.name);
        const selectedValue = option.optionValues.find((v) => v.selected)?.name;

        return (
          <div className="product-options mb-[20px]" key={option.name}>
            <p className='mb-4 leading-normal'>
              <strong>{option.name}</strong>: <span>{selectedValue}</span>
            </p>
            <div className="product-options-grid flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                // Color swatch wrapper classes - outer ring with padding for white space
                // Border: 1px, Padding: 2px, Inner color: 35px = Total: 35 + 2*2 + 1*2 = 41px
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
                  // Color swatch with ring effect
                  if (isDifferentProduct) {
                    return (
                      <Link
                        className={`product-options-item ${colorSwatchWrapperClasses}`}
                        key={option.name + name}
                        prefetch="intent"
                        preventScrollReset
                        replace
                        to={`/products/${handle}?${variantUriQuery}`}
                        title={name}
                        data-selected={selected || undefined}
                      >
                        <span
                          className="color-swatch-inner w-[35px] h-[35px] rounded-full overflow-hidden flex items-center justify-center"
                          style={{backgroundColor}}
                        >
                          <ColorSwatch swatch={swatch} name={name} />
                        </span>
                        {!available && <UnavailableCrossLine />}
                      </Link>
                    );
                  } else {
                    return (
                      <button
                        type="button"
                        className={`product-options-item ${colorSwatchWrapperClasses} ${exists && !selected ? 'links' : ''}`}
                        key={option.name + name}
                        disabled={!exists}
                        title={name}
                        data-selected={selected || undefined}
                        onClick={() => {
                          if (!selected) {
                            void navigate(`?${variantUriQuery}`, {
                              replace: true,
                              preventScrollReset: true,
                            });
                          }
                        }}
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
                  }
                } else {
                  // Size/other options
                  if (isDifferentProduct) {
                    return (
                      <Link
                        className={`product-options-item ${sizeButtonClasses}`}
                        key={option.name + name}
                        prefetch="intent"
                        preventScrollReset
                        replace
                        to={`/products/${handle}?${variantUriQuery}`}
                        title={name}
                      >
                        {name}
                      </Link>
                    );
                  } else {
                    return (
                      <button
                        type="button"
                        className={`product-options-item ${sizeButtonClasses} ${exists && !selected ? 'links' : ''}`}
                        key={option.name + name}
                        disabled={!exists}
                        title={name}
                        onClick={() => {
                          if (!selected) {
                            void navigate(`?${variantUriQuery}`, {
                              replace: true,
                              preventScrollReset: true,
                            });
                          }
                        }}
                      >
                        {name}
                      </button>
                    );
                  }
                }
              })}
            </div>
          </div>
        );
      })}

      {/* Size Guide Link */}
      {onSizeGuideClick && (
      <button
        type="button"
        className="product-form__size-guide flex items-center gap-2 mb-4 text-foreground hover:opacity-70 transition-opacity"
        onClick={onSizeGuideClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
        <span className="text-[1.4rem] underline">Size Guide</span>
      </button>
      )}

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
          <AddToCartButton
            disabled={!selectedVariant || !selectedVariant.availableForSale}
            className="button button--secondary product-form__add-to-cart inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
            onClick={() => {
              open('cart');
            }}
            lines={
              selectedVariant
                ? [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity,
                      selectedVariant,
                    },
                  ]
                : []
            }
          >
            {selectedVariant?.availableForSale ? 'Add To Cart' : 'Sold Out'}
          </AddToCartButton>
        </div>

        {/* Buy Now Button - visible but disabled when sold out */}
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

function ColorSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
      />
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
