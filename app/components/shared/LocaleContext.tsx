import {createContext, useContext, type ReactNode} from 'react';

export interface Country {
  isoCode: string;
  name: string;
  currency: {
    isoCode: string;
    symbol?: string;
  };
}

export interface Language {
  code?: string;
  isoCode?: string;
  name: string;
}

export interface LocaleContextValue {
  countries: Country[];
  languages: Language[];
  currentCountry: string;
  currentLanguage: string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const DEFAULT_LANGUAGES: Language[] = [
  {code: 'EN', name: 'English'},
  {code: 'FR', name: 'French'},
  {code: 'ES', name: 'Spanish'},
  {code: 'DE', name: 'German'},
];

interface LocaleProviderProps {
  children: ReactNode;
  countries?: Country[];
  languages?: Language[];
  currentCountry?: string;
  currentLanguage?: string;
}

export function LocaleProvider({
  children,
  countries = [],
  languages,
  currentCountry = 'US',
  currentLanguage = 'EN',
}: LocaleProviderProps) {
  const value: LocaleContextValue = {
    countries,
    languages: languages && languages.length > 0 ? languages : DEFAULT_LANGUAGES,
    currentCountry,
    currentLanguage,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    return {
      countries: [],
      languages: DEFAULT_LANGUAGES,
      currentCountry: 'US',
      currentLanguage: 'EN',
    };
  }
  return context;
}
