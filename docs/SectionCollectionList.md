# SectionCollectionList Component

A reusable collection list section for displaying multiple collections in a slider or grid layout on the homepage.

## Overview

The Collection List section follows the same structure and styling pattern used across other homepage sections. It consists of:

- **SectionCollectionList** - Data-fetching wrapper component
- **CollectionListSection** - Presentational component
- **CollectionCard** - Individual collection card component

## Component Structure

```
SectionCollectionList
 ├─ SliderHeadingWrapper
 │   └─ SectionHeader (shared/common component)
 │       ├─ SectionTitle (left aligned)
 │   └─ HeaderActions (right aligned)
 │       ├─ CollectionButton (optional)
 │       └─ SliderArrowButtons (optional)
 └─ CollectionListContent
     ├─ CollectionSlider / Grid
     └─ CollectionCard
```

## Installation

The component is already included in the sections folder. Import it from:

```tsx
import { SectionCollectionList } from '~/components/sections';
```

## Basic Usage

```tsx
<SectionCollectionList
  collectionLimit={15}
  layout="slider"
  heading="Shop by collection"
/>
```

## Props Reference

### Collection Settings

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collectionLimit` | `number` | `15` | Maximum number of collections to display (1-250) |
| `layout` | `'slider' \| 'grid'` | `'slider'` | Layout type |
| `desktopColumnNum` | `number` | `4` | Desktop columns (2-6) |
| `mobileColumnNum` | `number` | `2` | Mobile columns (1-2) |
| `makeSectionFullwidth` | `boolean` | `false` | Use fluid container with 3rem (30px) side padding instead of page-width |

### Slider Settings

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `autoRotate` | `boolean` | `false` | Auto-rotate slides |
| `changesEvery` | `string` | `'5'` | Seconds between auto-rotation |
| `sliderLoop` | `boolean` | `true` | Enable infinite loop |
| `showPagination` | `boolean` | `true` | Show pagination indicator |
| `paginationType` | `'counter' \| 'bullets' \| 'progressbar'` | `'progressbar'` | Pagination style |
| `showNavigation` | `boolean` | `true` | Show navigation arrows |
| `navigationIconType` | `'long-arrow' \| 'chevron' \| 'small-arrow'` | `'long-arrow'` | Arrow icon style |
| `buttonStyle` | `'square' \| 'round' \| 'noborder'` | `'noborder'` | Navigation button style |
| `navigationPosition` | `'top' \| 'middle' \| 'bottom'` | `'top'` | Navigation position |
| `customColorNavigation` | `boolean` | `false` | Use custom navigation colors |
| `navigationForegroundColor` | `string` | `'#121212'` | Navigation foreground color |
| `navigationBackgroundColor` | `string` | `'#ffffff'` | Navigation background color |
| `navigationHoverBackgroundColor` | `string` | `'#121212'` | Navigation hover background color |
| `navigationHoverTextColor` | `string` | `'#ffffff'` | Navigation hover text color |
| `buttonRadius` | `number` | `50` | Button radius percentage (for round style) |

### Button Settings

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showButton` | `boolean` | `true` | Show "View All" button |
| `buttonLabel` | `string` | `''` | Button text |
| `buttonType` | `'primary' \| 'secondary'` | `'secondary'` | Button variant |
| `buttonSize` | `'large' \| 'medium' \| 'small'` | `'medium'` | Button size |
| `buttonPosition` | `'top' \| 'bottom'` | `'top'` | Button position |

> **Note:** If more than 8 collections are provided and `buttonLabel` is empty, the button will automatically show with "View All Collections" label.

### Section Header Settings

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | `string` | `'Shop by collection'` | Section heading |
| `headingSize` | `'large' \| 'medium' \| 'small'` | `'large'` | Heading size |
| `subheading` | `string` | `undefined` | Subheading text |
| `desktopHeadingAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Desktop heading alignment |
| `mobileHeadingAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Mobile heading alignment |

