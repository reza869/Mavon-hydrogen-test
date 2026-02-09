import {Await, Link, NavLink} from 'react-router';
import {Suspense, useId, useState, useEffect, useRef} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside, useAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu, MobileMenuContent} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {AnnouncementBar} from '~/components/AnnouncementBar';
import {LocaleProvider, type Country, type Language} from '~/components/shared/LocaleContext';

interface LocalizationData {
  countries: Country[];
  languages: Language[];
  currentCountry: string;
  currentLanguage: string;
}

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  localization?: LocalizationData;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  localization,
}: PageLayoutProps) {
  return (
    <LocaleProvider
      countries={localization?.countries}
      languages={localization?.languages}
      currentCountry={localization?.currentCountry}
      currentLanguage={localization?.currentLanguage}
    >
      <Aside.Provider>
        <CartAside cart={cart} />
        <SearchModal />
        <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} isLoggedIn={isLoggedIn} />
        <AnnouncementBar />
        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}
        <main>{children}</main>
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside.Provider>
    </LocaleProvider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  const {close} = useAside();

  const customHeader = (
    <header className="flex items-center justify-between px-5 py-4 border-b border-foreground-10">
      <div className="flex items-center gap-4">
        <svg className="w-5 h-5 text-foreground" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" stroke="none"/>
        </svg>
        <span className="text-[1.6rem] font-semibold text-foreground">Item added to your cart</span>
      </div>
      <button
        onClick={close}
        className="p-1 hover:opacity-70 transition-opacity"
        aria-label="Close cart"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 5L5 15M5 5L15 15" strokeLinecap="round"/>
        </svg>
      </button>
    </header>
  );

  return (
    <Aside type="cart" heading="CART" customHeader={customHeader}>
      <Suspense fallback={<p className="p-5">Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchModal() {
  const {type, close} = useAside();
  const isOpen = type === 'search';
  const queriesDatalistId = useId();
  const [searchValue, setSearchValue] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    // Reset closing state when modal opens
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isClosing]);

  const handleClose = () => {
    if (isClosing) return; // Prevent multiple close triggers
    setIsClosing(true);
    setTimeout(() => {
      close();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
      setSearchValue('');
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 bg-shadow-30 z-[100] flex flex-col items-stretch ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      onClick={handleClose}
    >
      <div
        className={`color-scheme-1 relative w-full py-30 shadow-lg overflow-hidden flex flex-col bg-background ${isClosing ? 'animate-slideUp' : 'animate-slideDown'}`}
        onClick={(e) => e.stopPropagation()}
      >
        

        {/* Content area - constrained to 80rem, vertically centered */}
        <div className="max-w-[80rem] w-full relative mx-auto px-6 flex-1 flex items-center">
          <div className="w-full">
            <SearchFormPredictive>
              {({fetchResults, goToSearch}) => (
                <div className="flex items-center border border-foreground-20">
                  <input
                    name="q"
                    ref={inputRef}
                    onChange={(e) => {
                      fetchResults(e);
                      setSearchValue(e.target.value);
                    }}
                    onFocus={fetchResults}
                    placeholder="Search our store"
                    type="search"
                    className="flex-1 py-0 pr-[8rem] pl-[20px] h-20 text-[1.4rem] border-none outline-none bg-transparent text-foreground placeholder:text-foreground-50 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                    list={queriesDatalistId}
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-2 text-[18px] text-foreground-50 hover:text-foreground-75 bg-transparent border-none cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={goToSearch}
                    className="px-4 text-foreground-50 hover:text-foreground-75 bg-transparent border-none cursor-pointer flex items-center justify-center"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="9" cy="9" r="6" />
                      <path d="M13.5 13.5L17 17" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
            </SearchFormPredictive>



            

            {/* Search results */}
            <SearchResultsPredictive>
              {({items, total, term, state, closeSearch}) => {
                const {products, queries} = items;

                if (state === 'loading' && term.current) {
                  return <div className="py-6 text-foreground-50 text-[1.4rem]">Loading...</div>;
                }

                if (!total) {
                  return <SearchResultsPredictive.Empty term={term} />;
                }

                return (
                  <div className="mt-6 max-h-[calc(80vh-150px)] overflow-y-auto">
                    <SearchResultsPredictive.Queries
                      queries={queries}
                      queriesDatalistId={queriesDatalistId}
                    />
                    <SearchResultsPredictive.Products
                      products={products}
                      closeSearch={closeSearch}
                      term={term}
                    />
                    {term.current && total ? (
                      <Link
                        onClick={closeSearch}
                        to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                        className="flex items-center justify-between py-4 mt-4 border-t border-foreground-10 text-3xl text-foreground"
                      >
                        <span className="underline">Search for "{term.current}"</span>
                        <span>→</span>
                      </Link>
                    ) : null}
                  </div>
                );
              }}
            </SearchResultsPredictive>
          </div>
          {/* Close button - positioned at top right */}
        <button
          onClick={handleClose}
          className="absolute top-4 -right-10 text-[28px] text-foreground-50 hover:text-foreground-75 transition-colors z-10 p-0 bg-transparent border-none cursor-pointer leading-none"
          aria-label="Close search"
        >
          ×
        </button>
        </div>
      </div>
    </div>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
  isLoggedIn,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
  isLoggedIn: Promise<boolean>;
}) {
  const {close} = useAside();
  const [logoError, setLogoError] = useState<boolean>(false);

  // Custom header with logo and close button
  const customHeader = (
    <header className="flex items-center justify-between px-5 py-4 border-b border-foreground-10 h-[60px]">
      <NavLink to="/" onClick={close} className="flex items-center">
        {!logoError ? (
          <img
            src="/logo.png"
            alt={header.shop.name}
            className="h-7 w-auto"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="text-xl">
            <span className="font-bold text-foreground">mav</span>
            <span className="font-normal text-foreground-50">on</span>
          </div>
        )}
      </NavLink>
      <button
        className="p-2 text-foreground flex items-center justify-center hover:opacity-70 transition-opacity duration-200"
        onClick={close}
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </header>
  );

  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU" customHeader={customHeader}>
        <MobileMenuContent
          menu={header.menu}
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          isLoggedIn={isLoggedIn}
          shopName={header.shop.name}
        />
      </Aside>
    )
  );
}
