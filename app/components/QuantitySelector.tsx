import type {CSSProperties} from 'react';

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
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * A quantity selector with +/- buttons and input field.
 * Pill-shaped design matching the reference.
 */
export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  showLabel = true,
  label = 'Quantity',
  className = '',
  style = {},
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

  const buttonStyle: CSSProperties = {
    width: '40px',
    height: '40px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
  };

  const disabledButtonStyle: CSSProperties = {
    ...buttonStyle,
    color: '#ccc',
    cursor: 'pointer',
  };

  return (
    <div className={`quantity-selector ${className}`.trim()} style={style}>
      {showLabel && (
        <label
          style={{
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '8px',
            display: 'block',
            color: '#1a1a1a',
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid #e5e5e5',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <button
          type="button"
          onClick={decrease}
          disabled={quantity <= min}
          style={quantity <= min ? disabledButtonStyle : buttonStyle}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="text"
          value={quantity}
          onChange={handleInputChange}
          style={{
            width: '40px',
            textAlign: 'center',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            outline: 'none',
            backgroundColor: 'transparent',
          }}
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={increase}
          disabled={quantity >= max}
          style={quantity >= max ? disabledButtonStyle : buttonStyle}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}
