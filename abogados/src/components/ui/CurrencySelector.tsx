import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useCurrency, Currency, CURRENCIES } from '../../hooks/useCurrency';

interface CurrencySelectorProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CurrencySelector({ showLabel = true, size = 'md', className = '' }: CurrencySelectorProps) {
  const { currency, currencyConfig, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currencyList: Currency[] = ['EUR', 'USD', 'GBP'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizes = {
    sm: { button: 'px-2 py-1.5 text-sm', icon: 'w-3 h-3', option: 'px-3 py-2 text-sm' },
    md: { button: 'px-3 py-2 text-base', icon: 'w-4 h-4', option: 'px-4 py-2.5 text-base' },
    lg: { button: 'px-4 py-3 text-lg', icon: 'w-5 h-5', option: 'px-4 py-3 text-lg' },
  };

  const handleSelect = (newCurrency: Currency) => {
    changeCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-xl border border-theme bg-theme-card
          text-theme-primary hover:border-accent/50 hover:bg-theme-tertiary
          transition-all duration-200
          ${sizes[size].button}
        `}
      >
        <span className="flex items-center gap-1.5">
          <span className="font-semibold">{currencyConfig.symbol}</span>
          {showLabel && (
            <span className="text-theme-secondary font-medium">{currencyConfig.code}</span>
          )}
        </span>
        <ChevronDown
          className={`${sizes[size].icon} text-theme-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="py-1">
              {currencyList.map((curr) => {
                const config = CURRENCIES[curr];
                const isActive = currency === curr;

                return (
                  <button
                    key={curr}
                    onClick={() => handleSelect(curr)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5
                      text-left transition-colors
                      ${isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-theme-primary hover:bg-theme-tertiary'
                      }
                      ${sizes[size].option}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-semibold w-5 text-center">{config.symbol}</span>
                      <span className="font-medium">{config.code}</span>
                    </span>
                    {isActive && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CurrencySelector;
