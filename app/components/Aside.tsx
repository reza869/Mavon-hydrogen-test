import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
  customHeader,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
  customHeader?: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  // Cart drawer specific classes
  const isCart = type === 'cart';
  const asideClasses = isCart
    ? 'color-scheme-1 fixed top-0 right-0 h-full w-full max-w-[420px] bg-[rgb(var(--color-background))] shadow-xl transform transition-transform duration-300 ease-out z-[60] flex flex-col'
    : '';
  const mainClasses = isCart ? 'flex-1 overflow-hidden' : '';

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
    >
      <button className="close-outside" onClick={close} />
      <aside className={asideClasses}>
        {customHeader ? (
          customHeader
        ) : (
          <header>
            <h3>{heading}</h3>
            <button className="close reset" onClick={close} aria-label="Close">
              &times;
            </button>
          </header>
        )}
        <main className={mainClasses}>{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
