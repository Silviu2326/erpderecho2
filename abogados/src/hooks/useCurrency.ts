import { useLocalStorage } from './useLocalStorage';

export type Currency = 'EUR' | 'USD' | 'GBP';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'es-ES' },
  USD: { code: 'USD', symbol: '$', name: 'Dólar estadounidense', locale: 'en-US' },
  GBP: { code: 'GBP', symbol: '£', name: 'Libra esterlina', locale: 'en-GB' },
};

export const DEFAULT_CURRENCY: Currency = 'EUR';

export function useCurrency() {
  const [currency, setCurrency, removeCurrency] = useLocalStorage<Currency>(
    'app-currency',
    DEFAULT_CURRENCY
  );

  const format = (amount: number, customCurrency?: Currency): string => {
    const curr = customCurrency || currency;
    const config = CURRENCIES[curr];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  const formatCompact = (amount: number, customCurrency?: Currency): string => {
    const curr = customCurrency || currency;
    const config = CURRENCIES[curr];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: curr,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const getCurrencyConfig = (customCurrency?: Currency): CurrencyConfig => {
    return CURRENCIES[customCurrency || currency];
  };

  const changeCurrency = (newCurrency: Currency) => {
    if (CURRENCIES[newCurrency]) {
      setCurrency(newCurrency);
    }
  };

  const resetCurrency = () => {
    removeCurrency();
  };

  return {
    currency,
    currencyConfig: CURRENCIES[currency],
    currencies: CURRENCIES,
    format,
    formatCompact,
    getCurrencyConfig,
    changeCurrency,
    resetCurrency,
    isDefault: currency === DEFAULT_CURRENCY,
  };
}

export default useCurrency;
