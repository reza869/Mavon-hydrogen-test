# Mavon Hydrogen – Styling Architecture

## 1. Objective

Rebuild the Mavon Shopify theme using Shopify Hydrogen + Tailwind CSS while maintaining:

- Identical visual design
- Identical global style structure
- Identical CSS variable philosophy
- Future compatibility with a dashboard/settings system

## 2. Source of Truth

The Hydrogen theme styling is derived from:

- `layout/theme.liquid` → Root CSS variables
- `assets/base.css` → Global base styles

These files define the entire design system of Mavon and have been mirrored exactly.

## 3. File Structure

```
mavon-hydrogen/
└── app/
    └── styles/
        ├── variables.css      # Root CSS variables (from theme.liquid)
        ├── color-schemes.css  # Color scheme definitions
        ├── tailwind.css       # Tailwind v4 configuration
        ├── base.css           # Global base styles (from base.css)
        └── app.css            # Component-specific styles
```

### Stylesheet Load Order (Critical)

In `root.tsx`, stylesheets are loaded in this specific order:

1. `variables.css` - CSS custom properties
2. `color-schemes.css` - Color scheme definitions
3. `tailwind.css` - Tailwind framework
4. `base.css` - Mavon base styles
5. `app.css` - Hydrogen component overrides

## 4. Root Variable Strategy

### 4.1 Liquid (Mavon) Behavior

- Root variables are attached in `theme.liquid`
- Values are injected from `schema.settings`
- Variables control:
  - Colors
  - Typography
  - Buttons
  - Shadows
  - Layout widths

### 4.2 Hydrogen (Mavon-Hydrogen) Adaptation

Since Hydrogen has no schema:

- All root variables are manually defined in `variables.css`
- Variables are attached to `:root`
- Naming stays identical to Mavon
- No hard-coded Tailwind colors bypass root variables

### 4.3 Variable Categories

```css
:root {
  /* Typography */
  --font-body-family: 'Lato', sans-serif;
  --font-heading-family: 'Chivo', sans-serif;
  --font-body-size: 1;
  --font-heading-size: 1;
  --heading-letter-spacing: 0px;

  /* Button System */
  --button-border-width: 1px;
  --button-border-radius: 0px;
  --button-letter-spacing: 0px;
  --button-font-size: 1;
  --button-font-weight: 500;

  /* Layout */
  --page-width: 143rem;
  --container-lg-width: 143rem;
  --container-fluid-offset: 5rem;

  /* Transitions */
  --transition: all 0.3s ease 0s;
  --duration-short: 100ms;
  --duration-default: 200ms;
  --duration-long: 500ms;
}
```

## 5. Color Scheme Architecture

### 5.1 RGB Value Format

Colors use comma-separated RGB values for alpha manipulation:

```css
:root {
  --color-background: 255, 255, 255;
  --color-foreground: 18, 18, 18;
  --color-button: 18, 18, 18;
}

/* Usage with alpha */
color: rgba(var(--color-foreground), 0.75);
background: rgb(var(--color-background));
```

### 5.2 Color Scheme Switching

Multiple color schemes are supported via data attributes:

```css
/* Default scheme */
:root,
.color-scheme-1 {
  --color-background: 255, 255, 255;
  --color-foreground: 18, 18, 18;
}

/* Dark scheme */
[data-color-scheme="scheme-2"] {
  --color-background: 18, 18, 18;
  --color-foreground: 255, 255, 255;
}
```

**Usage in components:**

```tsx
<section data-color-scheme="scheme-2">
  {/* This section uses dark theme colors */}
</section>
```

### 5.3 Available Schemes

| Scheme | Class/Attribute | Description |
|--------|-----------------|-------------|
| 1 | `.color-scheme-1` / default | Light theme (white bg, dark text) |
| 2 | `[data-color-scheme="scheme-2"]` | Dark theme (dark bg, light text) |
| 3 | `[data-color-scheme="scheme-3"]` | Accent theme (gold bg) |
| 4 | `[data-color-scheme="scheme-4"]` | Neutral theme (light gray bg) |

## 6. Typography System

### 6.1 Fonts

- **Body font:** Lato (Regular 400, Bold 700)
- **Heading font:** Montserrat (Medium 500, Semi-bold 600, Bold 700)

