# Slideshow Section Blueprint

A hero slideshow section for the Mavon Hydrogen storefront homepage using Swiper.js.

---

## Component Structure

```
SectionSlideshow
 ├─ SingleSlideshow
 ├─ SingleSlideshow
 └─ SingleSlideshow
```

---

## SectionSlideshow Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slides` | `SingleSlideshowProps[]` | required | Array of slide configurations |
| `slideHeight` | `'adapt' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Slide height mode |
| `autoRotateSlides` | `boolean` | `false` | Enable auto-rotation |
| `changeSlides` | `number` | `5` | Seconds between slide changes |
| `navigationStyle` | `'split-controls' \| 'inline-controls'` | `'split-controls'` | Navigation layout style |
| `navigationIconType` | `'long-arrow' \| 'small-arrow' \| 'chevron'` | `'long-arrow'` | Arrow icon type |
| `navigationContainerDesktop` | `'fixed-container' \| 'fullwidth'` | `'fixed-container'` | Navigation container width |
| `showContentBelowImageOnMobile` | `boolean` | `false` | Show content below image on mobile |
| `desktopPaddingTop` | `string` | `'0'` | Desktop top padding (px) |
| `desktopPaddingBottom` | `string` | `'0'` | Desktop bottom padding (px) |
| `mobilePaddingTop` | `string` | `'0'` | Mobile top padding (px) |
| `mobilePaddingBottom` | `string` | `'50'` | Mobile bottom padding (px) |
| `navigationButtonColorScheme` | `ColorScheme` | - | Color scheme for navigation buttons (arrows) |
| `enableNavigationColorsOnMobile` | `boolean` | `false` | Apply navigation colors on mobile |
| `customColorPagination` | `boolean` | `false` | Enable custom colors for pagination (dots) |
| `paginationColorDesktop` | `string` | - | Pagination dot color on desktop |
| `paginationColorMobile` | `string` | - | Pagination dot color on mobile |

---

## SingleSlideshow Props

### Desktop Content

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `desktopImage` | `string` | required | Desktop image URL (1920x900) |
| `heading` | `string` | - | Slide heading text |
| `headingSize` | `HeadingSize` | `'large'` | Heading size |
| `headingLineHeight` | `'normal' \| 'medium' \| 'high'` | `'normal'` | Heading line height |
| `subheading` | `string` | - | Subheading (supports `<br>` for line breaks) |
| `imageOverlayOpacity` | `number` | `0` | Image overlay opacity (0-100%) |
| `desktopContentPosition` | `ContentPosition` | `'middle-left'` | Content position (9 positions) |
| `contentAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Content text alignment |
| `enableFullSlideLink` | `boolean` | `false` | Enable full slide link |

### Heading Size Mapping

| Value | CSS Class |
|-------|-----------|
| `'extra-small'` | `.h4` |
| `'small'` | `.h3` |
| `'medium'` | `.h2` |
| `'large'` | `.h1` |
| `'extra-large'` | `.h0` |

### Content Position Options

| Value | Position |
|-------|----------|
| `'top-left'` | Top left corner |
| `'top-center'` | Top center |
| `'top-right'` | Top right corner |
| `'middle-left'` | Middle left |
| `'middle-center'` | Middle center |
| `'middle-right'` | Middle right |
| `'bottom-left'` | Bottom left corner |
| `'bottom-center'` | Bottom center |
| `'bottom-right'` | Bottom right corner |

### Button One

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buttonOneLabel` | `string` | - | Button label (empty to hide) |
| `buttonOneLink` | `string` | - | Button link URL |
| `buttonOneType` | `'primary' \| 'secondary'` | `'primary'` | Button style |
| `buttonOneSize` | `'large' \| 'medium' \| 'small'` | `'medium'` | Button size |

### Button Two

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buttonTwoLabel` | `string` | - | Button label (empty to hide) |
| `buttonTwoLink` | `string` | - | Button link URL |
| `buttonTwoType` | `'primary' \| 'secondary'` | `'primary'` | Button style |
| `buttonTwoSize` | `'large' \| 'medium' \| 'small'` | `'medium'` | Button size |

