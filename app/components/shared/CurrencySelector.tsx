import {useState, useRef, useEffect} from 'react';
import {useLocation} from 'react-router';
import {useLocale, type Country} from './LocaleContext';

interface CurrencySelectorProps {
  variant?: 'default' | 'compact' | 'mobile';
  className?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CAD: '$',
  GBP: '£',
  EUR: '€',
  AUD: '$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
};

function getCurrencySymbol(currencyCode: string, symbol?: string): string {
  return symbol || CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

export function CurrencySelector({
  variant = 'default',
  className = '',
}: CurrencySelectorProps) {
  const {countries, currentCountry, currentLanguage} = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const selectedCountry = countries.find((c) => c.isoCode === currentCountry);
  const displayName = selectedCountry?.name || 'United States';
  const currencyCode = selectedCountry?.currency?.isoCode || 'USD';
  const currencySymbol = getCurrencySymbol(
    currencyCode,
    (selectedCountry?.currency as any)?.symbol,
  );

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

  const handleSelect = (country: Country) => {
    setIsOpen(false);
    const currentPath = location.pathname.replace(/^\/[A-Z]{2}-[A-Z]{2}/i, '');
    const newPath = `/${currentLanguage}-${country.isoCode}${currentPath || '/'}`;
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
          <span className="ml-1">
            {currencyCode} {currencySymbol}
          </span>
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

        {isOpen && countries.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-[280px] max-h-[300px] overflow-y-auto bg-background border border-foreground-10 rounded-lg shadow-lg z-50">
            {countries.map((country) => (
              <button
                key={country.isoCode}
                type="button"
                className={`w-full px-4 py-3 text-left text-2xl text-foreground hover:bg-foreground-5 transition-colors duration-200 ${
                  country.isoCode === currentCountry
                    ? 'bg-foreground-5 font-medium'
                    : ''
                }`}
                onClick={() => handleSelect(country)}
              >
                {country.name} -{' '}
                {getCurrencySymbol(
                  country.currency.isoCode,
                  (country.currency as any)?.symbol,
                )}{' '}
                {country.currency.isoCode}
              </button>
            ))}
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
          <span>
            {displayName} {currencyCode} {currencySymbol}
          </span>
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

        {isOpen && countries.length > 0 && (
          <div className="absolute top-full right-0 mt-2 w-[220px] max-h-[300px] overflow-y-auto bg-background border border-foreground-10 rounded-lg shadow-lg z-50">
            {countries.map((country) => (
              <button
                key={country.isoCode}
                type="button"
                className={`w-full px-4 py-2 text-left text-[1.3rem] text-foreground hover:bg-foreground-5 transition-colors duration-200 ${
                  country.isoCode === currentCountry
                    ? 'bg-foreground-5 font-medium'
                    : ''
                }`}
                onClick={() => handleSelect(country)}
              >
                {country.name} - {country.currency.isoCode}
              </button>
            ))}
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
        <span>
          {displayName} {currencyCode} {currencySymbol}
        </span>
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

      {isOpen && countries.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-[250px] max-h-[300px] overflow-y-auto bg-background border border-foreground-10 rounded-lg shadow-lg z-50">
          {countries.map((country) => (
            <button
              key={country.isoCode}
              type="button"
              className={`w-full px-4 py-3 text-left text-[1.4rem] text-foreground hover:bg-foreground-5 transition-colors duration-200 ${
                country.isoCode === currentCountry
                  ? 'bg-foreground-5 font-medium'
                  : ''
              }`}
              onClick={() => handleSelect(country)}
            >
              {country.name} -{' '}
              {getCurrencySymbol(
                country.currency.isoCode,
                (country.currency as any)?.symbol,
              )}{' '}
              {country.currency.isoCode}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
