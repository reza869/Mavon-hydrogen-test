# Featured Collection Section

A highly customizable section component for displaying products from a specific collection on the homepage. Supports both slider and grid layouts with extensive styling options.

## Component Architecture

![Component Structure](./featuredCollectionSection.jpg)

```
FeaturedCollectionSection
 ├─ SliderHeadingWrapper
 │   ├─ SectionHeader (shared/common component)
 │   │   ├─ SectionTitle (left aligned)
 │   │   └─ Subheading (optional)
 │   └─ HeaderActions (right aligned)
 │       ├─ Button (optional, based on props)
 │       └─ SliderArrowButtons (optional, when navigationPosition="top")
 └─ CollectionContent
     ├─ ProductSlider (when enableSlider=true)
     │   └─ ProductItem (existing component)
     └─ ProductGrid (when enableSlider=false)
         └─ ProductItem (existing component)
```

## Components

| File | Description |
|------|-------------|
| [`app/components/sections/FeaturedCollectionSection.tsx`](../../app/components/sections/FeaturedCollectionSection.tsx) | Main section component that orchestrates all sub-components |
| [`app/components/shared/SectionHeader.tsx`](../../app/components/shared/SectionHeader.tsx) | Reusable section header with title, subheading, and actions slot |
| [`app/components/shared/SliderNavigation.tsx`](../../app/components/shared/SliderNavigation.tsx) | Slider navigation with arrows and pagination (counter/bullets/progressbar) |
| [`app/components/shared/ProductSlider.tsx`](../../app/components/shared/ProductSlider.tsx) | Generic product slider with CSS transform animations |
| [`app/components/ProductItem.tsx`](../../app/components/ProductItem.tsx) | Existing product card component (reused as-is) |
| [`app/lib/graphql/collection-queries.ts`](../../app/lib/graphql/collection-queries.ts) | GraphQL query for fetching collection by handle |
| [`app/styles/sections.css`](../../app/styles/sections.css) | Section-specific CSS styles |

---

## Props Reference

### SectionFeaturedCollection Props

#### Collection Settings

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `collection` | `string` | Yes | - | Collection handle to fetch products from |
| `maxProductToShow` | `number` | No | `8` | Maximum number of products to display |
| `desktopColumnNum` | `number` | No | `4` | Number of columns on desktop (2-6) |
| `mobileColumnNum` | `number` | No | `2` | Number of columns on mobile (1-2) |

#### Slider Settings

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `enableSlider` | `boolean` | No | `true` | Enable slider mode (false = grid) |
| `autoRotate` | `boolean` | No | `false` | Auto-rotate slides |
| `changesEvery` | `string` | No | `"5"` | Seconds between auto-rotation |
| `showPagination` | `boolean` | No | `true` | Show pagination indicator |
| `paginationType` | `"counter"` \| `"bullets"` \| `"progressbar"` | No | `"counter"` | Pagination display style |
| `showNavigation` | `boolean` | No | `true` | Show navigation arrows |
| `navigationIconType` | `"long-arrow"` \| `"chevron"` \| `"small-arrow"` | No | `"chevron"` | Arrow icon style |
| `buttonStyle` | `"square"` \| `"round"` \| `"noborder"` | No | `"round"` | Navigation button border style |
| `navigationPosition` | `"top"` \| `"middle"` \| `"bottom"` | No | `"top"` | Position of navigation controls |

#### Button Settings

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `showButton` | `boolean` | No | `true` | Show "View All" button |
| `buttonLabel` | `string` | No | `"See Collection"` | Button text |
| `buttonType` | `"primary"` \| `"secondary"` | No | `"secondary"` | Button variant |
| `buttonSize` | `"large"` \| `"medium"` \| `"small"` | No | `"medium"` | Button size |
| `buttonPosition` | `"top"` \| `"bottom"` | No | `"top"` | Button placement (top = header, bottom = after content) |

#### Section Header Settings

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `heading` | `string` | No | Collection title | Section heading text |
| `headingSize` | `"large"` \| `"medium"` \| `"small"` | No | `"large"` | Heading font size |
| `subheading` | `string` | No | - | Optional subheading text |
| `desktopHeadingAlignment` | `"left"` \| `"center"` \| `"right"` | No | `"left"` | Desktop text alignment |
| `mobileHeadingAlignment` | `"left"` \| `"center"` \| `"right"` | No | `"left"` | Mobile text alignment |

#### Section Styling

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `desktopPaddingTop` | `string` | No | `"80"` | Desktop top padding (px) |
| `desktopPaddingBottom` | `string` | No | `"80"` | Desktop bottom padding (px) |
| `mobilePaddingTop` | `string` | No | `"50"` | Mobile top padding (px) |
| `mobilePaddingBottom` | `string` | No | `"50"` | Mobile bottom padding (px) |
| `sectionColorScheme` | `"scheme-1"` \| `"scheme-2"` \| `"scheme-3"` \| `"scheme-4"` \| `"scheme-5"` | No | `"scheme-1"` | Color scheme for section |

