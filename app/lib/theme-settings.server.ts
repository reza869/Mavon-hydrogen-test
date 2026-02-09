import type {
  ThemeSettings,
  StoreConfig,
  SectionSettings,
  PageConfig,
} from '~/types/theme-settings';
import {
  defaultThemeSettings,
  defaultStoreConfig,
} from '~/types/theme-settings';

// In-memory storage for development (replace with database in production)
let storeConfig: StoreConfig = { ...defaultStoreConfig };
let publishedConfig: StoreConfig | null = null;

// Initialize with default config
export function initializeStoreConfig(): void {
  storeConfig = { ...defaultStoreConfig };
}

// Get current store configuration (draft or published)
export async function getStoreConfig(isDraft: boolean = true): Promise<StoreConfig> {
  if (isDraft) {
    return storeConfig;
  }
  return publishedConfig || storeConfig;
}

// Get theme settings
export async function getThemeSettings(isDraft: boolean = true): Promise<ThemeSettings> {
  const config = await getStoreConfig(isDraft);
  return config.settings;
}

// Update theme settings
export async function updateThemeSettings(
  settings: Partial<ThemeSettings>
): Promise<ThemeSettings> {
  storeConfig.settings = {
    ...storeConfig.settings,
    ...settings,
  };
  storeConfig.updatedAt = new Date().toISOString();
  return storeConfig.settings;
}

// Update color settings
export async function updateColorSettings(
  colors: Partial<ThemeSettings['colors']>
): Promise<ThemeSettings['colors']> {
  storeConfig.settings.colors = {
    ...storeConfig.settings.colors,
    ...colors,
  };
  storeConfig.updatedAt = new Date().toISOString();
  return storeConfig.settings.colors;
}

// Update typography settings
export async function updateTypographySettings(
  typography: Partial<ThemeSettings['typography']>
): Promise<ThemeSettings['typography']> {
  storeConfig.settings.typography = {
    ...storeConfig.settings.typography,
    ...typography,
  };
  storeConfig.updatedAt = new Date().toISOString();
  return storeConfig.settings.typography;
}

// Update layout settings
export async function updateLayoutSettings(
  layout: Partial<ThemeSettings['layout']>
): Promise<ThemeSettings['layout']> {
  storeConfig.settings.layout = {
    ...storeConfig.settings.layout,
    ...layout,
  };
  storeConfig.updatedAt = new Date().toISOString();
  return storeConfig.settings.layout;
}

// Update button settings
export async function updateButtonSettings(
  buttons: Partial<ThemeSettings['buttons']>
): Promise<ThemeSettings['buttons']> {
  storeConfig.settings.buttons = {
    ...storeConfig.settings.buttons,
    ...buttons,
  };
  storeConfig.updatedAt = new Date().toISOString();
  return storeConfig.settings.buttons;
}

// Get page configuration
export async function getPageConfig(
  pageHandle: string,
  isDraft: boolean = true
): Promise<PageConfig | null> {
  const config = await getStoreConfig(isDraft);
  return config.pages.find((p) => p.handle === pageHandle) || null;
}

// Get all pages
export async function getAllPages(isDraft: boolean = true): Promise<PageConfig[]> {
  const config = await getStoreConfig(isDraft);
  return config.pages;
}

// Get sections for a page
export async function getSections(
  pageHandle: string = 'index',
  isDraft: boolean = true
): Promise<SectionSettings[]> {
  const page = await getPageConfig(pageHandle, isDraft);
  return page?.sections || [];
}

// Update a section
export async function updateSection(
  pageHandle: string,
  sectionId: string,
  updates: Partial<SectionSettings>
): Promise<SectionSettings | null> {
  const pageIndex = storeConfig.pages.findIndex((p) => p.handle === pageHandle);
  if (pageIndex === -1) return null;

  const sectionIndex = storeConfig.pages[pageIndex].sections.findIndex(
    (s) => s.id === sectionId
  );
  if (sectionIndex === -1) return null;

  storeConfig.pages[pageIndex].sections[sectionIndex] = {
    ...storeConfig.pages[pageIndex].sections[sectionIndex],
    ...updates,
  } as SectionSettings;

  storeConfig.updatedAt = new Date().toISOString();
  storeConfig.isDraft = true;
  return storeConfig.pages[pageIndex].sections[sectionIndex];
}

// Update section settings by ID (convenience function)
export async function updateSectionSettings(
  sectionId: string,
  updates: Partial<SectionSettings>,
  pageHandle: string = 'index'
): Promise<SectionSettings | null> {
  return updateSection(pageHandle, sectionId, updates);
}

// Get section by ID
export async function getSection(
  sectionId: string,
  pageHandle: string = 'index',
  isDraft: boolean = true
): Promise<SectionSettings | null> {
  const page = await getPageConfig(pageHandle, isDraft);
  if (!page) return null;
  return page.sections.find((s) => s.id === sectionId) || null;
}

// Get slideshow settings for the homepage
export async function getSlideshowSettings(
  pageHandle: string = 'index',
  isDraft: boolean = true
): Promise<SectionSettings | null> {
  const page = await getPageConfig(pageHandle, isDraft);
  if (!page) return null;
  return page.sections.find((s) => s.type === 'slideshow') || null;
}

