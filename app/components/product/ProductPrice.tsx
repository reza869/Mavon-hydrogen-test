import {Money} from '@shopify/hydrogen';

/** Money type compatible with Hydrogen's Money component */
type MoneyData = {
  amount: string;
  currencyCode: string;
};

export function ProductPrice({
  price,
  compareAtPrice,
  className,
  compareClassName,
  groupClassName,
  showFromPrefix = false,
  fromPrefixClassName,
}: {
  price?: MoneyData;
  compareAtPrice?: MoneyData | null;
  compareClassName?: string;
  className?: string;
  groupClassName?: string;
  /** Show "From" prefix for variable products */
  showFromPrefix?: boolean;
  /** Custom className for "From" prefix */
  fromPrefixClassName?: string;
}) {
  const fromPrefix = showFromPrefix ? (
    <span className={fromPrefixClassName || 'text-foreground/60'}>From </span>
  ) : null;

  return (
    <div className="product-price">
      {compareAtPrice ? (
        <div className={groupClassName}>
          <s className={compareClassName}>
            <Money data={compareAtPrice} />
          </s>
          <span className={className}>
            {fromPrefix}
            {price ? <Money data={price} /> : null}
          </span>
        </div>
      ) : price ? (
        <span className={className}>
          {fromPrefix}
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
