interface QuantitySelectorProps {
  /** Current quantity value */
  quantity: number;
  /** Callback when quantity changes */
  onChange: (quantity: number) => void;
  /** Minimum quantity allowed */
  min?: number;
  /** Maximum quantity allowed */
  max?: number;
  /** Show label above selector */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Custom className for wrapper */
  className?: string;
  /** Custom className for label */
  labelClassName?: string;
  /** Custom className for the selector container */
  containerClassName?: string;
  /** Custom className for decrease button */
  decreaseClassName?: string;
  /** Custom className for increase button */
  increaseClassName?: string;
  /** Custom className for input */
  inputClassName?: string;
  /** Custom className for disabled buttons */
  disabledClassName?: string;
}

/**
 * A quantity selector with +/- buttons and input field.
 * Styles are passed via className props for reusability.
 */
export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  showLabel = true,
  label = 'Quantity',
  className = '',
  labelClassName = '',
  containerClassName = '',
  decreaseClassName = '',
  increaseClassName = '',
  inputClassName = '',
  disabledClassName = '',
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max) {
      onChange(value);
    }
  };

  const isMinDisabled = quantity <= min;
  const isMaxDisabled = quantity >= max;

  return (
    <div className={`quantity-selector ${className}`.trim()}>
      {showLabel && (
        <label className={labelClassName}>
          {label}
        </label>
      )}
      <div className={containerClassName}>
        <button
          type="button"
          onClick={decrease}
          disabled={isMinDisabled}
          className={`${decreaseClassName} ${isMinDisabled ? disabledClassName : ''}`.trim()}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="text"
          value={quantity}
          onChange={handleInputChange}
          className={inputClassName}
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={increase}
          disabled={isMaxDisabled}
          className={`${increaseClassName} ${isMaxDisabled ? disabledClassName : ''}`.trim()}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}
