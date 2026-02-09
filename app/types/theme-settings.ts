// Theme Settings Types for Dashboard

export interface ColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  buttonBackground: string;
  buttonText: string;
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  baseFontSize: number;
  headingFontWeight: number;
  bodyFontWeight: number;
  lineHeight: number;
}

export interface LayoutSettings {
  containerMaxWidth: number;
  gridGap: number;
  borderRadius: number;
  sectionPaddingTop: number;
  sectionPaddingBottom: number;
}

export interface ButtonSettings {
  borderRadius: number;
  fontWeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  borderWidth: number;
  letterSpacing: number;
}

export interface ThemeSettings {
  colors: ColorSettings;
  typography: TypographySettings;
  layout: LayoutSettings;
  buttons: ButtonSettings;
}

// Section Types
export type SectionType =
  | 'slideshow'
  | 'featured-collection'
  | 'collection-list'
  | 'rich-text'
  | 'image-with-text'
  | 'promo-banner'
  | 'testimonials'
  | 'newsletter'
  | 'scrolling-text'
  | 'text-with-icons'
  | 'logo-list'
  | 'blog-posts'
  | 'countdown'
  | 'before-after-slider';

export interface BaseSectionSettings {
  id: string;
  type: SectionType;
  name: string;
  order: number;
  isVisible: boolean;
  colorScheme: 'scheme-1' | 'scheme-2' | 'scheme-3' | 'scheme-4' | 'scheme-5';
  paddingTop: number;
  paddingBottom: number;
  fullWidth: boolean;
}

export interface FeaturedCollectionSettings extends BaseSectionSettings {
  type: 'featured-collection';
  collectionHandle: string;
  heading: string;
  headingSize: 'small' | 'medium' | 'large' | 'extra-large';
  description: string;
  headingAlignment: 'left' | 'center' | 'right';
  layout: 'grid' | 'slider';
  maxProducts: number;
  columnsDesktop: 2 | 3 | 4 | 5;
  columnsMobile: 1 | 2;
  showViewAll: boolean;
  viewAllText: string;
}

export interface SlideshowSlide {
  id: string;
  image: string;
  mobileImage: string;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  textPosition: 'left' | 'center' | 'right';
  textColor: string;
  overlayOpacity: number;
}

export interface SlideshowSettings extends BaseSectionSettings {
  type: 'slideshow';
  slides: SlideshowSlide[];
  // Slide Height
  slideHeight: 'adapt' | 'small' | 'medium' | 'large';
  // Autoplay Settings
  autoRotateSlides: boolean;
  changeSlides: number; // seconds between slides
  // Animation
  animationType: 'slide' | 'fade';
  // Navigation Settings
  navigationStyle: 'split-controls' | 'inline-controls';
  navigationIconType: 'long-arrow' | 'small-arrow' | 'chevron';
  navigationContainerDesktop: 'fixed-container' | 'fullwidth';
  // Mobile Settings
  showContentBelowImageOnMobile: boolean;
  // Pagination Colors
  customColorPagination: boolean;
  paginationColorDesktop: string;
  paginationColorMobile: string;
  // Tab Settings (for slideshow with tabs)
  tabFontFamily: 'body' | 'heading';
  tabFontSize: 'small' | 'medium' | 'large';
  tabBorderPosition: 'both' | 'top' | 'bottom' | 'none';
  tabColorScheme: 'scheme-1' | 'scheme-2' | 'scheme-3' | 'scheme-4' | 'scheme-5';
  useCustomColorMobile: boolean;
  // Section Padding
  desktopPaddingTop: number;
  desktopPaddingBottom: number;
  mobilePaddingTop: number;
  mobilePaddingBottom: number;
}

export interface RichTextSettings extends BaseSectionSettings {
  type: 'rich-text';
  content: string;
  heading: string;
  headingSize: 'small' | 'medium' | 'large' | 'extra-large';
  textAlignment: 'left' | 'center' | 'right';
}

export interface CollectionListSettings extends BaseSectionSettings {
  type: 'collection-list';
  heading: string;
  collections: string[];
  columnsDesktop: 2 | 3 | 4;
  columnsMobile: 1 | 2;
  showTitle: boolean;
  showDescription: boolean;
}