---

### SliderHeadingWrapper Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `sectionHeader` | `boolean` | No | `true` | Show section header |
| `headerAction` | `boolean` | No | `true` | Show header actions (button/arrows) |

---

### SectionHeader Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `heading` | `string` | Yes | - | Main heading text |
| `headingSize` | `"large"` \| `"medium"` \| `"small"` | No | `"large"` | Heading size mapping to h1-h4 |
| `subheading` | `string` | No | - | Optional subheading below title |
| `desktopHeadingAlignment` | `"left"` \| `"center"` \| `"right"` | No | `"left"` | Desktop alignment |
| `mobileHeadingAlignment` | `"left"` \| `"center"` \| `"right"` | No | `"left"` | Mobile alignment |
| `actions` | `ReactNode` | No | - | Slot for buttons/navigation |
| `className` | `string` | No | - | Additional CSS classes |

---

### HeaderActions Props

Combines Button and SliderNavigation based on parent section props.

#### Button Props

| Prop | Type | Description |
|------|------|-------------|
| `buttonLabel` | `string` | Button text content |
| `buttonType` | `"primary"` \| `"secondary"` | Button variant style |
| `buttonSize` | `"large"` \| `"medium"` \| `"small"` | Button size |
| `buttonPosition` | `"top"` \| `"bottom"` | Determines if button appears in header or footer |

#### SliderNavigation Props

| Prop | Type | Description |
|------|------|-------------|
| `onPrevious` | `() => void` | Previous slide callback |
| `onNext` | `() => void` | Next slide callback |
| `canGoPrevious` | `boolean` | Enable/disable previous button |
| `canGoNext` | `boolean` | Enable/disable next button |
| `navigationIconType` | `"long-arrow"` \| `"chevron"` \| `"small-arrow"` | Arrow icon style |
| `buttonStyle` | `"square"` \| `"round"` \| `"noborder"` | Button border style |
| `showPagination` | `boolean` | Show pagination indicator |
| `paginationType` | `"counter"` \| `"bullets"` \| `"progressbar"` | Pagination style |
| `currentIndex` | `number` | Current slide index |
| `totalSlides` | `number` | Total number of slides |

---

### FeaturedCollectionContent Props

Renders either ProductSlider or ProductGrid based on `enableSlider` prop.

#### ProductSlider Props

| Prop | Type | Description |
|------|------|-------------|
| `products` | `ProductItemData[]` | Array of products to display |
| `desktopColumnNum` | `number` | Items visible on desktop |
| `mobileColumnNum` | `number` | Items visible on mobile |
| `currentIndex` | `number` | Current slide position |
| `onIndexChange` | `(index: number) => void` | Slide change callback |
| `autoRotate` | `boolean` | Enable auto-rotation |
| `changesEvery` | `number` | Auto-rotation interval (seconds) |

#### ProductGrid Props

| Prop | Type | Description |
|------|------|-------------|
| `products` | `ProductItemData[]` | Array of products to display |
| `desktopColumnNum` | `number` | Grid columns on desktop |
| `mobileColumnNum` | `number` | Grid columns on mobile |

---

## GraphQL Query

The section uses a dedicated query to fetch collection products by handle:

```graphql
query FeaturedCollectionByHandle(
  $handle: String!
  $first: Int!
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  collection(handle: $handle) {
    id
    handle
    title
    description
    products(first: $first) {
      nodes {
        ...ProductItem
      }
    }
  }
}
```

The query reuses the existing `PRODUCT_ITEM_FRAGMENT` from `ProductItem.tsx` which includes:
- Basic product info (id, handle, title, vendor)
- Images (featured + secondary for hover)
- Pricing (range + compare at price)
- Options with swatches for color variants
- Metafields for badges and countdown

---

## Usage Examples

### Basic Usage (Grid Layout)

```tsx
<FeaturedCollectionSection
  collection="best-sellers"
  enableSlider={false}
  desktopColumnNum={4}
  mobileColumnNum={2}
  maxProductToShow={8}
  heading="Best Sellers"
  showButton={true}
  buttonLabel="Shop All"
/>
```

### Slider with Auto-Rotation

```tsx
<FeaturedCollectionSection
  collection="new-arrivals"
  enableSlider={true}
  autoRotate={true}
  changesEvery="5"
  showPagination={true}
  paginationType="progressbar"
  showNavigation={true}
  navigationIconType="long-arrow"
  buttonStyle="noborder"
  navigationPosition="middle"
  heading="New Arrivals"
  headingSize="large"
  desktopHeadingAlignment="center"
  mobileHeadingAlignment="center"
  showButton={false}
  sectionColorScheme="scheme-2"
/>
```

### Full Configuration Example