// Add a new section
export async function addSection(
  pageHandle: string,
  section: SectionSettings
): Promise<SectionSettings> {
  const pageIndex = storeConfig.pages.findIndex((p) => p.handle === pageHandle);
  if (pageIndex === -1) {
    throw new Error(`Page "${pageHandle}" not found`);
  }

  // Set order to be at the end
  section.order = storeConfig.pages[pageIndex].sections.length;
  storeConfig.pages[pageIndex].sections.push(section);
  storeConfig.updatedAt = new Date().toISOString();
  return section;
}

// Delete a section
export async function deleteSection(
  pageHandle: string,
  sectionId: string
): Promise<boolean> {
  const pageIndex = storeConfig.pages.findIndex((p) => p.handle === pageHandle);
  if (pageIndex === -1) return false;

  const sectionIndex = storeConfig.pages[pageIndex].sections.findIndex(
    (s) => s.id === sectionId
  );
  if (sectionIndex === -1) return false;

  storeConfig.pages[pageIndex].sections.splice(sectionIndex, 1);

  // Reorder remaining sections
  storeConfig.pages[pageIndex].sections.forEach((section, index) => {
    section.order = index;
  });

  storeConfig.updatedAt = new Date().toISOString();
  return true;
}

// Reorder sections
export async function reorderSections(
  pageHandle: string,
  sectionIds: string[]
): Promise<SectionSettings[]> {
  const pageIndex = storeConfig.pages.findIndex((p) => p.handle === pageHandle);
  if (pageIndex === -1) {
    throw new Error(`Page "${pageHandle}" not found`);
  }

  const sections = storeConfig.pages[pageIndex].sections;
  const reorderedSections: SectionSettings[] = [];

  sectionIds.forEach((id, index) => {
    const section = sections.find((s) => s.id === id);
    if (section) {
      section.order = index;
      reorderedSections.push(section);
    }
  });

  storeConfig.pages[pageIndex].sections = reorderedSections;
  storeConfig.updatedAt = new Date().toISOString();
  return reorderedSections;
}

// Publish settings (copy draft to published)
export async function publishSettings(): Promise<StoreConfig> {
  publishedConfig = JSON.parse(JSON.stringify(storeConfig));
  publishedConfig!.isDraft = false;
  publishedConfig!.lastPublishedAt = new Date().toISOString();
  storeConfig.lastPublishedAt = publishedConfig!.lastPublishedAt;
  return publishedConfig!;
}

// Check if there are unpublished changes
export async function hasUnpublishedChanges(): Promise<boolean> {
  if (!publishedConfig) return true;
  return storeConfig.updatedAt !== publishedConfig.updatedAt;
}

// Reset to default settings
export async function resetToDefaults(): Promise<StoreConfig> {
  storeConfig = { ...defaultStoreConfig };
  storeConfig.updatedAt = new Date().toISOString();
  return storeConfig;
}

// Generate CSS from theme settings
export function generateThemeCSS(settings: ThemeSettings): string {
  return `
/* Generated Theme CSS - ${new Date().toISOString()} */
:root {
  /* Colors */
  --color-primary: ${settings.colors.primary};
  --color-secondary: ${settings.colors.secondary};
  --color-accent: ${settings.colors.accent};
  --color-background: ${settings.colors.background};
  --color-text: ${settings.colors.text};
  --color-button-bg: ${settings.colors.buttonBackground};
  --color-button-text: ${settings.colors.buttonText};

  /* Typography */
  --font-heading-family: "${settings.typography.headingFont}", sans-serif;
  --font-body-family: "${settings.typography.bodyFont}", sans-serif;
  --font-size-base: ${settings.typography.baseFontSize}px;
  --font-heading-weight: ${settings.typography.headingFontWeight};
  --font-body-weight: ${settings.typography.bodyFontWeight};
  --line-height-base: ${settings.typography.lineHeight};

  /* Layout */
  --page-width: ${settings.layout.containerMaxWidth}px;
  --grid-gap: ${settings.layout.gridGap}px;
  --border-radius-base: ${settings.layout.borderRadius}px;
  --section-padding-top: ${settings.layout.sectionPaddingTop}px;
  --section-padding-bottom: ${settings.layout.sectionPaddingBottom}px;

  /* Buttons */
  --button-border-radius: ${settings.buttons.borderRadius}px;
  --button-font-weight: ${settings.buttons.fontWeight};
  --button-text-transform: ${settings.buttons.textTransform};
  --button-border-width: ${settings.buttons.borderWidth}px;
  --button-letter-spacing: ${settings.buttons.letterSpacing}em;
}

/* Apply dynamic styles */
body {
  font-family: var(--font-body-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-body-weight);
  line-height: var(--line-height-base);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading-family);
  font-weight: var(--font-heading-weight);
}

.button, button[type="submit"], .btn {
  border-radius: var(--button-border-radius);
  font-weight: var(--button-font-weight);
  text-transform: var(--button-text-transform);
  letter-spacing: var(--button-letter-spacing);
}

.container {
  max-width: var(--page-width);
}
  `.trim();
}