export type SectionSettings =
  | FeaturedCollectionSettings
  | SlideshowSettings
  | RichTextSettings
  | CollectionListSettings
  | BaseSectionSettings;

// Page Configuration
export interface PageConfig {
  id: string;
  title: string;
  handle: string;
  sections: SectionSettings[];
}

// Complete Store Configuration
export interface StoreConfig {
  settings: ThemeSettings;
  pages: PageConfig[];
  isDraft: boolean;
  lastPublishedAt: string | null;
  updatedAt: string;
}

// Default Theme Settings
export const defaultThemeSettings: ThemeSettings = {
  colors: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#3b82f6',
    background: '#ffffff',
    text: '#1a1a1a',
    buttonBackground: '#000000',
    buttonText: '#ffffff',
  },
  typography: {
    headingFont: 'Chivo',
    bodyFont: 'Lato',
    baseFontSize: 16,
    headingFontWeight: 700,
    bodyFontWeight: 400,
    lineHeight: 1.5,
  },
  layout: {
    containerMaxWidth: 1430,
    gridGap: 24,
    borderRadius: 8,
    sectionPaddingTop: 40,
    sectionPaddingBottom: 40,
  },
  buttons: {
    borderRadius: 4,
    fontWeight: 600,
    textTransform: 'uppercase',
    borderWidth: 1,
    letterSpacing: 0.1,
  },
};

// Default Homepage Sections
export const defaultHomepageSections: SectionSettings[] = [
  {
    id: 'slideshow-1',
    type: 'slideshow',
    name: 'Slideshow',
    order: 0,
    isVisible: true,
    colorScheme: 'scheme-1',
    paddingTop: 0,
    paddingBottom: 0,
    fullWidth: true,
    slides: [
      {
        id: 'slide-1',
        image: '',
        mobileImage: '',
        heading: 'Welcome to our store',
        subheading: 'Discover amazing products',
        buttonText: 'Shop Now',
        buttonLink: '/collections/all',
        textPosition: 'center',
        textColor: '#ffffff',
        overlayOpacity: 30,
      },
    ],
    // Slide Height
    slideHeight: 'adapt',
    // Autoplay
    autoRotateSlides: false,
    changeSlides: 5,
    // Animation
    animationType: 'slide',
    // Navigation
    navigationStyle: 'split-controls',
    navigationIconType: 'long-arrow',
    navigationContainerDesktop: 'fullwidth',
    // Mobile
    showContentBelowImageOnMobile: true,
    // Pagination Colors
    customColorPagination: true,
    paginationColorDesktop: '#ffffff',
    paginationColorMobile: '#333333',
    // Tab Settings
    tabFontFamily: 'heading',
    tabFontSize: 'medium',
    tabBorderPosition: 'both',
    tabColorScheme: 'scheme-3',
    useCustomColorMobile: false,
    // Section Padding
    desktopPaddingTop: 0,
    desktopPaddingBottom: 0,
    mobilePaddingTop: 0,
    mobilePaddingBottom: 50,
  } as SlideshowSettings,
  {
    id: 'featured-collection-1',
    type: 'featured-collection',
    name: 'Featured Collection',
    order: 1,
    isVisible: true,
    colorScheme: 'scheme-1',
    paddingTop: 40,
    paddingBottom: 40,
    fullWidth: false,
    collectionHandle: 'all',
    heading: 'Just Released',
    headingSize: 'extra-large',
    description: '',
    headingAlignment: 'left',
    layout: 'slider',
    maxProducts: 8,
    columnsDesktop: 4,
    columnsMobile: 2,
    showViewAll: true,
    viewAllText: 'View All',
  } as FeaturedCollectionSettings,
];

// Default Store Configuration
export const defaultStoreConfig: StoreConfig = {
  settings: defaultThemeSettings,
  pages: [
    {
      id: 'homepage',
      title: 'Home page',
      handle: 'index',
      sections: defaultHomepageSections,
    },
  ],
  isDraft: true,
  lastPublishedAt: null,
  updatedAt: new Date().toISOString(),
};