```tsx
<FeaturedCollectionSection
  // Collection
  collection="featured-products"
  maxProductToShow={12}
  desktopColumnNum={4}
  mobileColumnNum={2}

  // Slider
  enableSlider={true}
  autoRotate={false}
  changesEvery="5"
  showPagination={true}
  paginationType="counter"
  showNavigation={true}
  navigationIconType="chevron"
  buttonStyle="round"
  navigationPosition="top"

  // Button
  showButton={true}
  buttonLabel="SEE COLLECTION"
  buttonType="secondary"
  buttonSize="medium"
  buttonPosition="top"

  // Header
  heading="Featured Collection"
  headingSize="large"
  subheading="Discover our curated selection"
  desktopHeadingAlignment="left"
  mobileHeadingAlignment="center"

  // Section styling
  desktopPaddingTop="80"
  desktopPaddingBottom="80"
  mobilePaddingTop="50"
  mobilePaddingBottom="50"
  sectionColorScheme="scheme-1"
/>
```

---

## Homepage Integration

### 1. Add Query to Loader

In `app/routes/($locale)._index.tsx`:

```tsx
import { FEATURED_COLLECTION_BY_HANDLE_QUERY } from '~/lib/graphql/collection-queries';

function loadDeferredData({context}: Route.LoaderArgs) {
  const featuredCollectionProducts = context.storefront
    .query(FEATURED_COLLECTION_BY_HANDLE_QUERY, {
      variables: {
        handle: 'featured-products',
        first: 8,
      },
    })
    .catch((error: Error) => {
      console.error('Featured collection error:', error);
      return null;
    });

  return {
    featuredCollectionProducts,
    // ... other deferred data
  };
}
```

### 2. Render Section

```tsx
import { FeaturedCollectionSection } from '~/components/sections/FeaturedCollectionSection';

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home">
      {/* Hero/Banner */}
      <FeaturedCollection collection={data.featuredCollection} />

      {/* Featured Collection Products */}
      <Suspense fallback={<div className="section--padding">Loading...</div>}>
        <Await resolve={data.featuredCollectionProducts}>
          {(collectionData) => collectionData?.collection && (
            <FeaturedCollectionSection
              collection={collectionData.collection}
              enableSlider={true}
              heading="Featured Collection"
              // ... other props
            />
          )}
        </Await>
      </Suspense>

      {/* Other sections */}
    </div>
  );
}
```

---

## Acceptance Criteria

| Requirement | Implementation |
|-------------|----------------|
| Reusable section header across multiple sections | `SectionHeader` component in `app/components/shared/` |
| Left side = title, Right side = button/arrows | Flexbox layout with `justify-content: space-between` |
| Navigation in header when `navigationPosition="top"` | Conditional render in `HeaderActions` component |
| Button in header when `buttonPosition="top"` | Conditional render in `HeaderActions` component |
| Button below content when `buttonPosition="bottom"` | Render after `CollectionContent` |
| Navigation middle position | Absolute positioned overlay on slider |
| Navigation bottom position | Below slider content |
| Grid mode when `enableSlider=false` | CSS Grid with dynamic columns |
| Slider mode when `enableSlider=true` | CSS transform-based slider |
| Collection handle with product limit | GraphQL query with `$handle` and `$first` variables |
| Uses existing ProductItem | Import and reuse with same props pattern |

---

## Styling Classes

### Section Container

```css
.featured-collection-section {
  /* Uses color scheme */
}

.featured-collection-section[data-color-scheme="scheme-1"] {
  /* Applies scheme-1 CSS variables */
}
```

### Section Header

```css
.section-header                    /* Main header wrapper */
.section-header--left              /* Left aligned */
.section-header--center            /* Center aligned */
.section-header__content           /* Title + subheading wrapper */
.section-header__title             /* Heading element */
.section-header__subheading        /* Subheading element */
.section-header__actions           /* Button + navigation wrapper */
```

### Slider Navigation

```css
.slider-arrow                      /* Base arrow button */
.slider-arrow--round               /* Rounded border */
.slider-arrow--square              /* Square border */
.slider-arrow--noborder            /* No border/background */
.slider-pagination--counter        /* "1 / 8" style */
.slider-pagination--bullets        /* Dot indicators */
.slider-pagination--progressbar    /* Progress bar */
```

### Product Display

```css
.product-slider                    /* Slider container */
.product-slider__track             /* Sliding track */
.product-slider__item              /* Individual slide */
.featured-products-grid            /* Grid container */
```

---

## File Structure

```
app/
├── components/
│   ├── sections/
│   │   ├── FeaturedCollectionSection.tsx
│   │   └── index.ts
│   ├── shared/
│   │   ├── SectionHeader.tsx
│   │   ├── SliderNavigation.tsx
│   │   └── ProductSlider.tsx
│   └── ProductItem.tsx (existing)
├── lib/
│   └── graphql/
│       └── collection-queries.ts
├── styles/
│   ├── sections.css (new)
│   └── tailwind.css (import sections.css)
└── routes/
    └── ($locale)._index.tsx (updated)
```

---

## Related Documentation

- [Product Item Component](../../app/components/ProductItem.tsx) - Product card props and usage
- [Color Schemes](../../app/styles/color-schemes.css) - Available color scheme definitions
- [Base Styles](../../app/styles/base.css) - Button classes and section padding
