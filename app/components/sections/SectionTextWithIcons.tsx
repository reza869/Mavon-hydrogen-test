import {type CSSProperties} from 'react';
import {SingleFeature, type SingleFeatureProps} from './SingleFeature';

// Types
export type ContentPosition = 'horizontal' | 'vertical';
export type ContentAlignment = 'left' | 'center' | 'right';
export type ColorScheme =
  | 'scheme-1'
  | 'scheme-2'
  | 'scheme-3'
  | 'scheme-4'
  | 'scheme-5';

export interface SectionTextWithIconsProps {
  // Features
  features: SingleFeatureProps[];

  // Layout Settings
  desktopColumns?: 3 | 4;
  contentPosition?: ContentPosition;
  contentAlignment?: ContentAlignment;

  // Section Styling
  sectionColorScheme?: ColorScheme;

  // Border
  showBorder?: boolean;
  borderColor?: string;

  // Padding
  desktopPaddingTop?: string;
  desktopPaddingBottom?: string;
  mobilePaddingTop?: string;
  mobilePaddingBottom?: string;

  // Container
  makeSectionFullwidth?: boolean;

  className?: string;
}

/**
 * SectionTextWithIcons Component
 * Section displaying features with icons/images
 * Following the Mavon Liquid theme pattern
 */
export function SectionTextWithIcons({
  features,
  desktopColumns = 3,
  contentPosition = 'horizontal',
  contentAlignment = 'left',
  sectionColorScheme,
  showBorder = false,
  borderColor = '#B0B0B0',
  desktopPaddingTop = '70',
  desktopPaddingBottom = '70',
  mobilePaddingTop = '60',
  mobilePaddingBottom = '60',
  makeSectionFullwidth = false,
  className = '',
}: SectionTextWithIconsProps) {
  // Section styles with CSS custom properties
  const sectionStyle: CSSProperties = {
    '--section-padding-top-desktop': desktopPaddingTop,
    '--section-padding-bottom-desktop': desktopPaddingBottom,
    '--section-padding-top-mobile': mobilePaddingTop,
    '--section-padding-bottom-mobile': mobilePaddingBottom,
    ...(showBorder && {'--border-color': borderColor}),
  } as CSSProperties;

  // Color scheme class
  const colorSchemeClass = sectionColorScheme ? `color-${sectionColorScheme}` : '';

  // Container class
  const containerClass = makeSectionFullwidth ? 'container-fluid' : 'container';

  // Grid classes
  const gridClass = `text-with-icons__grid text-with-icons__grid--desktop-${desktopColumns}`;

  // Content position class
  const positionClass = `text-with-icons--${contentPosition}`;

  // Alignment class
  const alignmentClass = `text-with-icons--align-${contentAlignment}`;

  // Border class
  const borderClass = showBorder ? 'text-with-icons--has-border' : '';

  return (
    <section
      className={`section section-text-with-icons ${colorSchemeClass} ${className}`}
      style={sectionStyle}
    >
      <div className={containerClass}>
        <div className={`${gridClass} ${positionClass} ${alignmentClass} ${borderClass}`}>
          {features.map((feature, index) => (
            <SingleFeature
              key={index}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Re-export types and components for convenience
export {SingleFeature} from './SingleFeature';
export type {SingleFeatureProps} from './SingleFeature';
export {IconFeatures, ICON_OPTIONS} from './IconFeatures';
export type {IconName} from './IconFeatures';
