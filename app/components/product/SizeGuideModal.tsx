import {useEffect} from 'react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
}

/**
 * Size Guide Modal component
 * Displays size guide content from Shopify page in a popup modal
 */
export function SizeGuideModal({
  isOpen,
  onClose,
  title = 'Size Guide',
  content,
}: SizeGuideModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="size-guide-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <div
        className="size-guide-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="size-guide-modal__header">
          <h2 id="size-guide-title" className="size-guide-modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="size-guide-modal__close"
            onClick={onClose}
            aria-label="Close size guide"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="size-guide-modal__content">
          {content ? (
            <div
              className="size-guide-modal__body"
              dangerouslySetInnerHTML={{__html: content}}
            />
          ) : (
            <p className="size-guide-modal__empty">
              Size guide information is not available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
