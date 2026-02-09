import {useState, useRef, useEffect} from 'react';

interface PriceRangeFilterProps {
  maxPrice: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
}

export function PriceRangeFilter({
  maxPrice,
  currentMin,
  currentMax,
  onChange,
}: PriceRangeFilterProps) {
  // Store the ORIGINAL max price - updates when collection changes
  const originalMaxPriceRef = useRef(maxPrice);

  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(
    currentMax > 0 ? currentMax : maxPrice,
  );

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  // Track the last values WE sent to parent, to detect external changes
  const lastCommittedRef = useRef({
    min: currentMin,
    max: currentMax > 0 ? currentMax : maxPrice,
  });

  // Detect collection change: maxPrice changed AND no active filter (at full range)
  useEffect(() => {
    if (
      maxPrice !== originalMaxPriceRef.current &&
      localMax === originalMaxPriceRef.current
    ) {
      // Collection changed - update the ref and reset slider
      originalMaxPriceRef.current = maxPrice;
      setLocalMin(0);
      setLocalMax(maxPrice);
      lastCommittedRef.current = {min: 0, max: maxPrice};
    }
  }, [maxPrice, localMax]);

  const stableMaxPrice = originalMaxPriceRef.current;

  // Sync from props only for external changes (like tag removal)
  useEffect(() => {
    const propsMax = currentMax > 0 ? currentMax : stableMaxPrice;

    // If props changed AND they don't match what we last committed,
    // then this is an external change (like removing the filter tag)
    if (
      currentMin !== lastCommittedRef.current.min ||
      propsMax !== lastCommittedRef.current.max
    ) {
      // Check if this is our own change propagating back
      // If localMin/localMax already match the props, skip
      if (localMin !== currentMin || localMax !== propsMax) {
        setLocalMin(currentMin);
        setLocalMax(propsMax);
      }
      lastCommittedRef.current = {min: currentMin, max: propsMax};
    }
  }, [currentMin, currentMax, stableMaxPrice, localMin, localMax]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), localMax - 1);
    setLocalMin(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Update the committed ref BEFORE calling onChange
      lastCommittedRef.current = {min: value, max: localMax};
      onChange(value, localMax);
    }, 300);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), localMin + 1);
    setLocalMax(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Update the committed ref BEFORE calling onChange
      lastCommittedRef.current = {min: localMin, max: value};
      onChange(localMin, value);
    }, 300);
  };

  // Calculate percentage for slider track fill using ORIGINAL max price
  const minPercent = (localMin / stableMaxPrice) * 100;
  const maxPercent = (localMax / stableMaxPrice) * 100;

  return (
    <div className="price-range-filter">
      <div className="price-range-filter__header">
        The highest price is ${stableMaxPrice.toFixed(2)}
      </div>

      <div className="price-range-filter__slider-container">
        <div className="price-range-filter__track">
          <div
            className="price-range-filter__track-fill"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={stableMaxPrice}
          value={localMin}
          onChange={handleMinChange}
          className="price-range-filter__slider price-range-filter__slider--min"
        />
        <input
          type="range"
          min={0}
          max={stableMaxPrice}
          value={localMax}
          onChange={handleMaxChange}
          className="price-range-filter__slider price-range-filter__slider--max"
        />
      </div>

      <div className="price-range-filter__inputs flex gap-[0.25rem]">
        <span className="price-range-filter__label">Price:</span>
        <span className="price-range-filter__value">
          ${localMin} - ${localMax}
        </span>
      </div>
    </div>
  );
}
