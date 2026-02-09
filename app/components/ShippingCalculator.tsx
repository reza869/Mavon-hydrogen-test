import {useState, useEffect} from 'react';
import {useFetcher} from 'react-router';
import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

// Country type from Shopify localization API
interface Country {
  isoCode: string;
  name: string;
}

// Fallback country list (used if API fails)
const FALLBACK_COUNTRIES: Country[] = [
  {isoCode: 'US', name: 'United States'},
  {isoCode: 'CA', name: 'Canada'},
  {isoCode: 'GB', name: 'United Kingdom'},
  {isoCode: 'AU', name: 'Australia'},
  {isoCode: 'DE', name: 'Germany'},
  {isoCode: 'FR', name: 'France'},
  {isoCode: 'JP', name: 'Japan'},
  {isoCode: 'IN', name: 'India'},
  {isoCode: 'BR', name: 'Brazil'},
  {isoCode: 'MX', name: 'Mexico'},
];

// Static province/state lists for countries that require them
const PROVINCE_DATA: Record<string, Array<{code: string; name: string}>> = {
  US: [
    {code: '', name: '---'},
    {code: 'AL', name: 'Alabama'},
    {code: 'AK', name: 'Alaska'},
    {code: 'AZ', name: 'Arizona'},
    {code: 'AR', name: 'Arkansas'},
    {code: 'CA', name: 'California'},
    {code: 'CO', name: 'Colorado'},
    {code: 'CT', name: 'Connecticut'},
    {code: 'DE', name: 'Delaware'},
    {code: 'FL', name: 'Florida'},
    {code: 'GA', name: 'Georgia'},
    {code: 'HI', name: 'Hawaii'},
    {code: 'ID', name: 'Idaho'},
    {code: 'IL', name: 'Illinois'},
    {code: 'IN', name: 'Indiana'},
    {code: 'IA', name: 'Iowa'},
    {code: 'KS', name: 'Kansas'},
    {code: 'KY', name: 'Kentucky'},
    {code: 'LA', name: 'Louisiana'},
    {code: 'ME', name: 'Maine'},
    {code: 'MD', name: 'Maryland'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'MI', name: 'Michigan'},
    {code: 'MN', name: 'Minnesota'},
    {code: 'MS', name: 'Mississippi'},
    {code: 'MO', name: 'Missouri'},
    {code: 'MT', name: 'Montana'},
    {code: 'NE', name: 'Nebraska'},
    {code: 'NV', name: 'Nevada'},
    {code: 'NH', name: 'New Hampshire'},
    {code: 'NJ', name: 'New Jersey'},
    {code: 'NM', name: 'New Mexico'},
    {code: 'NY', name: 'New York'},
    {code: 'NC', name: 'North Carolina'},
    {code: 'ND', name: 'North Dakota'},
    {code: 'OH', name: 'Ohio'},
    {code: 'OK', name: 'Oklahoma'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'RI', name: 'Rhode Island'},
    {code: 'SC', name: 'South Carolina'},
    {code: 'SD', name: 'South Dakota'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'TX', name: 'Texas'},
    {code: 'UT', name: 'Utah'},
    {code: 'VT', name: 'Vermont'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WA', name: 'Washington'},
    {code: 'WV', name: 'West Virginia'},
    {code: 'WI', name: 'Wisconsin'},
    {code: 'WY', name: 'Wyoming'},
    {code: 'DC', name: 'District of Columbia'},
    {code: 'PR', name: 'Puerto Rico'},
    {code: 'VI', name: 'U.S. Virgin Islands'},
    {code: 'GU', name: 'Guam'},
  ],
  CA: [
    {code: '', name: '---'},
    {code: 'AB', name: 'Alberta'},
    {code: 'BC', name: 'British Columbia'},
    {code: 'MB', name: 'Manitoba'},
    {code: 'NB', name: 'New Brunswick'},
    {code: 'NL', name: 'Newfoundland and Labrador'},
    {code: 'NS', name: 'Nova Scotia'},
    {code: 'NT', name: 'Northwest Territories'},
    {code: 'NU', name: 'Nunavut'},
    {code: 'ON', name: 'Ontario'},
    {code: 'PE', name: 'Prince Edward Island'},
    {code: 'QC', name: 'Quebec'},
    {code: 'SK', name: 'Saskatchewan'},
    {code: 'YT', name: 'Yukon'},
  ],
  AU: [
    {code: '', name: '---'},
    {code: 'ACT', name: 'Australian Capital Territory'},
    {code: 'NSW', name: 'New South Wales'},
    {code: 'NT', name: 'Northern Territory'},
    {code: 'QLD', name: 'Queensland'},
    {code: 'SA', name: 'South Australia'},
    {code: 'TAS', name: 'Tasmania'},
    {code: 'VIC', name: 'Victoria'},
    {code: 'WA', name: 'Western Australia'},
  ],
  IN: [
    {code: '', name: '---'},
    {code: 'AN', name: 'Andaman and Nicobar Islands'},
    {code: 'AP', name: 'Andhra Pradesh'},
    {code: 'AR', name: 'Arunachal Pradesh'},
    {code: 'AS', name: 'Assam'},
    {code: 'BR', name: 'Bihar'},
    {code: 'CH', name: 'Chandigarh'},
    {code: 'CT', name: 'Chhattisgarh'},
    {code: 'DL', name: 'Delhi'},
    {code: 'GA', name: 'Goa'},
    {code: 'GJ', name: 'Gujarat'},
    {code: 'HR', name: 'Haryana'},
    {code: 'HP', name: 'Himachal Pradesh'},
    {code: 'JK', name: 'Jammu and Kashmir'},
    {code: 'JH', name: 'Jharkhand'},
    {code: 'KA', name: 'Karnataka'},
    {code: 'KL', name: 'Kerala'},
    {code: 'LA', name: 'Ladakh'},
    {code: 'MP', name: 'Madhya Pradesh'},
    {code: 'MH', name: 'Maharashtra'},
    {code: 'MN', name: 'Manipur'},
    {code: 'ML', name: 'Meghalaya'},
    {code: 'MZ', name: 'Mizoram'},
    {code: 'NL', name: 'Nagaland'},
    {code: 'OR', name: 'Odisha'},
    {code: 'PY', name: 'Puducherry'},
    {code: 'PB', name: 'Punjab'},
    {code: 'RJ', name: 'Rajasthan'},
    {code: 'SK', name: 'Sikkim'},
    {code: 'TN', name: 'Tamil Nadu'},
    {code: 'TG', name: 'Telangana'},
    {code: 'TR', name: 'Tripura'},
    {code: 'UP', name: 'Uttar Pradesh'},
    {code: 'UT', name: 'Uttarakhand'},
    {code: 'WB', name: 'West Bengal'},
  ],
  JP: [
    {code: '', name: '---'},
    {code: 'JP-01', name: 'Hokkaido'},
    {code: 'JP-13', name: 'Tokyo'},
    {code: 'JP-27', name: 'Osaka'},
    {code: 'JP-14', name: 'Kanagawa'},
    {code: 'JP-23', name: 'Aichi'},
    {code: 'JP-11', name: 'Saitama'},
    {code: 'JP-12', name: 'Chiba'},
    {code: 'JP-28', name: 'Hyogo'},
    {code: 'JP-40', name: 'Fukuoka'},
    {code: 'JP-22', name: 'Shizuoka'},
  ],
  BR: [
    {code: '', name: '---'},
    {code: 'AC', name: 'Acre'},
    {code: 'AL', name: 'Alagoas'},
    {code: 'AP', name: 'Amapa'},
    {code: 'AM', name: 'Amazonas'},
    {code: 'BA', name: 'Bahia'},
    {code: 'CE', name: 'Ceara'},
    {code: 'DF', name: 'Distrito Federal'},
    {code: 'ES', name: 'Espirito Santo'},
    {code: 'GO', name: 'Goias'},
    {code: 'MA', name: 'Maranhao'},
    {code: 'MT', name: 'Mato Grosso'},
    {code: 'MS', name: 'Mato Grosso do Sul'},
    {code: 'MG', name: 'Minas Gerais'},
    {code: 'PA', name: 'Para'},
    {code: 'PB', name: 'Paraiba'},
    {code: 'PR', name: 'Parana'},
    {code: 'PE', name: 'Pernambuco'},
    {code: 'PI', name: 'Piaui'},
    {code: 'RJ', name: 'Rio de Janeiro'},
    {code: 'RN', name: 'Rio Grande do Norte'},
    {code: 'RS', name: 'Rio Grande do Sul'},
    {code: 'RO', name: 'Rondonia'},
    {code: 'RR', name: 'Roraima'},
    {code: 'SC', name: 'Santa Catarina'},
    {code: 'SP', name: 'Sao Paulo'},
    {code: 'SE', name: 'Sergipe'},
    {code: 'TO', name: 'Tocantins'},
  ],
  MX: [
    {code: '', name: '---'},
    {code: 'AGU', name: 'Aguascalientes'},
    {code: 'BCN', name: 'Baja California'},
    {code: 'BCS', name: 'Baja California Sur'},
    {code: 'CAM', name: 'Campeche'},
    {code: 'CHP', name: 'Chiapas'},
    {code: 'CHH', name: 'Chihuahua'},
    {code: 'COA', name: 'Coahuila'},
    {code: 'COL', name: 'Colima'},
    {code: 'CMX', name: 'Ciudad de Mexico'},
    {code: 'DUR', name: 'Durango'},
    {code: 'GUA', name: 'Guanajuato'},
    {code: 'GRO', name: 'Guerrero'},
    {code: 'HID', name: 'Hidalgo'},
    {code: 'JAL', name: 'Jalisco'},
    {code: 'MEX', name: 'Mexico'},
    {code: 'MIC', name: 'Michoacan'},
    {code: 'MOR', name: 'Morelos'},
    {code: 'NAY', name: 'Nayarit'},
    {code: 'NLE', name: 'Nuevo Leon'},
    {code: 'OAX', name: 'Oaxaca'},
    {code: 'PUE', name: 'Puebla'},
    {code: 'QUE', name: 'Queretaro'},
    {code: 'ROO', name: 'Quintana Roo'},
    {code: 'SLP', name: 'San Luis Potosi'},
    {code: 'SIN', name: 'Sinaloa'},
    {code: 'SON', name: 'Sonora'},
    {code: 'TAB', name: 'Tabasco'},
    {code: 'TAM', name: 'Tamaulipas'},
    {code: 'TLA', name: 'Tlaxcala'},
    {code: 'VER', name: 'Veracruz'},
    {code: 'YUC', name: 'Yucatan'},
    {code: 'ZAC', name: 'Zacatecas'},
  ],
};

export interface DeliveryOption {
  handle: string;
  title: string;
  estimatedCost: MoneyV2;
  description?: string;
}

export interface ShippingCalculatorProps {
  onClose?: () => void;
  onRatesCalculated?: (rates: DeliveryOption[]) => void;
}

export function ShippingCalculator({onClose, onRatesCalculated}: ShippingCalculatorProps) {
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [shippingRates, setShippingRates] = useState<DeliveryOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const fetcher = useFetcher();
  const countryFetcher = useFetcher();
  const isLoading = fetcher.state !== 'idle';

  // Fetch countries from API on mount
  useEffect(() => {
    countryFetcher.load('/api/shipping');
  }, []);

  // Handle countries response
  useEffect(() => {
    if (countryFetcher.data) {
      const data = countryFetcher.data as {countries?: Country[]};
      if (data.countries && data.countries.length > 0) {
        // Sort countries alphabetically by name
        const sortedCountries = [...data.countries].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setCountries(sortedCountries);
      } else {
        // Use fallback if API returns empty
        setCountries(FALLBACK_COUNTRIES);
      }
      setCountriesLoading(false);
    }
  }, [countryFetcher.data]);

  // If countries fetch failed, use fallback
  useEffect(() => {
    if (countryFetcher.state === 'idle' && countries.length === 0 && !countriesLoading) {
      setCountries(FALLBACK_COUNTRIES);
    }
  }, [countryFetcher.state, countries.length, countriesLoading]);

  // Get province/state options based on selected country (from static data)
  const getProvinceOptions = () => {
    return PROVINCE_DATA[country] || [];
  };

  const provinceOptions = getProvinceOptions();
  const showProvinceField = provinceOptions.length > 0;

  // Reset province when country changes
  useEffect(() => {
    setProvince('');
    setShippingRates([]);
    setError(null);
    setHasCalculated(false);
  }, [country]);

  // Handle the response from the shipping calculation
  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as {
        success?: boolean;
        deliveryOptions?: DeliveryOption[];
        error?: string;
      };

      if (data.success && data.deliveryOptions) {
        setShippingRates(data.deliveryOptions);
        setError(null);
        setHasCalculated(true);
        onRatesCalculated?.(data.deliveryOptions);
      } else if (data.error) {
        setError(data.error);
        setShippingRates([]);
        setHasCalculated(true);
      }
    }
  }, [fetcher.data, onRatesCalculated]);

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

    // Submit to our API route - send country code and province code
    fetcher.submit(
      {
        intent: 'calculateShipping',
        countryCode: country,     // ISO code like "US"
        provinceCode: province,   // Code like "NY" or empty
        zip: zipCode.trim(),
      },
      {method: 'POST', action: '/api/shipping'}
    );
  };

  return (
    <div className="shipping-calculator">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[1.5rem] font-medium text-[rgb(var(--color-foreground))]">Estimate shipping rates</span>
        <button
          type="button"
          className="ml-1 w-5 h-5 rounded-full border border-[rgba(var(--color-foreground),0.55)] text-[rgba(var(--color-foreground),0.55)] text-[1.1rem] flex items-center justify-center"
          title="Enter your address to see available shipping options and costs"
        >
          ?
        </button>
      </div>

      {/* Country Select */}
      <div className="relative mb-3">
        <label htmlFor="shipping-country" className="sr-only">Country</label>
        <select
          id="shipping-country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-3 border border-[rgba(var(--color-foreground),0.1)] rounded-lg text-[1.4rem] outline-none focus:border-[rgb(var(--color-foreground))] appearance-none bg-[rgb(var(--color-background))] transition-colors"
          disabled={isLoading || countriesLoading}
        >
          <option value="">
            {countriesLoading ? 'Loading countries...' : '--- Select Country ---'}
          </option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" className="text-[rgba(var(--color-foreground),0.75)]" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Province/State Select - only show for countries with provinces */}
      {showProvinceField && (
        <div className="relative mb-3">
          <label htmlFor="shipping-province" className="sr-only">
            {country === 'US' ? 'State' : country === 'JP' ? 'Prefecture' : 'Province/State'}
          </label>
          <select
            id="shipping-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-4 py-3 border border-[rgba(var(--color-foreground),0.1)] rounded-lg text-[1.4rem] outline-none focus:border-[rgb(var(--color-foreground))] appearance-none bg-[rgb(var(--color-background))] transition-colors"
            disabled={isLoading}
          >
            {provinceOptions.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" className="text-[rgba(var(--color-foreground),0.75)]" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}

      {/* ZIP Code Input */}
      <div className="relative mb-4">
        <label htmlFor="shipping-zip" className="sr-only">Postal/ZIP code</label>
        <input
          id="shipping-zip"
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Postal/ZIP code"
          className="w-full px-4 py-3 border border-[rgba(var(--color-foreground),0.1)] rounded-lg text-[1.4rem] outline-none focus:border-[rgb(var(--color-foreground))] transition-colors"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCalculate();
            }
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-[1.3rem] text-red-600">{error}</p>
        </div>
      )}

      {/* Shipping Rates Results */}
      {hasCalculated && shippingRates.length > 0 && (
        <div className="mb-4 border border-[rgba(var(--color-foreground),0.1)] rounded-lg overflow-hidden">
          <div className="bg-[rgba(var(--color-foreground),0.04)] px-4 py-2 border-b border-[rgba(var(--color-foreground),0.1)]">
            <span className="text-[1.3rem] font-medium text-[rgb(var(--color-foreground))]">Available Shipping Methods</span>
          </div>
          <ul className="divide-y divide-[rgba(var(--color-foreground),0.05)]">
            {shippingRates.map((rate) => (
              <li key={rate.handle} className="flex justify-between items-center px-4 py-3">
                <span className="text-[1.4rem] text-[rgb(var(--color-foreground))]">{rate.title}</span>
                <span className="text-[1.4rem] font-medium text-[rgb(var(--color-foreground))]">
                  {parseFloat(rate.estimatedCost.amount) === 0 ? (
                    'Free'
                  ) : (
                    <Money data={rate.estimatedCost} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No rates available message */}
      {hasCalculated && shippingRates.length === 0 && !error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-[1.3rem] text-yellow-700">
            No shipping options available for this address. Please check your address or contact us for assistance.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCalculate}
          disabled={isLoading}
          className="flex-1 py-3 text-center border border-[rgb(var(--color-foreground))] rounded-full text-[1.4rem] font-medium text-[rgb(var(--color-foreground))] hover:bg-[rgba(var(--color-foreground),0.04)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Calculating...
            </span>
          ) : (
            'Calculate'
          )}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-center bg-[rgb(var(--color-button))] text-[rgb(var(--color-button-text))] rounded-full text-[1.4rem] font-medium hover:bg-[rgb(var(--primary-button-hover-background))] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-[1.1rem] text-[rgba(var(--color-foreground),0.55)] text-center">
        Final shipping cost calculated at checkout
      </p>
    </div>
  );
}
