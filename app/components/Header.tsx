import {Suspense, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {SocialIcons} from '~/components/shared/SocialIcons';
import {CurrencySelector} from '~/components/shared/CurrencySelector';
import {LanguageSelector} from '~/components/shared/LanguageSelector';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

interface DropdownClasses {
  container: string;
  inner: string;
}

// Function to determine dropdown classes based on submenu item count
function getDropdownClasses(itemCount: number): DropdownClasses {
  const baseClasses: string =
    'absolute top-full left-0 bg-white shadow-lg z-50 opacity-0 invisible pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto';

  if (itemCount === 1) {
    // Single column dropdown (like Pages menu)
    return {
      container: `dropdown ${baseClasses} pt-4 min-w-[180px]`,
      inner: 'dropdown-inner flex flex-col border-l-2 border-gray-300 pl-4 ml-2',
    };
  } else if (itemCount === 2) {
    // Two column submenu
    return {
      container: `header__sub_menu ${baseClasses} py-5 px-6 min-w-[220px]`,
      inner: 'header__sub_menu-inner grid',
    };
  } else {
    // Megamenu (3+ columns) - full-width with fixed positioning relative to viewport
    return {
      container: `header__mega_menu fixed top-auto left-0 right-0 bg-white shadow-lg z-50 opacity-0 invisible pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto py-5 pb-8`,
      inner: 'header__mega_menu-inner page-width mx-auto grid grid-cols-4 gap-16',
    };
  }
}

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps): JSX.Element {
  const {shop, menu} = header;
  const [logoError, setLogoError] = useState<boolean>(false);

  return (
    <header className="container-fluid flex items-center justify-between sticky top-0 z-5 h-[72px] px-[1rem] shadow-[0_1px_5px_rgba(var(--color-foreground),.1)] bg-[rgb(var(--color-background))]" data-color-scheme="scheme-1">
      {/* Mobile Left - Hamburger Menu (small mobile only) */}
      <div className="flex min-[768px]:hidden items-center">
        <HeaderMenuMobileToggle />
      </div>

      {/* Desktop Left - Logo */}
      <NavLink
        prefetch="intent"
        to="/"
        className="flex items-center"
        end
      >
        {!logoError ? (
          <img
            src="/logo.png"
            alt={shop.name}
            className="w-[88.5px] min-[992px]:w-[140px] h-auto"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="text-2xl">
            <span className="font-bold text-black">mav</span>
            <span className="font-normal text-gray-400">on</span>
          </div>
        )}
      </NavLink>


      {/* Desktop Navigation - Centered */}
      <div className="max-[991px]:hidden flex flex-1 justify-center">
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </div>

      {/* Right Side Icons */}
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}): JSX.Element {
  const {close} = useAside();

  // Desktop Menu
  if (viewport === 'desktop') {
    return (
      <nav className="flex items-center justify-center" role="navigation">
        {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
          if (!item.url) return null;

          const hasSubmenu: boolean = !!(item.items && item.items.length > 0);
          const submenuCount: number = item.items ? item.items.length : 0;
          const dropdownClasses: DropdownClasses = getDropdownClasses(submenuCount);

          // Check if any submenu item has third level items (for megamenu)
          const hasThirdLevelItems: boolean = item.items?.some(
            (subItem) => subItem.items && subItem.items.length > 0
          ) || false;

          const url: string =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;

          return (
            <div key={item.id} className="relative group header__menu_li text-[1.6rem] font-semibold">
              <NavLink
                className={({isActive}) =>
                  `inline-flex items-center gap-1 py-10 whitespace-nowrap transition-colors duration-200 ${
                    isActive ? 'text-black' : 'text-gray-700 hover:text-black'
                  }`
                }
                style={{display: 'inline-flex'}}
                end={!hasSubmenu}
                prefetch="intent"
                to={url}
              >
                {item.title}
                {hasSubmenu && (
                  <svg
                    className="w-[1.5rem] h-[1.5rem] flex-shrink-0 transition-transform duration-300 group-hover:rotate-x-[180deg] absolute top-[44%] -right-[45%]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </NavLink>

              {/* Active indicator line */}
              <span className="absolute bottom-1 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full" />

              {/* Dropdown Menu */}
              {hasSubmenu && (
                <div className={dropdownClasses.container}>
                  {/* Invisible bridge */}
                  <div className="absolute -top-2 left-0 right-0 h-2" />
                  
                  <div className={dropdownClasses.inner}>
                    {item.items.map((subItem) => {
                      if (!subItem.url) return null;

                      const subUrl: string =
                        subItem.url.includes('myshopify.com') ||
                        subItem.url.includes(publicStoreDomain) ||
                        subItem.url.includes(primaryDomainUrl)
                          ? new URL(subItem.url).pathname
                          : subItem.url;

                      const hasThirdLevel: boolean = !!(
                        subItem.items && subItem.items.length > 0
                      );

                      // For single column dropdown (no third level)
                      if (submenuCount === 1 || !hasThirdLevelItems) {
                        return (
                          <NavLink
                            key={subItem.id}
                            to={subUrl}
                            className="relative inline-flex w-fit py-2
                            text-gray-600 text-[1.6rem] font-normal
                            hover:text-black
                            transition-colors duration-200
                            after:content-['']
                            after:absolute after:left-0 after:bottom-0
                            after:h-[1px]
                            after:w-full
                            after:bg-black
                            after:scale-x-0 after:origin-left
                            after:transition-transform after:duration-300
                            hover:after:scale-x-100"
                            prefetch="intent"
                          >
                            {subItem.title}
                          </NavLink>
                        );
                      }

                      // For megamenu with third level items
                      return (
                        <div key={subItem.id} className="submenu flex flex-col">
                          <NavLink
                            to={subUrl}
                            className="submenu-title text-[1.7rem] font-bold text-black mb-5 hover:text-gray-600 transition-colors duration-200"
                            prefetch="intent"
                          >
                            {subItem.title}
                          </NavLink>

                          {hasThirdLevel && (
                            <ul className="third-level flex flex-col gap-4 list-none p-0 m-0">
                              {subItem.items.map((thirdItem) => {
                                if (!thirdItem.url) return null;

                                const thirdUrl: string =
                                  thirdItem.url.includes('myshopify.com') ||
                                  thirdItem.url.includes(publicStoreDomain) ||
                                  thirdItem.url.includes(primaryDomainUrl)
                                    ? new URL(thirdItem.url).pathname
                                    : thirdItem.url;

                                return (
                                  <li
                                    key={thirdItem.id}
                                    className="third-level-item"
                                  >
                                    <NavLink
                                      to={thirdUrl}
                                      prefetch="intent"
                                      className="third-level-link
                                      relative inline-block pb-2
                                      text-gray-500 text-[1.6rem] font-normal
                                      hover:text-black
                                      transition-colors duration-200
                                      after:content-['']
                                      after:absolute after:left-0 after:bottom-0
                                      after:h-[1px] after:w-full
                                      after:bg-black
                                      after:scale-x-0 after:origin-left
                                      after:transition-transform after:duration-300
                                      hover:after:scale-x-100"
                                    >
                                      {thirdItem.title}
                                    </NavLink>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  // Mobile Menu
  return (
    <nav className="flex flex-col w-full" role="navigation">
      <NavLink
        end
        onClick={close}
        prefetch="intent"
        className="py-4 text-black font-medium border-b border-gray-100"
        to="/"
      >
        Home
      </NavLink>
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const hasSubmenu: boolean = !!(item.items && item.items.length > 0);

        const url: string =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        return (
          <div
            key={item.id}
            className="flex flex-wrap items-center w-full border-b border-gray-100"
          >
            <NavLink
              className="flex-1 py-4 text-black font-medium"
              end
              onClick={hasSubmenu ? undefined : close}
              prefetch="intent"
              to={url}
            >
              {item.title}
            </NavLink>

            {hasSubmenu && (
              <MobileSubmenu
                item={item}
                primaryDomainUrl={primaryDomainUrl}
                publicStoreDomain={publicStoreDomain}
                close={close}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

interface MobileSubmenuProps {
  item: any;
  primaryDomainUrl: string;
  publicStoreDomain: string;
  close: () => void;
}

function MobileSubmenu({
  item,
  primaryDomainUrl,
  publicStoreDomain,
  close,
}: MobileSubmenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="mobile-submenu-wrapper contents">
      <button
        className={`p-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mobile-megamenu w-full flex flex-col pl-4 py-3 bg-gray-50 border-t border-gray-100">
          {item.items.map((subItem: any) => {
            if (!subItem.url) return null;

            const subUrl: string =
              subItem.url.includes('myshopify.com') ||
              subItem.url.includes(publicStoreDomain) ||
              subItem.url.includes(primaryDomainUrl)
                ? new URL(subItem.url).pathname
                : subItem.url;

            const hasThirdLevel: boolean = !!(
              subItem.items && subItem.items.length > 0
            );

            return (
              <div
                key={subItem.id}
                className="mobile-submenu flex flex-col py-3 border-b border-gray-100 last:border-b-0"
              >
                <NavLink
                  to={subUrl}
                  onClick={close}
                  prefetch="intent"
                  className="submenu-link text-black font-semibold py-1"
                >
                  {subItem.title}
                </NavLink>

                {hasThirdLevel && (
                  <div className="mobile-third-level flex flex-col pl-4 mt-2 gap-2">
                    {subItem.items.map((thirdItem: any) => {
                      if (!thirdItem.url) return null;

                      const thirdUrl: string =
                        thirdItem.url.includes('myshopify.com') ||
                        thirdItem.url.includes(publicStoreDomain) ||
                        thirdItem.url.includes(primaryDomainUrl)
                          ? new URL(thirdItem.url).pathname
                          : thirdItem.url;

                      return (
                        <NavLink
                          key={thirdItem.id}
                          to={thirdUrl}
                          onClick={close}
                          prefetch="intent"
                          className="third-level-link text-gray-500 py-1 hover:text-black transition-colors duration-200"
                        >
                          {thirdItem.title}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>): JSX.Element {
  const {open} = useAside();
  return (
    <nav className="header__actions menu--bottom-logo-left logo--menu-1-line col-auto flex items-center gap-1" role="navigation">
      {/* Search Icon */}
      <SearchToggle />
      {/* Cart Icon */}
      <CartToggle cart={cart} />
      {/* Account Icon - Desktop only */}
      <NavLink
        prefetch="intent"
        to="/account"
        className="header__actions_btn header__actions_btn--user hide-mobile pl-8 py-0 text-gray-700 hover:text-black transition-colors duration-200"
      >
        <Suspense fallback={<AccountIcon />}>
          <Await resolve={isLoggedIn} errorElement={<AccountIcon />}>
            {(isLoggedIn: boolean) => (isLoggedIn ? <AccountIcon filled /> : <AccountIcon />)}
          </Await>
        </Suspense>
      </NavLink>
      {/* Hamburger - Tablet only (768px-991px) */}
      <button
        className="header__actions_btn header__actions_btn--menu min-[991px]:hidden max-[768px]:hidden show-tablet-only px-8 py-0 text-gray-700 hover:text-black transition-colors duration-200"
        onClick={() => open('mobile')}
        type="button"
      >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            role="presentation"
            className="w-9 h-9"
            fill="none"
            viewBox="0 0 18 16"
          >
            <path
              d="M1 .5a.5.5 0 100 1h15.71a.5.5 0 000-1H1zM.5 8a.5.5 0 01.5-.5h15.71a.5.5 0 010 1H1A.5.5 0 01.5 8zm0 7a.5.5 0 01.5-.5h15.71a.5.5 0 010 1H1a.5.5 0 01-.5-.5z"
              fill="currentColor"
            />
          </svg>

      </button>
    </nav>
  );
}

function HeaderMenuMobileToggle(): JSX.Element {
  const {open} = useAside();
  return (
    <button
      className="px-8 py-0 text-gray-700 hover:text-black transition-colors duration-200"
      onClick={() => open('mobile')}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        role="presentation"
        className="w-9 h-9"
        fill="none"
        viewBox="0 0 18 16"
      >
        <path
          d="M1 .5a.5.5 0 100 1h15.71a.5.5 0 000-1H1zM.5 8a.5.5 0 01.5-.5h15.71a.5.5 0 010 1H1A.5.5 0 01.5 8zm0 7a.5.5 0 01.5-.5h15.71a.5.5 0 010 1H1a.5.5 0 01-.5-.5z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

function SearchToggle(): JSX.Element {
  const {open} = useAside();
  return (
    <button
      className="header__actions_btn header__actions_btn--search px-8 py-0 text-gray-700 hover:text-black transition-colors duration-200"
      onClick={() => open('search')}
      type="button"
    >
      <svg className="w-9.5 h-8" stroke="currentColor" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.792 12.792L16.5837 16.5837M1.41699 7.91699C1.41699 8.77058 1.58512 9.61582 1.91178 10.4044C2.23843 11.1931 2.71722 11.9096 3.3208 12.5132C3.92438 13.1168 4.64093 13.5956 5.42955 13.9222C6.21817 14.2489 7.0634 14.417 7.91699 14.417C8.77058 14.417 9.61582 14.2489 10.4044 13.9222C11.1931 13.5956 11.9096 13.1168 12.5132 12.5132C13.1168 11.9096 13.5956 11.1931 13.9222 10.4044C14.2489 9.61582 14.417 8.77058 14.417 7.91699C14.417 6.19308 13.7322 4.53978 12.5132 3.3208C11.2942 2.10181 9.6409 1.41699 7.91699 1.41699C6.19308 1.41699 4.53978 2.10181 3.3208 3.3208C2.10181 4.53978 1.41699 6.19308 1.41699 7.91699V7.91699Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
    </button>
  );
}

interface AccountIconProps {
  filled?: boolean;
}

function AccountIcon({filled = false}: AccountIconProps): JSX.Element {
  return (
    <svg className="w-9.5 h-8" stroke="currentColor" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.7941 8.67198C11.0535 9.37141 10.0485 9.76481 9 9.76481C7.9515 9.76481 6.94648 9.37141 6.2059 8.67198C5.46542 7.97264 5.05 7.02475 5.05 6.03704C5.05 5.04932 5.46542 4.10144 6.2059 3.4021C6.94648 2.70266 7.9515 2.30926 9 2.30926C10.0485 2.30926 11.0535 2.70266 11.7941 3.4021C12.5346 4.10144 12.95 5.04932 12.95 6.03704C12.95 7.02475 12.5346 7.97264 11.7941 8.67198ZM5.19443 9.63511C6.20419 10.5888 7.57314 11.1241 9 11.1241C10.4269 11.1241 11.7958 10.5888 12.8056 9.63511C13.8154 8.68136 14.3833 7.38716 14.3833 6.03704C14.3833 4.68692 13.8154 3.39272 12.8056 2.43896C11.7958 1.4853 10.4269 0.95 9 0.95C7.57314 0.95 6.20419 1.4853 5.19443 2.43896C4.18457 3.39272 3.61667 4.68692 3.61667 6.03704C3.61667 7.38716 4.18457 8.68136 5.19443 9.63511ZM15.6167 15.4815V17.3704C15.6167 17.5516 15.6929 17.7247 15.8276 17.8519C15.9622 17.9791 16.1442 18.05 16.3333 18.05C16.5225 18.05 16.7045 17.9791 16.8391 17.8519C16.9738 17.7247 17.05 17.5516 17.05 17.3704V15.4815C17.05 14.6323 16.6928 13.8186 16.058 13.2191C15.4233 12.6196 14.5631 12.2833 13.6667 12.2833H4.33333C3.43691 12.2833 2.57667 12.6196 1.94198 13.2191C1.30719 13.8186 0.95 14.6323 0.95 15.4815V17.3704C0.95 17.5516 1.02624 17.7247 1.16093 17.8519C1.29552 17.9791 1.47749 18.05 1.66667 18.05C1.85585 18.05 2.03781 17.9791 2.1724 17.8519C2.30709 17.7247 2.38333 17.5516 2.38333 17.3704V15.4815C2.38333 14.9947 2.58804 14.5273 2.95345 14.1822C3.31896 13.837 3.81527 13.6426 4.33333 13.6426H13.6667C14.1847 13.6426 14.681 13.837 15.0465 14.1822C15.412 14.5273 15.6167 14.9947 15.6167 15.4815Z" fill="currentColor" stroke="currentColor" strokeWidth="0.1"></path>
          </svg>

    
  );
}

interface CartBadgeProps {
  count: number | null;
}

function CartBadge({count}: CartBadgeProps): JSX.Element {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="header__actions_btn header__actions_btn--cart relative p-2 text-gray-700 hover:text-black transition-colors duration-200"
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <svg
  className="w-[2.316rem] h-8"
  viewBox="0 0 22 19"
  fill="currentColor"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M21.3679 6.22188C21.2916 6.13269 21.1969 6.06109 21.0903 6.012C20.9837 5.96291 20.8678 5.93749 20.7504 5.9375H15.8754V2.6875C15.8754 2.04103 15.6186 1.42105 15.1615 0.963927C14.7044 0.506807 14.0844 0.25 13.4379 0.25H8.56291C7.91645 0.25 7.29646 0.506807 6.83934 0.963927C6.38222 1.42105 6.12541 2.04103 6.12541 2.6875V5.9375H1.25041C1.13264 5.93617 1.01598 5.96045 0.908523 6.00868C0.801067 6.05691 0.705381 6.12792 0.628094 6.2168C0.550808 6.30568 0.493769 6.4103 0.46093 6.52342C0.428091 6.63653 0.420237 6.75543 0.437912 6.87188L1.96541 16.7438C2.02417 17.1312 2.221 17.4844 2.51961 17.7383C2.81823 17.9921 3.19852 18.1294 3.59041 18.125H18.4267C18.8186 18.1294 19.1988 17.9921 19.4975 17.7383C19.7961 17.4844 19.9929 17.1312 20.0517 16.7438L21.5629 6.87188C21.5792 6.75588 21.5702 6.63773 21.5365 6.52554C21.5029 6.41335 21.4454 6.30976 21.3679 6.22188ZM7.75041 2.6875C7.75041 2.47201 7.83602 2.26535 7.98839 2.11298C8.14076 1.9606 8.34742 1.875 8.56291 1.875H13.4379C13.6534 1.875 13.8601 1.9606 14.0124 2.11298C14.1648 2.26535 14.2504 2.47201 14.2504 2.6875V5.9375H7.75041V2.6875ZM18.4267 16.5H3.57416L2.20104 7.5625H19.7998L18.4267 16.5Z" />
</svg>

      {count !== null && count > 0 && (
        <span
        className="
          absolute -top-3.5 -right-1 md:right-4
          w-7 h-7
          flex items-center justify-center
          text-[11px] font-semibold leading-[1]
          text-[rgb(var(--color-button-text))]
          bg-[rgba(var(--color-button),var(--alpha-button-background))]
          rounded-full
          tracking-[0]
        "
      >
        {count}
      </span>
      )}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>): JSX.Element {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner(): JSX.Element {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Home',
      type: 'HTTP',
      url: '/',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Store',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

// =============================================================================
// MOBILE MENU COMPONENTS
// =============================================================================

interface MobileMenuContentProps {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: string;
  publicStoreDomain: string;
  isLoggedIn: Promise<boolean>;
  shopName: string;
}

export function MobileMenuContent({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
  isLoggedIn,
}: MobileMenuContentProps): JSX.Element {
  const {close} = useAside();

  return (
    <div className="mobile-menu-content flex flex-col h-[calc(100vh-60px)] overflow-y-auto">
      {/* Navigation Menu */}
      <nav className="flex-1">
        {/* Menu items with accordion */}
        {(menu || FALLBACK_HEADER_MENU).items.map((item) => (
          <MobileMenuItemAccordion
            key={item.id}
            item={item}
            primaryDomainUrl={primaryDomainUrl}
            publicStoreDomain={publicStoreDomain}
            close={close}
          />
        ))}
      </nav>

      {/* Log in link */}
      <div className="px-8 py-6">
        <Suspense fallback={<MobileAccountLink isLoggedIn={false} close={close} />}>
          <Await resolve={isLoggedIn}>
            {(loggedIn: boolean) => <MobileAccountLink isLoggedIn={loggedIn} close={close} />}
          </Await>
        </Suspense>
      </div>

      {/* Locale selectors */}
      <div className="flex flex-wrap justify-center gap-3 px-5 py-7 border-t border-foreground-10">
        <CurrencySelector variant="mobile" />
        <LanguageSelector variant="mobile" />
      </div>

      {/* Social icons */}
      <div className="flex justify-center px-7 pt-2 pb-10">
        <SocialIcons size="md" gap="lg" />
      </div>
    </div>
  );
}

interface MobileMenuItemAccordionProps {
  item: any;
  primaryDomainUrl: string;
  publicStoreDomain: string;
  close: () => void;
}

function MobileMenuItemAccordion({
  item,
  primaryDomainUrl,
  publicStoreDomain,
  close,
}: MobileMenuItemAccordionProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hasSubmenu: boolean = !!(item.items && item.items.length > 0);

  const url: string =
    item.url.includes('myshopify.com') ||
    item.url.includes(publicStoreDomain) ||
    item.url.includes(primaryDomainUrl)
      ? new URL(item.url).pathname
      : item.url;

  return (
    <div className="border-b border-foreground-10">
      <div className="flex items-center justify-between">
        <NavLink
          to={url}
          onClick={hasSubmenu ? undefined : close}
          className="flex-1 px-8 py-6 text-2xl text-foreground no-underline hover:bg-foreground-5 transition-colors duration-200"
        >
          {item.title}
        </NavLink>
        {hasSubmenu && (
          <button
            className="px-5 py-4 bg-transparent border-none text-lg text-foreground cursor-pointer flex items-center justify-center hover:opacity-70 transition-opacity duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            type="button"
          >
            <span className={`inline-block font-medium leading-none text-[2.5rem] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
              +
            </span>
          </button>
        )}
      </div>

      {/* Animated submenu using CSS Grid */}
      {hasSubmenu && (
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pl-0 border-t border-foreground-10">
              {item.items.map((subItem: any) => (
                <MobileSubMenuItemAccordion
                  key={subItem.id}
                  item={subItem}
                  primaryDomainUrl={primaryDomainUrl}
                  publicStoreDomain={publicStoreDomain}
                  close={close}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MobileSubMenuItemAccordionProps {
  item: any;
  primaryDomainUrl: string;
  publicStoreDomain: string;
  close: () => void;
}

function MobileSubMenuItemAccordion({
  item,
  primaryDomainUrl,
  publicStoreDomain,
  close,
}: MobileSubMenuItemAccordionProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hasThirdLevel: boolean = !!(item.items && item.items.length > 0);

  const url: string =
    item.url.includes('myshopify.com') ||
    item.url.includes(publicStoreDomain) ||
    item.url.includes(primaryDomainUrl)
      ? new URL(item.url).pathname
      : item.url;

  return (
    <div className="border-b border-foreground-10 last:border-b-0">
      <div className="flex border-t border-foreground-10 first:border-t-0 items-center justify-between">
        <NavLink
          to={url}
          onClick={hasThirdLevel ? undefined : close}
          className="flex-1 py-6 pr-0 pl-12 text-2xl text-foreground no-underline hover:opacity-70 transition-opacity duration-200"
        >
          {item.title}
        </NavLink>
        {hasThirdLevel && (
          <button
            className="px-5 py-3 bg-transparent border-none text-lg text-foreground cursor-pointer flex items-center justify-center hover:opacity-70 transition-opacity duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            type="button"
          >
            <span className={`inline-block font-medium leading-none text-[2.5rem] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
              +
            </span>
          </button>
        )}
      </div>

      {/* Animated third level using CSS Grid */}
      {hasThirdLevel && (
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pl-0">
              {item.items.map((thirdItem: any) => {
                if (!thirdItem.url) return null;

                const thirdUrl: string =
                  thirdItem.url.includes('myshopify.com') ||
                  thirdItem.url.includes(publicStoreDomain) ||
                  thirdItem.url.includes(primaryDomainUrl)
                    ? new URL(thirdItem.url).pathname
                    : thirdItem.url;

                return (
                  <NavLink
                    key={thirdItem.id}
                    to={thirdUrl}
                    onClick={close}
                    className="block border-t border-foreground-10 last:border-b-0 py-6 pr-0 pl-16 text-2xl text-foreground-75 no-underline hover:text-foreground transition-colors duration-200"
                  >
                    {thirdItem.title}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MobileAccountLinkProps {
  isLoggedIn: boolean;
  close: () => void;
}

function MobileAccountLink({isLoggedIn, close}: MobileAccountLinkProps): JSX.Element {
  return (
    <NavLink
      to="/account"
      onClick={close}
      className="flex items-center gap-3 text-2xl text-foreground no-underline hover:opacity-70 transition-opacity duration-200"
    >
      <svg className="w-7.5" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.7941 8.67198C11.0535 9.37141 10.0485 9.76481 9 9.76481C7.9515 9.76481 6.94648 9.37141 6.2059 8.67198C5.46542 7.97264 5.05 7.02475 5.05 6.03704C5.05 5.04932 5.46542 4.10144 6.2059 3.4021C6.94648 2.70266 7.9515 2.30926 9 2.30926C10.0485 2.30926 11.0535 2.70266 11.7941 3.4021C12.5346 4.10144 12.95 5.04932 12.95 6.03704C12.95 7.02475 12.5346 7.97264 11.7941 8.67198ZM5.19443 9.63511C6.20419 10.5888 7.57314 11.1241 9 11.1241C10.4269 11.1241 11.7958 10.5888 12.8056 9.63511C13.8154 8.68136 14.3833 7.38716 14.3833 6.03704C14.3833 4.68692 13.8154 3.39272 12.8056 2.43896C11.7958 1.4853 10.4269 0.95 9 0.95C7.57314 0.95 6.20419 1.4853 5.19443 2.43896C4.18457 3.39272 3.61667 4.68692 3.61667 6.03704C3.61667 7.38716 4.18457 8.68136 5.19443 9.63511ZM15.6167 15.4815V17.3704C15.6167 17.5516 15.6929 17.7247 15.8276 17.8519C15.9622 17.9791 16.1442 18.05 16.3333 18.05C16.5225 18.05 16.7045 17.9791 16.8391 17.8519C16.9738 17.7247 17.05 17.5516 17.05 17.3704V15.4815C17.05 14.6323 16.6928 13.8186 16.058 13.2191C15.4233 12.6196 14.5631 12.2833 13.6667 12.2833H4.33333C3.43691 12.2833 2.57667 12.6196 1.94198 13.2191C1.30719 13.8186 0.95 14.6323 0.95 15.4815V17.3704C0.95 17.5516 1.02624 17.7247 1.16093 17.8519C1.29552 17.9791 1.47749 18.05 1.66667 18.05C1.85585 18.05 2.03781 17.9791 2.1724 17.8519C2.30709 17.7247 2.38333 17.5516 2.38333 17.3704V15.4815C2.38333 14.9947 2.58804 14.5273 2.95345 14.1822C3.31896 13.837 3.81527 13.6426 4.33333 13.6426H13.6667C14.1847 13.6426 14.681 13.837 15.0465 14.1822C15.412 14.5273 15.6167 14.9947 15.6167 15.4815Z" fill="currentColor" stroke="currentColor" strokeWidth="0.1"/>
      </svg>
      <span>{isLoggedIn ? 'Account' : 'Log in'}</span>
    </NavLink>
  );
}

