# Product Page Documentation (`products.$handle.tsx`)

This document provides a comprehensive explanation of how the Shopify Hydrogen product page works.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Route Pattern](#route-pattern)
4. [Data Loading (Loader)](#data-loading-loader)
5. [React Component](#react-component)
6. [GraphQL Queries](#graphql-queries)
7. [Child Components](#child-components)
8. [Data Flow Diagram](#data-flow-diagram)
9. [Key Hydrogen Hooks & Functions](#key-hydrogen-hooks--functions)
10. [Customization Guide](#customization-guide)

---

## Overview

The `products.$handle.tsx` file is a **React Router route** that renders individual product pages. When a user visits `/products/some-product-handle`, this file:

1. Fetches product data from Shopify's Storefront API
2. Handles variant selection (size, color, etc.)
3. Renders the product image, price, options, and add-to-cart functionality
4. Tracks analytics for product views

---

## File Structure

```
products.$handle.tsx
├── Imports
├── meta() - SEO metadata
├── loader() - Server-side data fetching
│   ├── loadCriticalData() - Essential data (blocks render)
│   └── loadDeferredData() - Non-essential data (lazy loaded)
├── Product() - React component
└── GraphQL Fragments & Queries
    ├── PRODUCT_VARIANT_FRAGMENT
    ├── PRODUCT_FRAGMENT
    └── PRODUCT_QUERY
```

---

## Route Pattern

| Pattern | Example URL | Param Value |
|---------|-------------|-------------|
| `products.$handle` | `/products/blue-t-shirt` | `handle = "blue-t-shirt"` |
| `products.$handle` | `/products/winter-jacket?Size=Large` | `handle = "winter-jacket"` |

The `$handle` is a **dynamic segment** that captures the product's URL handle from Shopify.

---

## Data Loading (Loader)

### Main Loader Function

```tsx
export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);      // Non-blocking
  const criticalData = await loadCriticalData(args); // Blocking (await)
  return {...deferredData, ...criticalData};
}
```

### Critical Data (`loadCriticalData`)

This function fetches **essential data** that MUST be available before the page renders.

```tsx
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;                    // Get product handle from URL
  const {storefront} = context;               // Shopify Storefront API client

  // Fetch product with selected options from URL query params
  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request)  // e.g., ?Size=Large&Color=Blue
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});  // Product not found
  }

  return { product };
}
```

**Key Points:**
- Uses `Promise.all()` for parallel queries (add more queries here for efficiency)
- Throws 404 if product doesn't exist
- `getSelectedProductOptions(request)` extracts variant options from URL query string

### Deferred Data (`loadDeferredData`)

This function is for **non-critical data** that can load after the page renders.

```tsx
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Examples: product reviews, recommendations, related products
  return {};
}
```

**Use Cases:**
- Product reviews
- Related products
- Social proof data
- Inventory counts

---

## React Component

### Main Component Structure

```tsx
export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // 1. Optimistic variant selection
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // 2. Sync URL with selected variant
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // 3. Get mapped product options for UI
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <div className="product">
      <ProductImage image={selectedVariant?.image} />
      <div className="product-main">
        <h1>{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
      </div>
      <Analytics.ProductView data={{...}} />
    </div>
  );
}
```

### Component Rendering Flow

```
1. useLoaderData() → Get product data from loader
           ↓
2. useOptimisticVariant() → Determine selected variant (instant UI updates)
           ↓
3. useSelectedOptionInUrlParam() → Sync URL with selection
           ↓
4. getProductOptions() → Map options for form rendering
           ↓
5. Render: Image → Title → Price → Form → Description → Analytics
```

---

## GraphQL Queries

### PRODUCT_VARIANT_FRAGMENT

Defines the fields fetched for each product variant:

```graphql
fragment ProductVariant on ProductVariant {
  availableForSale      # Boolean: Can this variant be purchased?
  compareAtPrice {      # Original price (for sale display)
    amount
    currencyCode
  }
  id                    # Variant ID (used for cart)
  image {               # Variant-specific image
    id, url, altText, width, height
  }
  price {               # Current price
    amount
    currencyCode
  }
  product {             # Parent product info
    title, handle
  }
  selectedOptions {     # e.g., [{name: "Size", value: "Large"}]
    name, value
  }
  sku                   # Stock Keeping Unit
  title                 # Variant title (e.g., "Large / Blue")
  unitPrice {           # Price per unit (for bulk items)
    amount, currencyCode
  }
}
```

### PRODUCT_FRAGMENT

Defines the main product fields:

```graphql
fragment Product on Product {
  id
  title
  vendor
  handle
  descriptionHtml
  description
  encodedVariantExistence    # Encoded data for variant existence checks
  encodedVariantAvailability # Encoded data for availability checks
  options {                  # Product options (Size, Color, etc.)
    name
    optionValues {
      name
      firstSelectableVariant { ...ProductVariant }
      swatch { color, image { previewImage { url } } }
    }
  }
  selectedOrFirstAvailableVariant(
    selectedOptions: $selectedOptions,
    ignoreUnknownOptions: true,
    caseInsensitiveMatch: true
  ) { ...ProductVariant }
  adjacentVariants(selectedOptions: $selectedOptions) { ...ProductVariant }
  seo { description, title }
}
```

### PRODUCT_QUERY

The main query that fetches everything:

```graphql
query Product(
  $country: CountryCode
  $handle: String!
  $language: LanguageCode
  $selectedOptions: [SelectedOptionInput!]!
) @inContext(country: $country, language: $language) {
  product(handle: $handle) {
    ...Product
  }
}
```

**Note:** The `@inContext` directive enables localization (currency, language).

---

## Child Components

### 1. ProductImage (`ProductImage.tsx`)

Renders the product image using Hydrogen's optimized `<Image>` component.

```tsx
export function ProductImage({ image }) {
  if (!image) return <div className="product-image" />;

  return (
    <div className="product-image">
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
    </div>
  );
}
```

**Features:**
- Automatic responsive images
- Lazy loading
- Aspect ratio enforcement

---

### 2. ProductPrice (`ProductPrice.tsx`)

Displays price with optional compare-at price (sale pricing).

```tsx
export function ProductPrice({ price, compareAtPrice }) {
  return (
    <div className="product-price">
      {compareAtPrice ? (
        <div className="product-price-on-sale">
          <Money data={price} />        {/* Current price */}
          <s><Money data={compareAtPrice} /></s>  {/* Strikethrough original */}
        </div>
      ) : price ? (
        <Money data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
```

**The `<Money>` component:**
- Formats currency automatically
- Respects locale settings

---

### 3. ProductForm (`ProductForm.tsx`)

Handles variant selection and add-to-cart functionality.

```tsx
export function ProductForm({ productOptions, selectedVariant }) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="product-form">
      {/* Render each option (Size, Color, etc.) */}
      {productOptions.map((option) => (
        <div key={option.name}>
          <h5>{option.name}</h5>
          <div className="product-options-grid">
            {option.optionValues.map((value) => {
              // Render as Link (different product) or Button (same product)
              if (value.isDifferentProduct) {
                return <Link to={`/products/${value.handle}?${value.variantUriQuery}`} />;
              } else {
                return <button onClick={() => navigate(`?${value.variantUriQuery}`)} />;
              }
            })}
          </div>
        </div>
      ))}

      {/* Add to Cart Button */}
      <AddToCartButton
        disabled={!selectedVariant?.availableForSale}
        lines={[{ merchandiseId: selectedVariant.id, quantity: 1 }]}
        onClick={() => open('cart')}
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}
```

**Key Logic:**
- `isDifferentProduct`: True for combined listings (products linked by options)
- `exists`: Whether this variant combination exists
- `available`: Whether it's in stock
- `selected`: Currently selected option

---

### 4. AddToCartButton (`AddToCartButton.tsx`)

Wraps the add-to-cart action in Hydrogen's CartForm.

```tsx
export function AddToCartButton({ lines, disabled, onClick, children }) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <button
          type="submit"
          onClick={onClick}
          disabled={disabled ?? fetcher.state !== 'idle'}
        >
          {children}
        </button>
      )}
    </CartForm>
  );
}
```

**How it works:**
1. Submits to `/cart` route
2. Uses `LinesAdd` action to add items
3. Disables button while submitting
4. Opens cart aside on click

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER VISITS URL                             │
│                    /products/blue-t-shirt?Size=Large                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           LOADER (Server)                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. Extract handle: "blue-t-shirt"                           │   │
│  │ 2. Extract selectedOptions: [{name:"Size", value:"Large"}]  │   │
│  │ 3. Query Shopify Storefront API                             │   │
│  │ 4. Return product data                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         COMPONENT (Client)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ useLoaderData() → {product}                                 │   │
│  │ useOptimisticVariant() → selectedVariant                    │   │
│  │ getProductOptions() → productOptions                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ ProductImage │  │ ProductPrice │  │ ProductForm              │  │
│  │              │  │              │  │  ├─ Option Selectors     │  │
│  │  [Image]     │  │  $99.00      │  │  └─ AddToCartButton      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      USER SELECTS VARIANT                           │
│                         (clicks "XL")                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     OPTIMISTIC UPDATE                               │
│  1. URL updates: ?Size=XL (no page reload)                         │
│  2. useOptimisticVariant() instantly shows new variant             │
│  3. Image, price, availability update immediately                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Hydrogen Hooks & Functions

| Hook/Function | Purpose |
|---------------|---------|
| `useOptimisticVariant()` | Instantly updates UI when variant changes (no loading state) |
| `useSelectedOptionInUrlParam()` | Syncs selected options to URL query params |
| `getSelectedProductOptions()` | Parses variant options from request URL |
| `getProductOptions()` | Maps product options for UI rendering |
| `getAdjacentAndFirstAvailableVariants()` | Gets variant data for optimistic updates |
| `<Analytics.ProductView>` | Tracks product page views for Shopify analytics |
| `<Money>` | Formats currency values |
| `<Image>` | Optimized, responsive images |
| `<CartForm>` | Handles cart mutations |

---

## Customization Guide

### Adding a New Field to Product

1. **Add to GraphQL Fragment:**
```graphql
const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    # ... existing fields
    tags              # Add new field
    productType       # Add new field
  }
`;
```

2. **Use in Component:**
```tsx
const {title, descriptionHtml, tags, productType} = product;
```

### Adding Product Reviews (Deferred Data)

```tsx
function loadDeferredData({context, params}: Route.LoaderArgs) {
  const reviewsPromise = fetchReviews(params.handle);
  return { reviews: reviewsPromise };
}
```

### Adding a Quantity Selector

Modify `ProductForm.tsx` to include quantity input:

```tsx
<input
  type="number"
  min="1"
  value={quantity}
  onChange={(e) => setQuantity(Number(e.target.value))}
/>
```

Then update the `lines` prop:
```tsx
lines={[{ merchandiseId: selectedVariant.id, quantity: quantity }]}
```

### Adding Product Recommendations

1. Add query in `loadDeferredData`:
```tsx
const recommendationsPromise = storefront.query(RECOMMENDATIONS_QUERY, {
  variables: { productId: product.id }
});
```

2. Use `Suspense` in component:
```tsx
<Suspense fallback={<Loading />}>
  <Await resolve={recommendations}>
    {(data) => <ProductRecommendations products={data} />}
  </Await>
</Suspense>
```

---

## Summary

The product page is composed of:

| Layer | Responsibility |
|-------|----------------|
| **Route** | URL matching (`/products/:handle`) |
| **Loader** | Server-side data fetching from Shopify |
| **Component** | Client-side rendering and interactivity |
| **Hooks** | Variant selection, URL sync, optimistic updates |
| **GraphQL** | Defines what data to fetch |
| **Child Components** | Reusable UI pieces (Image, Price, Form) |

This architecture provides:
- Fast initial page loads (critical data only)
- Instant variant switching (optimistic updates)
- SEO-friendly URLs (query params for variants)
- Analytics tracking out of the box