### Section Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `desktopPaddingTop` | `string` | `'80'` | Desktop top padding (px) |
| `desktopPaddingBottom` | `string` | `'80'` | Desktop bottom padding (px) |
| `mobilePaddingTop` | `string` | `'50'` | Mobile top padding (px) |
| `mobilePaddingBottom` | `string` | `'50'` | Mobile bottom padding (px) |
| `sectionColorScheme` | `'scheme-1' \| 'scheme-2' \| 'scheme-3' \| 'scheme-4' \| 'scheme-5'` | `'scheme-1'` | Color scheme |

### Collection Card Settings

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageRatio` | `'adapt' \| 'portrait' \| 'square' \| 'landscape' \| 'circle'` | `'square'` | Image aspect ratio |
| `cardCornerRadius` | `number` | `10` | Card corner radius (px) |
| `showProductCount` | `boolean` | `false` | Show product count |
| `showContentBelowImage` | `boolean` | `true` | Show content below image (desktop) |
| `showContentBelowImageMobile` | `boolean` | `true` | Show content below image (mobile) |
| `cardTitleType` | `'text' \| 'button'` | `'text'` | Title display type |
| `cardTitleSize` | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'medium'` | Title font size |
| `useArrowIcon` | `boolean` | `false` | Show arrow icon |
| `cardIconType` | `'arrow-up-right' \| 'arrow-right'` | `'arrow-up-right'` | Arrow icon type |
| `cardButtonType` | `'primary' \| 'secondary'` | `'secondary'` | Button type (when titleType is 'button') |

## Examples

### Basic Slider Layout

```tsx
<SectionCollectionList
  collectionLimit={15}
  layout="slider"
  heading="Shop by collection"
  subheading="Discover our curated collections"
  desktopColumnNum={4}
  mobileColumnNum={2}
  showNavigation={true}
  navigationPosition="top"
  navigationIconType="long-arrow"
  buttonStyle="noborder"
  showPagination={true}
  paginationType="progressbar"
/>
```

### Grid Layout

```tsx
<SectionCollectionList
  collectionLimit={20}
  layout="grid"
  heading="Shop by collection"
  desktopColumnNum={4}
  mobileColumnNum={2}
  imageRatio="square"
  showProductCount={true}
/>
```

### With Product Count

```tsx
<SectionCollectionList
  collectionLimit={8}
  layout="slider"
  heading="Shop by collection"
  showProductCount={true}
  cardTitleSize="medium"
/>
```

### Content on Image

```tsx
<SectionCollectionList
  collectionLimit={12}
  layout="slider"
  heading="Shop by collection"
  showContentBelowImage={false}
  showContentBelowImageMobile={false}
  showProductCount={true}
/>
```

### Button Title Layout

```tsx
<SectionCollectionList
  collectionLimit={10}
  layout="slider"
  heading="Shop by collection"
  cardTitleType="button"
  cardButtonType="secondary"
  useArrowIcon={true}
  cardIconType="arrow-up-right"
/>
```

### Circle Image Ratio

```tsx
<SectionCollectionList
  collectionLimit={8}
  layout="slider"
  heading="Shop by collection"
  imageRatio="circle"
  cardCornerRadius={0}
/>
```

### Auto-Rotate Slider

```tsx
<SectionCollectionList
  collectionLimit={6}
  layout="slider"
  heading="Shop by collection"
  autoRotate={true}
  changesEvery="5"
  showPagination={true}
  paginationType="bullets"
/>
```

### With View All Button

```tsx
<SectionCollectionList
  collectionLimit={15}
  layout="slider"
  heading="Shop by collection"
  showButton={true}
  buttonLabel="VIEW ALL COLLECTIONS"
  buttonType="secondary"
  buttonSize="medium"
  buttonPosition="top"
/>
```

### Bottom Navigation

```tsx
<SectionCollectionList
  collectionLimit={10}
  layout="slider"
  heading="Shop by collection"
  showNavigation={true}
  navigationPosition="bottom"
  navigationIconType="chevron"
  buttonStyle="round"
  showPagination={true}
  paginationType="counter"
/>
```

