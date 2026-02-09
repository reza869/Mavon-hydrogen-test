import type {ReactNode, CSSProperties} from 'react';

export type HeadingSize = 'large' | 'medium' | 'small';
export type HeadingAlignment = 'left' | 'center' | 'right';

export interface SectionHeaderProps {
  /** Main heading text */
  heading: string;
  /** Heading size - maps to h2/h3/h4 */
  headingSize?: HeadingSize;
  /** Optional subheading text below title */
  subheading?: string;
  /** Desktop text alignment */
  desktopHeadingAlignment?: HeadingAlignment;
  /** Mobile text alignment */
  mobileHeadingAlignment?: HeadingAlignment;
  /** Actions slot (buttons, navigation arrows) */
  actions?: ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * Get heading tag based on size
 */
function getHeadingTag(size: HeadingSize): 'h2' | 'h3' | 'h4' {
  switch (size) {
    case 'large':
      return 'h2';
    case 'medium':
      return 'h3';
    case 'small':
      return 'h4';
    default:
      return 'h2';
  }
}

/**
 * Get heading font size based on size prop
 */
function getHeadingFontSize(size: HeadingSize): string {
  switch (size) {
    case 'large':
      return '5rem'; // 50px
    case 'medium':
      return '4rem'; // 40px
    case 'small':
      return '3.2rem'; // 32px
    default:
      return '5rem';
  }
}

/**
 * Reusable Section Header Component
 * Used across homepage sections for consistent header styling
 */
export function SectionHeader({
  heading,
  headingSize = 'large',
  subheading,
  desktopHeadingAlignment = 'left',
  mobileHeadingAlignment = 'left',
  actions,
  className = '',
}: SectionHeaderProps) {
  const HeadingTag = getHeadingTag(headingSize);
  const hasActions = !!actions;

  const headerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent:
      desktopHeadingAlignment === 'center' && !hasActions
        ? 'center'
        : 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '3rem',
    textAlign: desktopHeadingAlignment,
  };

  const contentStyle: CSSProperties = {
    flex: hasActions ? '1' : 'auto',
    minWidth: 0,
    textAlign:
      desktopHeadingAlignment === 'center' && hasActions
        ? 'left'
        : desktopHeadingAlignment,
  };

  const titleStyle: CSSProperties = {
    fontSize: getHeadingFontSize(headingSize),
    fontWeight: 600,
    lineHeight: 1.2,
    margin: 0,
    color: 'rgba(var(--color-foreground), 1)',
  };

  const subheadingStyle: CSSProperties = {
    fontSize: '1.6rem', // 16px
    color: 'rgba(var(--color-foreground), 0.6)',
    marginTop: '0.8rem',
    margin: '0.8rem 0 0 0',
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexShrink: 0,
  };

  return (
    <div
      className={`section-header section-header--${desktopHeadingAlignment} section-header--mobile-${mobileHeadingAlignment} ${className}`}
      style={headerStyle}
    >
      <div className="section-header__content" style={contentStyle}>
        <HeadingTag className="section-header__title" style={titleStyle}>
          {heading}
        </HeadingTag>
        {subheading && (
          <p className="section-header__subheading" style={subheadingStyle}>
            {subheading}
          </p>
        )}
      </div>
      {hasActions && (
        <div className="section-header__actions" style={actionsStyle}>
          {actions}
        </div>
      )}
    </div>
  );
}
