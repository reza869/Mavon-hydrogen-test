import {useState} from 'react';
import {SocialIcons} from './shared/SocialIcons';
import {CurrencySelector} from './shared/CurrencySelector';
import {LanguageSelector} from './shared/LanguageSelector';
import {AnnouncementBarExpanded} from './AnnouncementBarExpanded';

interface AnnouncementBarProps {
  message?: string;
  moreButtonText?: string;
  showExpandedContent?: boolean;
  className?: string;
}

export function AnnouncementBar({
  message = 'HURRY UP! BUY NOW',
  moreButtonText = 'More',
  showExpandedContent = true,
  className = '',
}: AnnouncementBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className={`color-scheme-3 bg-background relative z-[6] ${className}`}
      >
        <div className="container-fluid mx-auto flex items-center justify-between h-[46px] px-4 min-[992px]:px-[3rem]">
          {/* Left: Social Icons - hidden on mobile/tablet */}
          <div className="hidden min-[992px]:flex items-center">
            <SocialIcons size="sm" gap="sm" />
          </div>

          {/* Center: Message + More button */}
          <div className="flex gap-8 items-center justify-center flex-1 min-[992px]:flex-none">
            <span className="text-foreground text-2xl font-bold tracking-wide">
              {message}
            </span>
            {showExpandedContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="button button--announcement button--secondary !px-4 !py-0"
                type="button"
                aria-expanded={isExpanded}
              >
                {moreButtonText}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Right: Currency + Language - hidden on mobile/tablet */}
          <div className="hidden min-[992px]:flex items-center gap-4">
            <CurrencySelector variant="compact" />
            <LanguageSelector variant="compact" />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div
        className={`border-t-[0.1rem] border-t-[rgba(var(--color-foreground),0.8)] grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <AnnouncementBarExpanded onClose={() => setIsExpanded(false)} />
        </div>
      </div>
    </>
  );
}