## Visual Examples

### Navigation Positions

#### Top of Section (Default)
Navigation arrows appear in the header area, aligned right next to the title/subheading.

**Settings:**
- Navigation position: `Top of the section`
- Show navigation: `enabled`

```tsx
navigationPosition="top"
showNavigation={true}
```

#### Middle of Section
Navigation arrows overlay the images on left and right sides.

**Settings:**
- Navigation position: `Middle of the section`
- Show navigation: `enabled`

```tsx
navigationPosition="middle"
showNavigation={true}
```

#### Bottom of Section
Navigation arrows and pagination appear below the collection cards.

**Settings:**
- Navigation position: `Bottom of the section`
- Show navigation: `enabled`

```tsx
navigationPosition="bottom"
showNavigation={true}
```

---

### Pagination Types

#### Progress Bar
Horizontal progress indicator showing scroll position.

> **Note:** Progress bar pagination **always appears at the bottom** of the section, regardless of the `navigationPosition` setting. When `navigationPosition` is set to `"top"` or `"middle"`, the arrows remain in their respective positions while only the progress bar appears at the bottom. When `navigationPosition` is `"bottom"`, both the arrows and progress bar appear together at the bottom.

**Settings:**
- Pagination type: `Progress bar`
- Show pagination: `enabled`

```tsx
showPagination={true}
paginationType="progressbar"
```

#### Bullets
Clickable dot indicators for each slide page.

> **Note:** Bullets pagination position depends on `navigationPosition`:
> - `"top"` → Bullets appear with navigation arrows in the header
> - `"middle"` → Bullets appear alone at the bottom center (arrows overlay on sides)
> - `"bottom"` → Bullets appear with navigation arrows at the bottom

**Settings:**
- Pagination type: `Bullets`
- Show pagination: `enabled`

```tsx
showPagination={true}
paginationType="bullets"
```

#### Counter
Numeric display showing current/total (e.g., "1 / 6").

> **Note:** Counter pagination position depends on `navigationPosition`:
> - `"top"` → Counter appears with navigation arrows in the header
> - `"middle"` → Counter appears alone at the bottom center (arrows overlay on sides)
> - `"bottom"` → Counter appears with navigation arrows at the bottom

**Settings:**
- Pagination type: `Counter`
- Show pagination: `enabled`

```tsx
showPagination={true}
paginationType="counter"
```

## API Route

The component fetches data from:

```
GET /api/collections?limit=15&country=BD&language=EN
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `limit` | Maximum number of collections to fetch (default: 15, max: 250) |
| `handles` | Comma-separated collection handles (legacy mode, overrides limit) |
| `country` | Override country code for localization |
| `language` | Override language code for localization |

### Response

```json
{
  "collections": [
    {
      "id": "gid://shopify/Collection/123",
      "handle": "frontpage",
      "title": "Frontpage",
      "description": "Collection description",
      "image": {
        "id": "gid://shopify/CollectionImage/123",
        "url": "https://...",
        "altText": "Collection image",
        "width": 800,
        "height": 800
      },
      "products": {
        "nodes": [{ "id": "..." }]
      }
    }
  ]
}
```

## Files

| File | Description |
|------|-------------|
| `app/routes/api.collections.tsx` | API route for fetching multiple collections |
| `app/components/CollectionCard.tsx` | Collection card component |
| `app/components/sections/CollectionListSection.tsx` | Presentational component |
| `app/components/sections/SectionCollectionList.tsx` | Data-fetching wrapper |
| `app/styles/sections.css` | CSS styles |

## Acceptance Criteria

- The section header is reusable across multiple homepage sections
- Left side always shows the section title
- Right side shows button and/or slider arrows based on props
- Fetches all collections from the store up to the specified limit
- If more than 8 collections are displayed, the "View All" button shows automatically
- If layout is slider, slider settings work; otherwise, grid displays
- Header action props depend on SectionCollectionList props
