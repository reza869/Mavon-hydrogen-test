import {Image, Money, CartForm} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useState} from 'react';
import type {CSSProperties} from 'react';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

interface ComplementaryProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
  priceRange: {
    minVariantPrice: MoneyV2;
  };
  compareAtPriceRange?: {
    minVariantPrice: MoneyV2;
  } | null;
  variants: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      price: MoneyV2;
      compareAtPrice?: MoneyV2 | null;
    }>;
  };
  options: Array<{
    name: string;
    optionValues: Array<{name: string}>;
  }>;
}

interface ComplementaryProductsProps {
  /** Array of complementary products */
  products: ComplementaryProduct[];
  /** Section title */
  title?: string;
  /** Number of products to show per page */
  itemsPerPage?: number;
  /** Whether the section is expanded (controlled mode) */
  isExpanded?: boolean;
  /** Callback when expand state changes (controlled mode) */
  onToggle?: () => void;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * Displays complementary products ("Pairs well with") section.
 * Shows product image, title, price, and add to cart/quick shop button.
 */
export function ComplementaryProducts({
  products,
  title = 'Pairs well with',
  itemsPerPage = 3,
  isExpanded: controlledExpanded,
  onToggle,
  className = '',
  style = {},
}: ComplementaryProductsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [internalExpanded, setInternalExpanded] = useState(true);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);   
    }
  };

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className={`complementary-products ${className}`.trim()}
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '12px',
        ...style,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: isExpanded ? '16px' : 0,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <PairsIcon />
          <span style={{fontSize: '16px', fontWeight: 600, color: '#1a1a1a'}}>
            {title}
          </span>
        </div>
        <ChevronIcon isExpanded={isExpanded} />
      </button>

      {/* Products List */}
      {isExpanded && (
        <>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {visibleProducts.map((product, index) => (
              <ComplementaryProductItem
                key={product.id}
                product={product}
                index={startIndex + index + 1}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
              }}
            >
              <button
                type="button"
                onClick={goToPrev}
                style={paginationButtonStyle}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({length: totalPages}, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToPage(i)}
                  style={{
                    ...paginationDotStyle,
                    backgroundColor: currentPage === i ? '#1a1a1a' : 'transparent',
                    border: currentPage === i ? 'none' : '1px solid #ccc',
                  }}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={goToNext}
                style={paginationButtonStyle}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ComplementaryProductItem({
  product,
  index,
}: {
  product: ComplementaryProduct;
  index: number;
}) {
  const firstVariant = product.variants.nodes[0];
  const hasVariants = product.options.some(
    (opt) => opt.optionValues.length > 1
  );
  const isAvailable = firstVariant?.availableForSale ?? false;
  const hasCompareAtPrice =
    product.compareAtPriceRange?.minVariantPrice &&
    parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
      parseFloat(product.priceRange.minVariantPrice.amount);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {/* Product Image */}
      <Link
        to={`/products/${product.handle}`}
        style={{
          width: '64px',
          height: '64px',
          flexShrink: 0,
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            aspectRatio="1/1"
            sizes="64px"
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '10px',
            }}
          >
            No image
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div style={{flex: 1, minWidth: 0}}>
        <Link
          to={`/products/${product.handle}`}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1a1a1a',
            textDecoration: 'none',
            display: 'block',
            marginBottom: '4px',
          }}
        >
          {index}. {product.title}
        </Link>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          {hasCompareAtPrice && (
            <s style={{fontSize: '13px', color: '#999'}}>
              <Money data={product.compareAtPriceRange!.minVariantPrice} />
            </s>
          )}
          <span style={{fontSize: '13px', color: '#1a1a1a'}}>
            {hasVariants ? 'From ' : ''}
            <Money data={product.priceRange.minVariantPrice} />
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div style={{flexShrink: 0}}>
        {hasVariants ? (
          <Link
            to={`/products/${product.handle}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            + Quick Shop
          </Link>
        ) : (
          <AddToCartMini
            variantId={firstVariant?.id}
            disabled={!isAvailable}
          />
        )}
      </div>
    </div>
  );
}

function AddToCartMini({
  variantId,
  disabled,
}: {
  variantId?: string;
  disabled: boolean;
}) {
  if (!variantId || disabled) {
    return (
      <button
        type="button"
        disabled
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          border: '1px solid #e5e5e5',
          borderRadius: '4px',
          backgroundColor: '#f5f5f5',
          color: '#999',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <CartIcon /> Sold out
      </button>
    );
  }

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{
        lines: [{merchandiseId: variantId, quantity: 1}],
      }}
    >
      {(fetcher) => (
        <button
          type="submit"
          disabled={fetcher.state !== 'idle'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            border: '1px solid #e5e5e5',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <CartIcon />
          {fetcher.state !== 'idle' ? 'Adding...' : 'Add To Cart'}
        </button>
      )}
    </CartForm>
  );
}

// Icons
function PairsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ChevronIcon({isExpanded}: {isExpanded: boolean}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="14"
      height="14"
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

const paginationButtonStyle: CSSProperties = {
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '18px',
  color: '#666',
};

const paginationDotStyle: CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  padding: 0,
  cursor: 'pointer',
};
