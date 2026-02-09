import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useState, useEffect, useRef} from 'react';
import {Link, useFetcher} from 'react-router';
import type {FetcherWithComponents} from 'react-router';
import {useAside} from './Aside';
import {ShippingCalculator} from './ShippingCalculator';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  if (layout === 'aside') {
    return <CartSummaryAside cart={cart} />;
  }

  // Page layout with 3-column grid
  return <CartSummaryPage cart={cart} />;
}

function CartSummaryPage({cart}: {cart: OptimisticCart<CartApiQueryFragment | null>}) {
  const noteFetcher = useFetcher();
  const [noteText, setNoteText] = useState(cart?.note || '');
  const [discountExpanded, setDiscountExpanded] = useState(true); // Expanded by default

  // Get all discount codes including invalid ones
  const allDiscountCodes = cart?.discountCodes || [];
  const invalidCodes = allDiscountCodes.filter((discount) => !discount.applicable);
  const hasInvalidCode = invalidCodes.length > 0;

  // Valid codes (applicable: true)
  const codes: string[] = allDiscountCodes
    .filter((discount) => discount.applicable)
    .map(({code}) => code);

  // Calculate total discount amount from discountAllocations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartAny = cart as any;
  const discountAmount = cartAny?.discountAllocations?.reduce((total: number, allocation: {discountedAmount?: {amount?: string}}) => {
    return total + parseFloat(allocation.discountedAmount?.amount || '0');
  }, 0) || 0;

  const discountCurrency = cartAny?.discountAllocations?.[0]?.discountedAmount?.currencyCode || cart?.cost?.subtotalAmount?.currencyCode || 'USD';

  // Calculate discounted subtotal (like Cart Drawer)
  const originalSubtotal = parseFloat(cart?.cost?.subtotalAmount?.amount || '0');
  const discountedSubtotal = originalSubtotal - discountAmount;
  const subtotalCurrency = cart?.cost?.subtotalAmount?.currencyCode || 'USD';

  // Update noteText when cart note changes
  useEffect(() => {
    if (cart?.note !== undefined) {
      setNoteText(cart.note || '');
    }
  }, [cart?.note]);

  const handleNoteSave = () => {
    noteFetcher.submit(
      {cartNote: noteText},
      {method: 'POST', action: '/cart'}
    );
  };

  return (
    <div className="pt-12 border-t border-[rgba(var(--color-foreground),0.1)] color-scheme-1">
      <div className="flex justify-between max-[749px]:flex-col">
        {/* Column 1: Order Instructions - w-[35rem] ml-0 */}
        <div className="w-[35rem] max-[749px]:w-full max-[749px]:py-8 max-[749px]:border-b max-[749px]:border-[rgba(var(--color-foreground),0.08)]">
          <label htmlFor="cart-note" className="block text-[1.6rem] font-medium text-[rgba(var(--color-foreground),0.6)] mb-4">
            Order special instructions
          </label>
          <textarea
            id="cart-note"
            name="cartNote"
            className="w-full min-h-[130px] p-4 border border-[rgba(var(--color-foreground),0.1)] text-[1.4rem] font-inherit resize-y bg-[rgb(var(--color-background))] text-[rgb(var(--color-foreground))] focus:outline-none focus:border-[rgb(var(--color-foreground))] transition-colors"
            placeholder=""
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={handleNoteSave}
            rows={5}
          />
        </div>

        {/* Column 2: Shipping Calculator - w-[35rem] ml-16 */}
        <div className="w-[35rem] ml-16 max-[749px]:w-full max-[749px]:ml-0 max-[749px]:py-8 max-[749px]:border-b max-[749px]:border-[rgba(var(--color-foreground),0.08)]">
          <ShippingCalculatorPage />
        </div>

        {/* Column 3: Discount + Subtotal + Checkout - w-[35rem] ml-16 */}
        <div className="w-[35rem] ml-16 max-[749px]:w-full max-[749px]:ml-0 max-[749px]:py-8">
          {/* Discount Section */}
          <div className="mb-8 py-4 border-y border-[rgba(var(--color-foreground),0.1)]">
            <button
              type="button"
              onClick={() => setDiscountExpanded(!discountExpanded)}
              className="flex items-center justify-between w-full p-0 bg-transparent border-none cursor-pointer"
            >
              <span className="text-[1.6rem] font-semibold text-[rgb(var(--color-foreground))]">Discount</span>
              <span className="text-[2.2rem] text-[rgb(var(--color-foreground))]">{discountExpanded ? '−' : '+'}</span>
            </button>

            {discountExpanded && (
              <UpdateDiscountForm discountCodes={codes}>
                {(fetcher) => {
                  const isLoading = fetcher.state !== 'idle';
                  const errors = fetcher.data?.errors;
                  const hasApiError = errors && errors.length > 0;

                  return (
                    <div className="my-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="discountCode"
                          placeholder="Enter discount code"
                          disabled={isLoading}
                          className="flex-1 py-4 px-6 border border-[rgba(var(--color-foreground),0.1)] rounded-[var(--button-border-radius)] text-[1.4rem] bg-[rgb(var(--color-background))] text-[rgb(var(--color-foreground))] focus:outline-none focus:border-[rgb(var(--color-foreground))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="py-4 px-8 bg-[rgb(var(--color-button))] text-[rgb(var(--color-button-text))] border-none rounded-[var(--button-border-radius)] text-[1.5rem] font-semibold cursor-pointer hover:bg-[rgb(var(--primary-button-hover-background))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {hasApiError && (
                        <div className="mt-3 p-3 bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.3)] rounded">
                          <span className="text-[1.2rem] text-[#dc3545]">{errors[0]?.message || 'Invalid discount code'}</span>
                        </div>
                      )}
                      {hasInvalidCode && (
                        <div className="mt-3 p-3 bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.3)] rounded">
                          <span className="text-[1.2rem] text-[#dc3545]">Invalid discount code: {invalidCodes.map((c) => c.code).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                }}
              </UpdateDiscountForm>
            )}

            {/* Applied discount codes - show in discount section with remove button */}
            {codes.length > 0 && (
              <div className="mt-4">
                <UpdateDiscountForm>
                  {(fetcher) => {
                    const isRemoving = fetcher.state !== 'idle';
                    return (
                      <div className="flex items-center gap-3 p-3 bg-[rgba(var(--color-foreground),0.03)] rounded">
                        <div>
                          <span className="flex items-center gap-2 text-[1.4rem] font-medium text-[rgb(var(--color-foreground))]">
                            <TagIcon />
                            {codes.join(', ')}
                          </span>
                          {discountAmount > 0 && (
                            <span className="flex text-[1.3rem] text-[rgba(var(--color-foreground),0.6)]">
                              (-<Money data={{amount: String(discountAmount), currencyCode: discountCurrency}} />)
                            </span>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isRemoving}
                          className="ml-auto w-8 h-8 flex items-center justify-center bg-transparent border border-[rgba(var(--color-foreground),0.2)] rounded cursor-pointer text-[1.4rem] text-[rgba(var(--color-foreground),0.5)] hover:text-[rgb(var(--color-foreground))] hover:border-[rgb(var(--color-foreground))] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ×
                        </button>
                      </div>
                    );
                  }}
                </UpdateDiscountForm>
              </div>
            )}
          </div>

          {/* Subtotal */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline">
              <span className="text-[1.6rem] font-semibold text-[rgb(var(--color-foreground))]">Subtotal</span>
              <span className="text-[1.6rem] font-normal text-[rgb(var(--color-foreground))]">
                {cart?.cost?.subtotalAmount?.amount ? (
                  <>
                    <Money data={{amount: String(discountedSubtotal), currencyCode: subtotalCurrency}} />
                  </>
                ) : (
                  '-'
                )}
              </span>
            </div>

            {/* Discount line - show when discount applied (like Cart Drawer) */}
            {codes.length > 0 && discountAmount > 0 && (
              <div className="flex justify-between items-center mt-3">
                <span className="flex items-center gap-2 text-[1.4rem] text-[rgb(var(--color-foreground))]">
                  <TagIcon />
                  {codes.join(', ')}
                </span>
                <span className="flex text-[1.4rem] text-[rgba(var(--color-foreground),0.6)] whitespace-nowrap">
                  (-<Money data={{amount: String(discountAmount), currencyCode: discountCurrency}} />)
                </span>
              </div>
            )}

            <p className="text-[1.2rem] text-[rgba(var(--color-foreground),0.6)] mt-2 text-right">
              Taxes and shipping calculated at checkout
            </p>
          </div>

          {/* Checkout Button */}
          {cart?.checkoutUrl && (
            <a
              href={cart.checkoutUrl}
              target="_self"
              className="block w-full py-5 text-center bg-[rgb(var(--color-button))] text-[rgb(var(--color-button-text))] rounded-[var(--button-border-radius)] text-[1.5rem] font-semibold no-underline hover:bg-[rgb(var(--primary-button-hover-background))] hover:text-[rgb(var(--primary-button-hover-text))] transition-colors"
            >
              Check out
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Shipping Calculator for Page layout (inline, not modal)
function ShippingCalculatorPage() {
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [shippingRates, setShippingRates] = useState<Array<{handle: string; title: string; estimatedCost: {amount: string; currencyCode: string}}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [countries, setCountries] = useState<Array<{isoCode: string; name: string}>>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const fetcher = useFetcher();
  const countryFetcher = useFetcher();
  const isLoading = fetcher.state !== 'idle';

  // Province data for countries that need it
  const PROVINCE_DATA: Record<string, Array<{code: string; name: string}>> = {
    US: [
      {code: '', name: '---'},
      {code: 'AL', name: 'Alabama'}, {code: 'AK', name: 'Alaska'}, {code: 'AZ', name: 'Arizona'},
      {code: 'AR', name: 'Arkansas'}, {code: 'CA', name: 'California'}, {code: 'CO', name: 'Colorado'},
      {code: 'CT', name: 'Connecticut'}, {code: 'DE', name: 'Delaware'}, {code: 'FL', name: 'Florida'},
      {code: 'GA', name: 'Georgia'}, {code: 'HI', name: 'Hawaii'}, {code: 'ID', name: 'Idaho'},
      {code: 'IL', name: 'Illinois'}, {code: 'IN', name: 'Indiana'}, {code: 'IA', name: 'Iowa'},
      {code: 'KS', name: 'Kansas'}, {code: 'KY', name: 'Kentucky'}, {code: 'LA', name: 'Louisiana'},
      {code: 'ME', name: 'Maine'}, {code: 'MD', name: 'Maryland'}, {code: 'MA', name: 'Massachusetts'},
      {code: 'MI', name: 'Michigan'}, {code: 'MN', name: 'Minnesota'}, {code: 'MS', name: 'Mississippi'},
      {code: 'MO', name: 'Missouri'}, {code: 'MT', name: 'Montana'}, {code: 'NE', name: 'Nebraska'},
      {code: 'NV', name: 'Nevada'}, {code: 'NH', name: 'New Hampshire'}, {code: 'NJ', name: 'New Jersey'},
      {code: 'NM', name: 'New Mexico'}, {code: 'NY', name: 'New York'}, {code: 'NC', name: 'North Carolina'},
      {code: 'ND', name: 'North Dakota'}, {code: 'OH', name: 'Ohio'}, {code: 'OK', name: 'Oklahoma'},
      {code: 'OR', name: 'Oregon'}, {code: 'PA', name: 'Pennsylvania'}, {code: 'RI', name: 'Rhode Island'},
      {code: 'SC', name: 'South Carolina'}, {code: 'SD', name: 'South Dakota'}, {code: 'TN', name: 'Tennessee'},
      {code: 'TX', name: 'Texas'}, {code: 'UT', name: 'Utah'}, {code: 'VT', name: 'Vermont'},
      {code: 'VA', name: 'Virginia'}, {code: 'WA', name: 'Washington'}, {code: 'WV', name: 'West Virginia'},
      {code: 'WI', name: 'Wisconsin'}, {code: 'WY', name: 'Wyoming'}, {code: 'DC', name: 'District of Columbia'},
    ],
    CA: [
      {code: '', name: '---'},
      {code: 'AB', name: 'Alberta'}, {code: 'BC', name: 'British Columbia'}, {code: 'MB', name: 'Manitoba'},
      {code: 'NB', name: 'New Brunswick'}, {code: 'NL', name: 'Newfoundland and Labrador'},
      {code: 'NS', name: 'Nova Scotia'}, {code: 'ON', name: 'Ontario'}, {code: 'PE', name: 'Prince Edward Island'},
      {code: 'QC', name: 'Quebec'}, {code: 'SK', name: 'Saskatchewan'},
    ],
    AU: [
      {code: '', name: '---'},
      {code: 'NSW', name: 'New South Wales'}, {code: 'QLD', name: 'Queensland'},
      {code: 'SA', name: 'South Australia'}, {code: 'TAS', name: 'Tasmania'},
      {code: 'VIC', name: 'Victoria'}, {code: 'WA', name: 'Western Australia'},
    ],
  };

  // Fetch countries on mount
  useEffect(() => {
    countryFetcher.load('/api/shipping');
  }, []);

  // Handle countries response
  useEffect(() => {
    if (countryFetcher.data) {
      const data = countryFetcher.data as {countries?: Array<{isoCode: string; name: string}>};
      if (data.countries && data.countries.length > 0) {
        const sortedCountries = [...data.countries].sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      }
      setCountriesLoading(false);
    }
  }, [countryFetcher.data]);

  const provinceOptions = PROVINCE_DATA[country] || [];
  const showProvinceField = provinceOptions.length > 0;

  // Reset province when country changes
  useEffect(() => {
    setProvince('');
    setShippingRates([]);
    setError(null);
    setHasCalculated(false);
  }, [country]);

  // Handle shipping calculation response
  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as {
        success?: boolean;
        deliveryOptions?: Array<{handle: string; title: string; estimatedCost: {amount: string; currencyCode: string}}>;
        error?: string;
      };
      if (data.success && data.deliveryOptions) {
        setShippingRates(data.deliveryOptions);
        setError(null);
        setHasCalculated(true);
      } else if (data.error) {
        setError(data.error);
        setShippingRates([]);
        setHasCalculated(true);
      }
    }
  }, [fetcher.data]);

  const handleCalculate = () => {
    if (!country) {
      setError('Please select a country');
      return;
    }
    if (showProvinceField && !province) {
      setError('Please select a state/province');
      return;
    }
    if (!zipCode.trim()) {
      setError('Please enter a postal/ZIP code');
      return;
    }
    setError(null);
    fetcher.submit(
      {intent: 'calculateShipping', countryCode: country, provinceCode: province, zip: zipCode.trim()},
      {method: 'POST', action: '/api/shipping'}
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="block text-[1.6rem] font-semibold text-[rgba(var(--color-foreground),.75)]">Estimate shipping rates</span>
        <button
          type="button"
          className="w-6 h-6 border border-[rgba(var(--color-foreground),0.9)] rounded-full text-[1rem] flex items-center justify-center bg-transparent text-[rgba(var(--color-foreground),0.5)] cursor-help"
          title="Enter your address to see available shipping options and costs"
        >
          ?
        </button>
      </div>

      {/* Country Select */}
      <div className="mb-8">
        <div className="relative">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={isLoading || countriesLoading}
            className="w-full py-4 px-4 pr-12 border border-[rgba(var(--color-foreground),0.1)] text-[1.4rem] bg-[rgb(var(--color-background))] text-[rgb(var(--color-foreground))] appearance-none cursor-pointer focus:outline-none focus:border-[rgb(var(--color-foreground))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-[5rem]"
          >
            <option value="">---</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
          </select>
          <ChevronDownIcon />
        </div>
      </div>

      {/* Province/State Select */}
      {showProvinceField && (
        <div className="mb-4">
          <div className="relative">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              disabled={isLoading}
              className="w-full py-4 px-4 pr-12 border border-[rgba(var(--color-foreground),0.1)] text-[1.4rem] bg-[rgb(var(--color-background))] text-[rgb(var(--color-foreground))] appearance-none cursor-pointer focus:outline-none focus:border-[rgb(var(--color-foreground))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {provinceOptions.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            <ChevronDownIcon />
          </div>
        </div>
      )}

      {/* ZIP Code Input */}
      <div className="mb-8 relative">
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Postal/ZIP code"
          disabled={isLoading}
          className="w-full py-4 px-4 pr-14 border border-[rgba(var(--color-foreground),0.1)] text-[1.4rem] bg-[rgb(var(--color-background))] text-[rgb(var(--color-foreground))] focus:outline-none focus:border-[rgb(var(--color-foreground))] transition-colors placeholder:text-[rgba(var(--color-foreground),0.4)] rounded-[5rem]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCalculate();
            }
          }}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#e53935] border-none rounded cursor-pointer"
          title="Enter your postal or ZIP code"
        >
          <MoreIcon />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.3)] rounded">
          <p className="text-[1.2rem] text-[#dc3545] m-0">{error}</p>
        </div>
      )}

      {/* Shipping Rates Results */}
      {hasCalculated && shippingRates.length > 0 && (
        <div className="mb-4 border border-[rgba(var(--color-foreground),0.1)] rounded overflow-hidden">
          {shippingRates.map((rate) => (
            <div key={rate.handle} className="flex justify-between items-center py-3 px-4 text-[1.3rem] border-b border-[rgba(var(--color-foreground),0.05)] last:border-b-0">
              <span>{rate.title}</span>
              <span>
                {parseFloat(rate.estimatedCost.amount) === 0 ? 'Free' : (
                  <Money data={rate.estimatedCost as {amount: string; currencyCode: 'USD'}} />
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No rates message */}
      {hasCalculated && shippingRates.length === 0 && !error && (
        <div className="mb-4 p-3 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] rounded">
          <p className="text-[1.2rem] text-[#856404] m-0">No shipping options available for this address.</p>
        </div>
      )}

      {/* Calculate Button */}
      <button
        type="button"
        onClick={handleCalculate}
        disabled={isLoading}
        className="w-full py-5 bg-[rgb(var(--color-button))] text-[rgb(var(--color-button-text))] border-none rounded-[var(--button-border-radius)] text-[1.5rem] font-semibold cursor-pointer hover:bg-[rgb(var(--primary-button-hover-background))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Calculating...' : 'Calculate'}
      </button>
    </div>
  );
}

// Icons for shipping calculator
function ChevronDownIcon() {
  return (
    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[rgba(var(--color-foreground),0.6)]" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg className="text-white w-[14px] h-[14px]" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}

function CartSummaryAside({cart}: {cart: OptimisticCart<CartApiQueryFragment | null>}) {
  const {close} = useAside();
  const [activeModal, setActiveModal] = useState<'note' | 'shipping' | null>(null);
  const [discountExpanded, setDiscountExpanded] = useState(true);
  const [noteText, setNoteText] = useState(cart?.note || '');

  // Update noteText when cart note changes
  useEffect(() => {
    if (cart?.note !== undefined) {
      setNoteText(cart.note || '');
    }
  }, [cart?.note]);

  // Get all discount codes including invalid ones
  const allDiscountCodes = cart?.discountCodes || [];
  const invalidCodes = allDiscountCodes.filter((discount) => !discount.applicable);
  const hasInvalidCode = invalidCodes.length > 0;

  // Valid codes (applicable: true)
  const codes: string[] = allDiscountCodes
    .filter((discount) => discount.applicable)
    .map(({code}) => code);

  // Calculate total discount amount from discountAllocations
  const discountAmount = cart?.discountAllocations?.reduce((total, allocation) => {
    return total + parseFloat(allocation.discountedAmount?.amount || '0');
  }, 0) || 0;

  const discountCurrency = cart?.discountAllocations?.[0]?.discountedAmount?.currencyCode || cart?.cost?.subtotalAmount?.currencyCode || 'USD';

  // Calculate discounted subtotal (original subtotal minus discount)
  const originalSubtotal = parseFloat(cart?.cost?.subtotalAmount?.amount || '0');
  const discountedSubtotal = originalSubtotal - discountAmount;
  const subtotalCurrency = cart?.cost?.subtotalAmount?.currencyCode || 'USD';

  return (
    <div className="shadow-[0_0_10px_rgba(var(--color-shadow),0.2)]">
      {/* Note & Shipping Tabs */}
      <div className="flex justify-between mx-8 py-12 border-b border-[rgba(var(--color-foreground),0.05)]">
        <button
          type="button"
          onClick={() => setActiveModal(activeModal === 'note' ? null : 'note')}
          className={`flex-1 flex items-center gap-2 text-2xl font-bold transition-colors ${
            activeModal === 'note' ? 'text-[#e53935]' : 'text-[rgba(var(--color-foreground))] hover:text-[rgb(var(--color-foreground))]'
          }`}
        >
          <NoteIcon />
          <span>Note</span>
        </button>
        <div className="w-px bg-[rgba(var(--color-foreground),0.5)]" />
        <button
          type="button"
          onClick={() => setActiveModal(activeModal === 'shipping' ? null : 'shipping')}
          className={`flex-1 justify-end flex items-center gap-2 text-2xl font-bold transition-colors ${
            activeModal === 'shipping' ? 'text-[#e53935]' : 'text-[rgba(var(--color-foreground))] hover:text-[rgb(var(--color-foreground))]'
          }`}
        >
          <ShippingIcon />
          <span>Shipping</span>
        </button>
      </div>

      {/* Discount Section */}
      <div className="mx-8 py-8 border-b border-[rgba(var(--color-foreground),0.05)]">
        <button
          type="button"
          onClick={() => setDiscountExpanded(!discountExpanded)}
          className="flex items-center justify-between w-full text-2xl font-bold text-[rgba(var(--color-foreground))]"
        >
          <span>Discount</span>
          <span className="text-[1.6rem]">{discountExpanded ? '−' : '+'}</span>
        </button>

        {/* Discount input */}
        {discountExpanded && (
          <UpdateDiscountForm discountCodes={codes}>
            {(fetcher) => {
              const isLoading = fetcher.state !== 'idle';
              const errors = fetcher.data?.errors;
              const hasApiError = errors && errors.length > 0;

              return (
                <div className="mt-3">
                  <div className="flex gap-6">
                    <input
                      type="text"
                      name="discountCode"
                      placeholder="Enter discount code"
                      disabled={isLoading}
                      className="flex-1 px-6 py-4 border border-[rgba(var(--color-foreground),0.1)] rounded-full text-[1.4rem] outline-none focus:border-[rgb(var(--color-foreground))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 bg-[rgb(var(--color-button))] text-[rgb(var(--color-button-text))] rounded-full text-2xl font-semibold hover:bg-[rgb(var(--primary-button-hover-background))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {hasApiError && (
                    <div className="
                      bg-[#dc35451a]
                      border border-[rgba(220,53,69,.3)]
                      rounded
                      px-4 py-3
                      mt-6">
                      <span className='text-[1.2rem] font-medium leading-[1.4]
                      text-[#dc3545]'>{errors[0]?.message || 'Invalid discount code'}</span>
                    </div>
                  )}
                </div>
              );
            }}
          </UpdateDiscountForm>
        )}

        {/* Show error for invalid discount codes */}
        {hasInvalidCode && discountExpanded && (
          <div className="
            bg-[#dc35451a]
            border border-[rgba(220,53,69,.3)]
            rounded
            px-4 py-3
            mt-6">
            <span className='text-[1.2rem] font-medium leading-[1.4]
            text-[#dc3545]'>Invalid discount code: {invalidCodes.map((c) => c.code).join(', ')}</span>
          </div>
        )}

        {/* Applied discount codes */}
        {codes.length > 0 && discountExpanded && (
          <div className="mt-4">
            <p className="text-[1.2rem] text-[rgba(var(--color-foreground),0.6)] mb-2">Applied Discounts</p>
            <UpdateDiscountForm>
              {(fetcher) => {
                const isRemoving = fetcher.state !== 'idle';
                return (
                  <div className="flex items-center justify-between bg-[rgba(var(--color-foreground),0.03)] p-4 rounded-lg">
                    <div>
                      <p className="text-[1.6rem] font-semibold text-[rgb(var(--color-foreground))]">{codes.join(', ')}</p>
                      {discountAmount > 0 && (
                        <p className="flex text-[1.2rem] text-[rgba(var(--color-foreground),0.6)] whitespace-nowrap">
                          (-<Money data={{amount: String(discountAmount), currencyCode: discountCurrency}} />)
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isRemoving}
                      className="text-[1.2rem] text-[rgba(var(--color-foreground),0.5)] hover:text-[rgb(var(--color-foreground))] border border-[rgba(var(--color-foreground),0.2)] px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRemoving ? 'Removing...' : 'Remove ×'}
                    </button>
                  </div>
                );
              }}
            </UpdateDiscountForm>
          </div>
        )}
        
      </div>

      {/* Subtotal */}
      <div className="mx-8 py-10">
        <div className="flex justify-between items-baseline">
          <span className="text-[1.6rem] font-bold text-[rgb(var(--color-foreground))]">Subtotal</span>
          <span className="text-[2.4rem] font-bold text-[rgb(var(--color-foreground))]">
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={{amount: String(discountedSubtotal), currencyCode: subtotalCurrency}} />
            ) : (
              '-'
            )}
          </span>
        </div>

        {/* Discount line - show when discount is applied */}
        {codes.length > 0 && discountAmount > 0 && (
          <div className="flex justify-between items-center mt-3">
            <span className="flex items-center gap-2 text-[1.4rem] text-[rgb(var(--color-foreground))]">
              <TagIcon />
              {codes.join(', ')}
            </span>
            <span className="flex text-[1.4rem] text-[rgba(var(--color-foreground),0.6)] whitespace-nowrap">
              (-<Money data={{amount: String(discountAmount), currencyCode: discountCurrency}} />)
            </span>
          </div>
        )}

        <p className="text-[1.3rem] text-[rgba(var(--color-foreground),0.75)] mt-1">
          Taxes and shipping calculated at checkout
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mx-8 pb-14 flex gap-3">
        <Link
          to="/cart"
          onClick={close}
          className="flex-1 py-5 px-6 text-center
         border border-[rgb(var(--color-foreground))]
         button--secondary rounded-full
         text-[1.4rem] font-semibold
         text-[rgb(var(--color-foreground))]
         transition-colors
         hover:bg-[rgba(var(--secondary-button-hover-background))]
         hover:text-[rgba(var(--secondary-button-hover-text))]
         hover:border-[rgba(var(--secondary-button-hover-background))]"
        >
          View cart
        </Link>
        {cart?.checkoutUrl && (
          <a
            href={cart.checkoutUrl}
            target="_self"
            className="flex-1 py-5 px-6 text-center bg-[rgb(var(--color-button))] text-[rgb(var(--color-button-text))] rounded-full text-[1.4rem] font-semibold hover:bg-[rgb(var(--primary-button-hover-background))] transition-colors"
          >
            Check out
          </a>
        )}
      </div>

      {/* Note Modal */}
      <CartNoteModal
        isOpen={activeModal === 'note'}
        onClose={() => setActiveModal(null)}
        noteText={noteText}
        setNoteText={setNoteText}
        cartId={cart?.id}
      />

      {/* Shipping Modal */}
      <ShippingModal
        isOpen={activeModal === 'shipping'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

// Note Modal Component
function CartNoteModal({
  isOpen,
  onClose,
  noteText,
  setNoteText,
  cartId,
}: {
  isOpen: boolean;
  onClose: () => void;
  noteText: string;
  setNoteText: (text: string) => void;
  cartId?: string;
}) {
  const fetcher = useFetcher();

  const handleSave = () => {
    if (cartId) {
      fetcher.submit(
        {cartNote: noteText},
        {method: 'POST', action: '/cart'}
      );
    }
    onClose();
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-[rgb(var(--color-background))] rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{zIndex: 100}}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <NoteIcon />
          <span className="text-[1.5rem] font-medium text-[rgb(var(--color-foreground))]">Add note for seller</span>
        </div>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Order special instructions"
          className="w-full h-32 p-4 border border-[rgba(var(--color-foreground),0.1)] rounded-lg text-[1.4rem] outline-none focus:border-[rgb(var(--color-foreground))] resize-none transition-colors"
        />
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 text-center border border-[rgb(var(--color-foreground))] rounded-full text-[1.4rem] font-medium text-[rgb(var(--color-foreground))] hover:bg-[rgba(var(--color-foreground),0.04)] transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-center bg-[rgb(var(--color-button))] text-[rgb(var(--color-button-text))] rounded-full text-[1.4rem] font-medium hover:bg-[rgb(var(--primary-button-hover-background))] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Shipping Modal Component
function ShippingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-[rgb(var(--color-background))] rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{zIndex: 100}}
    >
      <div className="p-5">
        <ShippingCalculator onClose={onClose} />
      </div>
    </div>
  );
}

// Icons
function NoteIcon() {
  return (
    <svg
      className="w-6 h-6"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function ShippingIcon() {
  return (
    <svg
      className="w-6 h-6"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      className="w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}


// Original components for page layout
function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <div>
      <a href={checkoutUrl} target="_self">
        <p>Continue to Checkout &rarr;</p>
      </a>
      <br />
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode | ((fetcher: FetcherWithComponents<any>) => React.ReactNode);
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) =>
        typeof children === 'function' ? children(fetcher) : children
      }
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  // Clear the gift card code input after the gift card is added
  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current!.value = '';
    }
  }, [giftCardAddFetcher.data]);

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
  }

  return (
    <div>
      {/* Display applied gift cards with individual remove buttons */}
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt>Applied Gift Card(s)</dt>
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="cart-discount">
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
                &nbsp;
                <button type="submit">Remove</button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </dl>
      )}

      {/* Show an input to apply a gift card */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
        fetcherKey="gift-card-add"
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit" disabled={giftCardAddFetcher.state !== 'idle'}>
            Apply
          </button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  fetcherKey,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
    </CartForm>
  );
}
