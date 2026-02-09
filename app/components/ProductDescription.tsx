import type {CSSProperties} from 'react';

interface ProductDescriptionProps {
  /** Product description HTML */
  descriptionHtml: string;
  /** Section title */
  title?: string;
  /** Whether the section is expanded */
  isExpanded?: boolean;
  /** Callback when expand state changes */
  onToggle?: () => void;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * Collapsible product description section.
 */
export function ProductDescription({
  descriptionHtml,
  title = 'Product Description',
  isExpanded = false,
  onToggle,
  className = '',
  style = {},
}: ProductDescriptionProps) {
  if (!descriptionHtml) return null;

  return (
    <div
      className={`product-description ${className}`.trim()}
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px',
        ...style,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: isExpanded ? '16px' : 0,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <DescriptionIcon />
          <span style={{fontSize: '16px', fontWeight: 600, color: '#1a1a1a'}}>
            {title}
          </span>
        </div>
        <ChevronIcon isExpanded={isExpanded} />
      </button>

      {/* Description Content */}
      {isExpanded && (
        <div
          className="product-description-content"
          style={{
            lineHeight: 1.8,
          }}
          dangerouslySetInnerHTML={{__html: descriptionHtml}}
        />
      )}
    </div>
  );
}

function DescriptionIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ChevronIcon({isExpanded}: {isExpanded: boolean}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
