import {useState, useRef, useEffect} from 'react';
import {useLocation} from 'react-router';
import {useLocale, type Language} from './LocaleContext';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'mobile';
  className?: string;
}

export function LanguageSelector({
  variant = 'default',
  className = '',
}: LanguageSelectorProps) {
  const {languages, currentLanguage, currentCountry} = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const selectedLanguage = languages.find(
    (l) => l.code?.toUpperCase() === currentLanguage?.toUpperCase() ||
           l.isoCode?.toUpperCase() === currentLanguage?.toUpperCase()
  );
  const displayName = selectedLanguage?.name || 'English';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (language: Language) => {
    setIsOpen(false);
    const langCode = (language.code || language.isoCode || 'EN').toUpperCase();
    const currentPath = location.pathname.replace(/^\/[A-Z]{2}-[A-Z]{2}/i, '');
    const newPath = `/${langCode}-${currentCountry}${currentPath || '/'}`;
    // Use full page reload to ensure server-side data is fetched with new locale
    window.location.href = newPath;
  };

  if (variant === 'mobile') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          className="flex items-center gap-1 px-4 py-3 border border-foreground-20 rounded-full bg-transparent text-2xl text-foreground cursor-pointer hover:border-foreground-50 transition-colors duration-200"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span>{displayName}</span>
          <svg
            className={`ml-0.5 w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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

        {isOpen && languages.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-[180px] max-h-[300px] overflow-y-auto bg-background border border-foreground-10 rounded-lg shadow-lg z-50">
            {languages.map((language) => {
              const langCode = (language.code || language.isoCode || '').toUpperCase();
              return (
                <button
                  key={langCode}
                  type="button"
                  className={`w-full px-4 py-3 text-left text-2xl text-foreground hover:bg-foreground-5 transition-colors duration-200 ${
                    langCode === currentLanguage?.toUpperCase()
                      ? 'bg-foreground-5 font-medium'
                      : ''
                  }`}
                  onClick={() => handleSelect(language)}
                >
                  {language.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          className="flex items-center gap-1 text-[1.3rem] text-foreground cursor-pointer hover:opacity-80 transition-opacity duration-200 bg-transparent border-none"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span>{displayName}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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

        {isOpen && languages.length > 0 && (
          <div className="absolute top-full right-0 mt-2 w-[150px] max-h-[300px] overflow-y-auto bg-background border border-foreground-10 rounded-lg shadow-lg z-50">
            {languages.map((language) => {
              const langCode = (language.code || language.isoCode || '').toUpperCase();
              return (
                <button
                  key={langCode}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-[1.3rem] text-foreground hover:bg-foreground-5 transition-colors duration-200 ${
                    langCode === currentLanguage?.toUpperCase()
                      ? 'bg-foreground-5 font-medium'
                      : ''
                  }`}
                  onClick={() => handleSelect(language)}
                >
                  {language.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        className="flex items-center gap-1 text-[1.3rem] text-foreground cursor-pointer hover:opacity-80 transition-opacity duration-200 bg-transparent border-none"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{displayName}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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

      {isOpen && languages.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-[150px] max-h-[300px] overflow-y-auto bg-background border border-foreground-10 rounded-lg shadow-lg z-50">
          {languages.map((language) => {
            const langCode = (language.code || language.isoCode || '').toUpperCase();
            return (
              <button
                key={langCode}
                type="button"
                className={`w-full px-4 py-3 text-left text-[1.4rem] text-foreground hover:bg-foreground-5 transition-colors duration-200 ${
                  langCode === currentLanguage?.toUpperCase()
                    ? 'bg-foreground-5 font-medium'
                    : ''
                }`}
                onClick={() => handleSelect(language)}
              >
                {language.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
