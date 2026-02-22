const CONFIG = {
  EXCHANGE_RATE_API_KEY: import.meta.env.VITE_EXCHANGE_RATE_API_KEY || '',
  EXCHANGE_RATE_BASE_URL: 'https://api.exchangerate-api.com/v4/latest',
  
  USE_MOCK: true,
  MOCK_DELAY: 200,
};

export interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  symbol?: string;
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CNY: 'Chinese Yuan',
  MXN: 'Mexican Peso',
  BRL: 'Brazilian Real',
  INR: 'Indian Rupee',
  KRW: 'South Korean Won',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  NOK: 'Norwegian Krone',
  SEK: 'Swedish Krona',
  DKK: 'Danish Krone',
  NZD: 'New Zealand Dollar',
  ZAR: 'South African Rand',
  RUB: 'Russian Ruble',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CHF: 'CHF',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  MXN: '$',
  BRL: 'R$',
  INR: '₹',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  NZD: 'NZ$',
  ZAR: 'R',
  RUB: '₽',
};

const MOCK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CHF: 0.88,
  CAD: 1.36,
  AUD: 1.53,
  CNY: 7.24,
  MXN: 17.15,
  BRL: 4.97,
  INR: 83.12,
  KRW: 1320.50,
  SGD: 1.34,
  HKD: 7.82,
  NOK: 10.65,
  SEK: 10.42,
  DKK: 6.87,
  NZD: 1.64,
  ZAR: 18.75,
  RUB: 91.50,
};

function getCurrencyName(code: string): string {
  return CURRENCY_NAMES[code] || code;
}

function getCurrencySymbol(code: string): string | undefined {
  return CURRENCY_SYMBOLS[code];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchExchangeRatesFromAPI(base: string = 'USD'): Promise<ExchangeRates> {
  const url = `${CONFIG.EXCHANGE_RATE_BASE_URL}/${base}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching exchange rates: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    base: data.base,
    date: data.date || new Date().toISOString().split('T')[0],
    rates: data.rates,
  };
}

function getMockRates(base: string = 'USD'): ExchangeRates {
  const baseRate = MOCK_RATES[base] || 1;
  const rates: Record<string, number> = {};
  
  for (const [currency, rate] of Object.entries(MOCK_RATES)) {
    rates[currency] = rate / baseRate;
  }
  
  return {
    base,
    date: new Date().toISOString().split('T')[0],
    rates,
  };
}

export async function getExchangeRates(base: string = 'USD'): Promise<ExchangeRates> {
  if (CONFIG.USE_MOCK) {
    await delay(CONFIG.MOCK_DELAY);
    return getMockRates(base);
  }
  
  return fetchExchangeRatesFromAPI(base);
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  const rates = await getExchangeRates(from);
  const rate = rates.rates[to];
  
  if (!rate) {
    throw new Error(`Exchange rate not found for ${to}`);
  }
  
  return amount * rate;
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  const rates = await getExchangeRates(from);
  const rate = rates.rates[to];
  
  if (!rate) {
    throw new Error(`Exchange rate not found for ${to}`);
  }
  
  return rate;
}

export async function getAvailableCurrencies(): Promise<ExchangeRate[]> {
  const rates = await getExchangeRates();
  
  return Object.entries(rates.rates).map(([code, rate]) => ({
    code,
    name: getCurrencyName(code),
    rate,
    symbol: getCurrencySymbol(code),
  }));
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode) || currencyCode;
  const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol}${formatted}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}
