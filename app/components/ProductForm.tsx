import {Link, useNavigate} from 'react-router';
import {useState} from 'react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
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
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
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
          <div className="product-options" key={option.name} style={{marginBottom: '20px'}}>
            <p style={{fontSize: '14px', fontWeight: 500, marginBottom: '10px', color: '#1a1a1a'}}>
              {option.name}: <span style={{fontWeight: 400}}>{selectedValue}</span>
            </p>
            <div
              className="product-options-grid"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
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

                const optionStyle = isColor
                  ? getColorSwatchStyle(name, swatch, selected, available)
                  : getSizeButtonStyle(selected, available, exists);

                if (isDifferentProduct) {
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{...optionStyle, position: 'relative' as const}}
                      title={name}
                    >
                      {isColor ? (
                        <ColorSwatch swatch={swatch} name={name} />
                      ) : (
                        name
                      )}
                      {!available && isColor && <UnavailableCrossLine />}
                    </Link>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      className={`product-options-item${exists && !selected ? ' link' : ''}`}
                      key={option.name + name}
                      style={{...optionStyle, position: 'relative' as const}}
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
                      {isColor ? (
                        <ColorSwatch swatch={swatch} name={name} />
                      ) : (
                        name
                      )}
                      {!available && isColor && <UnavailableCrossLine />}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      {/* Quantity Selector and Add to Cart - Inline Layout */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <QuantitySelector
          quantity={quantity}
          onChange={setQuantity}
          min={1}
          max={99}
        />
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
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

      {/* Buy Now Button */}
      {selectedVariant && selectedVariant.availableForSale && (
        <BuyNowButton
          variantId={selectedVariant.id}
          quantity={quantity}
          disabled={!selectedVariant.availableForSale}
        />
      )}
    </div>
  );
}

function getColorSwatchStyle(
  name: string,
  swatch: Maybe<ProductOptionValueSwatch> | undefined,
  selected: boolean,
  available: boolean
): React.CSSProperties {
  return {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    padding: 0,
    border: selected ? '2px solid #1a1a1a' : '2px solid #e5e5e5',
    opacity: available ? 1 : 0.4,
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: swatch?.color || getColorValue(name),
  };
}

function getSizeButtonStyle(
  selected: boolean,
  available: boolean,
  exists: boolean
): React.CSSProperties {
  return {
    padding: '8px 16px',
    minWidth: '48px',
    border: '1px solid #e5e5e5',
    backgroundColor: selected ? '#1a1a1a' : '#ffffff',
    color: selected ? '#ffffff' : '#1a1a1a',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    opacity: selected ? 1 : available ? 1 : 0.4,
    transition: 'all 0.2s ease',
  };
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
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  }

  // Color is handled by the parent button's backgroundColor
  return null;
}

function UnavailableCrossLine() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '140%',
          height: '1px',
          backgroundColor: '#666',
          transform: 'rotate(-45deg)',
        }}
      />
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}