Fonts are loaded from Google Fonts CDN in `root.tsx`.

### 6.2 Heading Sizes

All heading sizes use the `--font-heading-size` multiplier:

```css
h1, .h1 { font-size: calc(var(--font-heading-size) * 4rem); }    /* Desktop */
h2, .h2 { font-size: calc(var(--font-heading-size) * 3.2rem); }
h3, .h3 { font-size: calc(var(--font-heading-size) * 2.8rem); }
h4, .h4 { font-size: calc(var(--font-heading-size) * 2.4rem); }
h5, .h5 { font-size: calc(var(--font-heading-size) * 2rem); }
h6, .h6 { font-size: calc(var(--font-heading-size) * 1.6rem); }
```

### 6.3 Body Font Scale

Base font size is set on `<html>`:

```css
html {
  font-size: calc(var(--font-body-size) * 62.5%);
}

body {
  font-size: 1.5rem; /* Mobile */
}

@media (min-width: 992px) {
  body {
    font-size: 1.6rem; /* Desktop */
  }
}
```

## 7. Button System

### 7.1 Button Variants

| Class | Description |
|-------|-------------|
| `.button` | Primary button (solid background) |
| `.button--secondary` | Outline button |
| `.button--tertiary` | Minimal/link-style button |

### 7.2 Button Sizes

| Class | Padding |
|-------|---------|
| `.button--small` | 0.8rem 2rem |
| `.button--medium` | 1rem 3.5rem |
| `.button--large` | 1rem 5rem |

### 7.3 Button Customization

All button properties are controlled via CSS variables:

```css
:root {
  --button-border-width: 1px;
  --button-border-radius: 0px;
  --button-letter-spacing: 0px;
  --button-font-size: 1;
  --button-text-case: none;
  --button-font-weight: 500;
}
```

## 8. Tailwind Integration

### 8.1 CSS-First Configuration

Tailwind v4 uses CSS-first configuration in `tailwind.css`:

```css
@import 'tailwindcss';

@theme {
  --color-background: rgb(var(--color-background));
  --color-foreground: rgb(var(--color-foreground));
  --font-family-body: var(--font-body-family);
  --font-family-heading: var(--font-heading-family);
}
```

### 8.2 Custom Utilities

Additional utilities are available:

```css
.font-body { /* Body font family */ }
.font-heading { /* Heading font family */ }
.max-w-page { max-width: var(--page-width); }
.max-w-container { max-width: var(--container-lg-width); }
.transition-mavon { transition: var(--transition); }
```

## 9. Grid System

A Bootstrap-compatible grid system is included in `base.css`:

```html
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">
      <!-- Content -->
    </div>
  </div>
</div>
```

### 9.1 Breakpoints

| Breakpoint | Min-width |
|------------|-----------|
| sm | 576px |
| md | 750px |
| lg | 992px |
| xl | 1200px |
| xxl | 1400px |

## 10. Future-Proofing

### 10.1 Dashboard Integration

When a dashboard is introduced, CSS variables can be dynamically injected via:

1. **Server-side rendering:**
   ```tsx
   <style dangerouslySetInnerHTML={{
     __html: `:root { --color-background: ${settings.background}; }`
   }} />
   ```

2. **JavaScript theme switching:**
   ```javascript
   document.documentElement.style.setProperty('--color-background', newValue);
   ```

3. **Data attribute switching:**
   ```javascript
   document.body.setAttribute('data-color-scheme', 'scheme-2');
   ```

### 10.2 Architecture Benefits

- All styling references CSS variables - no hard-coded values
- Color schemes are defined as selectors, not separate files
- Variable names match Mavon Liquid exactly
- Component styles use the same CSS variable names
- Easy to add new color schemes without modifying components

## 11. Migration Checklist

When migrating components from Mavon Liquid to Hydrogen:

- [ ] Use CSS variables instead of hard-coded colors
- [ ] Reference `rgba(var(--color-foreground), alpha)` format
- [ ] Use `.button`, `.button--secondary` classes for buttons
- [ ] Use heading classes (`.h1`, `.h2`, etc.) for consistent typography
- [ ] Apply `[data-color-scheme="X"]` for section-level theming
- [ ] Use grid classes (`.row`, `.col-*`) for layouts