### Colors (heading, subheading, buttons)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colorScheme` | `ColorScheme` | - | Color scheme (uses foreground/background colors) |

### Mobile Settings

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mobileImage` | `string` | - | Mobile image URL (600x480) |
| `mobileContentAlignment` | `'left' \| 'center' \| 'right'` | `'center'` | Mobile content alignment |
| `enableColorSchemeOnMobile` | `boolean` | `false` | Enable color scheme on mobile |
| `mobileColorScheme` | `ColorScheme` | - | Mobile color scheme |

---

## Navigation Styles

### Split Controls
- Pagination dots positioned on the **LEFT**
- Arrow buttons in rounded container on the **RIGHT**
- Both at the same vertical level at bottom

```
[o o o]                              [← →]
```

### Inline Controls
- All controls grouped together at bottom-left
- Layout: `[←] [o o o] [→]`

```
[←] [o o o] [→]
```

---

## Mobile Content Modes

### Content On Image (default)
- Content wrapper: `position: absolute`
- Content overlaid on the mobile image
- Text color from slide settings

### Content Below Image
- Set `showContentBelowImageOnMobile: true`
- Content wrapper: `position: relative`
- Image has fixed aspect ratio
- Content area can have color scheme background
- Centered text and controls

---

## Responsive Breakpoints

| Breakpoint | Height (Large) | Height (Medium) | Height (Small) |
|------------|----------------|-----------------|----------------|
| < 599px | 39rem | 34rem | 28rem |
| 599-749px | 55rem | 45rem | 35rem |
| 750-991px | 65rem | 55rem | 45rem |
| >= 992px | 89rem | 65rem | 50rem |

---

## Example Usage

```tsx
import { SectionSlideshow } from '~/components/sections/SectionSlideshow';

<SectionSlideshow
  slides={[
    {
      desktopImage: '/images/hero/hero-1.png',
      mobileImage: '/images/hero/hero-1.png',
      heading: 'THE NEWERA BEGANS.',
      headingSize: 'extra-large',
      headingLineHeight: 'normal',
      subheading: 'Step into the future with bold ideas. Innovation starts where<br>comfort meets power.',
      imageOverlayOpacity: 0,
      desktopContentPosition: 'middle-left',
      contentAlignment: 'left',
      buttonOneLabel: 'SHOP NOW',
      buttonOneLink: '/collections/all',
      buttonOneType: 'secondary',
      buttonOneSize: 'large',
      buttonTwoLabel: 'SEE COLLECTION',
      buttonTwoLink: '/collections/featured',
      buttonTwoType: 'primary',
      buttonTwoSize: 'large',
      mobileContentAlignment: 'center',
      enableColorSchemeOnMobile: false,
    },
    {
      desktopImage: '/images/hero/hero-2.png',
      mobileImage: '/images/hero/hero-2.png',
      heading: 'NEW ARRIVALS',
      headingSize: 'large',
      desktopContentPosition: 'middle-center',
      contentAlignment: 'center',
      imageOverlayOpacity: 20,
      buttonOneLabel: 'EXPLORE',
      buttonOneLink: '/collections/new',
      buttonOneType: 'primary',
      buttonOneSize: 'medium',
    },
  ]}
  slideHeight="adapt"
  autoRotateSlides={false}
  changeSlides={5}
  navigationStyle="split-controls"
  navigationIconType="long-arrow"
  navigationContainerDesktop="fixed-container"
  showContentBelowImageOnMobile={true}
  desktopPaddingTop="0"
  desktopPaddingBottom="0"
  mobilePaddingTop="0"
  mobilePaddingBottom="50"
/>
```

---

## Files

| File | Description |
|------|-------------|
| `app/components/sections/SectionSlideshow.tsx` | Parent component with Swiper |
| `app/components/sections/SingleSlideshow.tsx` | Individual slide component |
| `app/styles/sections.css` | Slideshow CSS styles |
