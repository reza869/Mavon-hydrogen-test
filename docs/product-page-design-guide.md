# Product Page Design Guide

This document provides detailed instructions to build a product page matching the reference design.

---

## Table of Contents

1. [Design Overview](#design-overview)
2. [Layout Structure](#layout-structure)
3. [Component Breakdown](#component-breakdown)
4. [Required Components to Build](#required-components-to-build)
5. [Styling Specifications](#styling-specifications)
6. [Implementation Steps](#implementation-steps)

---

## Design Overview

The product page follows a **two-column layout** on desktop:
- **Left Column (50%)**: Product images (main image + thumbnail gallery)
- **Right Column (50%)**: Product information and actions

### Key Features
- Vendor name above title
- Sale badges (SALE + percentage)
- Stock availability indicator with progress bar
- Color swatches with labels
- Size selector buttons
- Quantity selector with +/- buttons
- Add to Cart button
- Buy it now button

### Features NOT Needed (per user request)
- ~~Pickup availability section~~
- ~~Ask a question~~
- ~~Description accordion~~
- ~~Reviews accordion~~
- ~~Terms and conditions accordion~~
- ~~Social share buttons~~

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PRODUCT PAGE                               │
├────────────────────────────────┬────────────────────────────────────────┤
│                                │  Vendor: Vendor Name                   │
│                                │                                        │
│                                │  Product Title                         │
│                                │                                        │
│                                │  $79.00  $69.00  [SALE] [-13%]        │
│      MAIN PRODUCT IMAGE        │                                        │
│                                │  ████████████████░░░░ 94 in stock     │
│         (Square 1:1)           │                                        │
│                                │  Color: Empire Porcelain               │
│                                │  [○ Gray] [● Red]                      │
│                                │                                        │
│                                │  Size: 28                              │
│                                │  [28] [30] [32] [34] [36]             │
│                                │                                        │
│                                │  Quantity                              │
│                                │  [-] [1] [+]    [Add To Cart]         │
│                                │                                        │
│                                │  [      Buy it now      ]              │
│                                │                                        │
├────────────────────────────────┼────────────────────────────────────────┤
│  [img1] [img2] [img3] [img4]   │                                        │
│      THUMBNAIL GALLERY         │                                        │
└────────────────────────────────┴────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Product Vendor
- **Position**: Above product title
- **Style**: Gray text, small font size
- **Format**: "Vendor: {vendor_name}"

### 2. Product Title
- **Style**: Large, bold, black text
- **Font Size**: ~32px
- **Font Weight**: 700 (Bold)

### 3. Price Section
- **Compare-at Price**: Strikethrough, gray color
- **Sale Price**: Bold, black color
- **Badges**:
  - "SALE" - outline style, black border
  - "-13%" - solid black background, white text

### 4. Stock Availability
- **Text**: "{quantity} in stock" - Green color
- **Progress Bar**: Green fill showing stock level
- **Position**: Below price section

### 5. Color Selector
- **Label**: "Color: {selected_color_name}"
- **Swatches**: Circular color buttons
- **Selected State**: Border highlight
- **Size**: ~32px diameter circles

### 6. Size Selector
- **Label**: "Size: {selected_size}"
- **Buttons**: Rectangular with border
- **Selected State**: Filled background (black)
- **Unselected State**: White background, gray border

### 7. Quantity Selector
- **Label**: "Quantity"
- **Controls**: Minus (-), Input field, Plus (+)
- **Style**: Bordered container with rounded corners

### 8. Add to Cart Button
- **Style**: Outline/bordered button
- **Icon**: Cart icon before text
- **Text**: "Add To Cart"

### 9. Buy it Now Button
- **Style**: Solid black background
- **Text**: White, centered
- **Width**: Full width

### 10. Thumbnail Gallery
- **Position**: Below main image
- **Layout**: Horizontal row
- **Items**: 4-5 thumbnails
- **Selected State**: Border highlight

---

## Required Components to Build

### New Components Needed

| Component | File Path | Description |
|-----------|-----------|-------------|
| `ProductStock` | `app/components/ProductStock.tsx` | Stock availability with progress bar |
| `QuantitySelector` | `app/components/QuantitySelector.tsx` | +/- quantity input |
| `BuyNowButton` | `app/components/BuyNowButton.tsx` | Direct checkout button |
| `ProductGallery` | `app/components/ProductGallery.tsx` | Main image + thumbnails |

### Existing Components to Modify

| Component | Modifications |
|-----------|---------------|
| `ProductForm` | Add quantity selector, restructure layout |
| `ProductPrice` | Already updated for sale display |
| `ProductVendor` | Already created |
| `ProductBadge` | Already created (NewBadge, SaleBadge) |

---

## Styling Specifications

### Colors

| Element | Color Code |
|---------|------------|
| Primary Text | `#1a1a1a` |
| Secondary Text (Vendor, Labels) | `#666666` |
| Sale Price | `#1a1a1a` |
| Compare-at Price | `#999999` |
| In Stock Text | `#22c55e` (Green) |
| Stock Progress Bar | `#22c55e` (Green) |
| Selected Option Border | `#1a1a1a` |
| Button Primary (Buy Now) | `#1a1a1a` |
| Button Text (Buy Now) | `#ffffff` |
| SALE Badge Border | `#1a1a1a` |
| Percentage Badge BG | `#1a1a1a` |

### Typography

| Element | Font Size | Font Weight |
|---------|-----------|-------------|
| Vendor | 14px | 400 |
| Title | 32px | 700 |
| Price (Current) | 18px | 600 |
| Price (Compare-at) | 16px | 400 |
| Stock Text | 14px | 500 |
| Option Labels | 14px | 500 |
| Option Values | 14px | 400 |
| Button Text | 14px | 600 |

### Spacing

| Element | Margin/Padding |
|---------|----------------|
| Section Gap | 16px - 24px |
| Option Group Gap | 12px |
| Button Gap | 12px |
| Thumbnail Gap | 8px |

### Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 4px |
| Color Swatches | 50% (circle) |
| Size Buttons | 4px |
| Quantity Input | 24px (pill shape) |
| Buy Now Button | 30px (pill shape) |

---

## Implementation Steps

### Step 1: Create ProductStock Component

```tsx
// app/components/ProductStock.tsx

interface ProductStockProps {
  quantity: number;
  maxQuantity?: number;
  lowStockThreshold?: number;
}

export function ProductStock({
  quantity,
  maxQuantity = 100,
  lowStockThreshold = 10,
}: ProductStockProps) {
  const percentage = Math.min((quantity / maxQuantity) * 100, 100);
  const isLowStock = quantity <= lowStockThreshold;

  return (
    <div className="product-stock">
      <p style={{color: isLowStock ? '#ef4444' : '#22c55e', fontSize: '14px', fontWeight: 500}}>
        {quantity} in stock
      </p>
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: '#e5e5e5',
        borderRadius: '2px',
        marginTop: '4px',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: isLowStock ? '#ef4444' : '#22c55e',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
```

### Step 2: Create QuantitySelector Component

```tsx
// app/components/QuantitySelector.tsx

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const increase = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="quantity-selector">
      <label style={{fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block'}}>
        Quantity
      </label>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid #e5e5e5',
        borderRadius: '24px',
        overflow: 'hidden',
      }}>
        <button
          type="button"
          onClick={decrease}
          disabled={quantity <= min}
          style={{
            width: '40px',
            height: '40px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          −
        </button>
        <input
          type="text"
          value={quantity}
          readOnly
          style={{
            width: '40px',
            textAlign: 'center',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        />
        <button
          type="button"
          onClick={increase}
          disabled={quantity >= max}
          style={{
            width: '40px',
            height: '40px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
```

### Step 3: Create BuyNowButton Component

```tsx
// app/components/BuyNowButton.tsx

interface BuyNowButtonProps {
  variantId: string;
  quantity?: number;
  disabled?: boolean;
}

export function BuyNowButton({
  variantId,
  quantity = 1,
  disabled = false,
}: BuyNowButtonProps) {
  const handleBuyNow = () => {
    // Redirect to checkout with variant
    const checkoutUrl = `/cart/${variantId}:${quantity}?checkout=true`;
    window.location.href = checkoutUrl;
  };

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px 24px',
        backgroundColor: disabled ? '#ccc' : '#1a1a1a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '30px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginTop: '12px',
      }}
    >
      Buy it now
    </button>
  );
}
```

### Step 4: Create ProductGallery Component

```tsx
// app/components/ProductGallery.tsx

import {Image} from '@shopify/hydrogen';
import {useState} from 'react';

interface ProductGalleryProps {
  images: Array<{
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  }>;
  selectedVariantImage?: {
    id?: string;
    url: string;
    altText?: string | null;
  } | null;
}

export function ProductGallery({images, selectedVariantImage}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Use variant image if available, otherwise use gallery
  const displayImages = images.length > 0 ? images : [];
  const mainImage = selectedVariantImage || displayImages[activeIndex];

  return (
    <div className="product-gallery">
      {/* Main Image */}
      <div style={{
        aspectRatio: '1/1',
        backgroundColor: '#f5f5f5',
        marginBottom: '8px',
        overflow: 'hidden',
      }}>
        {mainImage && (
          <Image
            data={mainImage}
            aspectRatio="1/1"
            sizes="(min-width: 45em) 50vw, 100vw"
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        )}
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
        }}>
          {displayImages.map((image, index) => (
            <button
              key={image.id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              style={{
                width: '80px',
                height: '80px',
                padding: 0,
                border: activeIndex === index ? '2px solid #1a1a1a' : '2px solid transparent',
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Image
                data={image}
                aspectRatio="1/1"
                sizes="80px"
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 5: Update ProductForm Component

Modify the existing `ProductForm.tsx` to include quantity selector and restructure the layout:

```tsx
// Key changes to ProductForm.tsx:
// 1. Add quantity state
// 2. Include QuantitySelector component
// 3. Update AddToCartButton to use quantity
// 4. Add BuyNowButton
// 5. Style option buttons as per design
```

### Step 6: Update Product Page Layout

```tsx
// app/routes/products.$handle.tsx

return (
  <div className="product" style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  }}>
    {/* Left Column - Gallery */}
    <ProductGallery
      images={product.images.nodes}
      selectedVariantImage={selectedVariant?.image}
    />

    {/* Right Column - Product Info */}
    <div className="product-main">
      <ProductVendor vendor={product.vendor} size="sm" />

      <h1 style={{fontSize: '32px', fontWeight: 700, margin: '8px 0 16px'}}>
        {title}
      </h1>

      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <SaleBadge
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
          size="sm"
        />
      </div>

      <ProductStock quantity={94} />

      <div style={{marginTop: '24px'}}>
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
      </div>
    </div>
  </div>
);
```

### Step 7: Style Color Swatches

Update color option rendering in `ProductForm.tsx`:

```tsx
// For color options, render as circles
{option.name.toLowerCase() === 'color' ? (
  <div style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: getColorValue(value.name), // Map color names to hex
    border: selected ? '2px solid #1a1a1a' : '2px solid #e5e5e5',
    cursor: 'pointer',
  }} />
) : (
  // Regular button for size options
  <button style={{
    padding: '8px 16px',
    border: selected ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
    backgroundColor: selected ? '#1a1a1a' : '#ffffff',
    color: selected ? '#ffffff' : '#1a1a1a',
    borderRadius: '4px',
    cursor: 'pointer',
  }}>
    {value.name}
  </button>
)}
```

---

## GraphQL Updates

### Add images to Product Fragment

```graphql
fragment Product on Product {
  # ... existing fields
  images(first: 10) {
    nodes {
      id
      url
      altText
      width
      height
    }
  }
}
```

### Add inventory tracking (optional)

```graphql
fragment ProductVariant on ProductVariant {
  # ... existing fields
  quantityAvailable
}
```

---

## CSS Classes Reference

```css
/* Product Page Layout */
.product {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 768px) {
  .product {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

/* Product Title */
.product h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 8px 0 16px;
  line-height: 1.2;
}

/* Price Section */
.product-price-on-sale {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-price-on-sale s {
  color: #999;
  font-size: 16px;
}

/* Option Buttons */
.product-options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Add to Cart Button */
.add-to-cart-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.add-to-cart-button:hover {
  background: #f5f5f5;
}

/* Buy Now Button */
.buy-now-button {
  width: 100%;
  padding: 14px 24px;
  background: #1a1a1a;
  color: #ffffff;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
}

.buy-now-button:hover {
  background: #333;
}

/* Thumbnail Gallery */
.thumbnail-gallery {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.thumbnail-gallery button {
  flex-shrink: 0;
}
```

---

## File Checklist

### Components to Create
- [ ] `app/components/ProductStock.tsx`
- [ ] `app/components/QuantitySelector.tsx`
- [ ] `app/components/BuyNowButton.tsx`
- [ ] `app/components/ProductGallery.tsx`

### Components to Update
- [ ] `app/components/ProductForm.tsx` - Add quantity, restructure layout
- [ ] `app/routes/products.$handle.tsx` - Update page layout

### GraphQL Updates
- [ ] Add `images` to Product fragment
- [ ] Add `quantityAvailable` to ProductVariant fragment (optional)

### Styling
- [ ] Update `app/styles/app.css` with new classes

---

## Summary

This design guide covers all the essential components needed to replicate the product page design. The key elements are:

1. **Two-column layout** with image gallery on left, product info on right
2. **Vendor display** above title
3. **Price with sale badges** (SALE + percentage)
4. **Stock indicator** with progress bar
5. **Color swatches** as circles
6. **Size selector** as buttons
7. **Quantity selector** with +/- controls
8. **Add to Cart** button (outline style)
9. **Buy it now** button (solid black, pill shape)
10. **Thumbnail gallery** below main image

The excluded sections (per user request) are pickup availability, ask a question, description/reviews/terms accordions, and social share buttons.
