import {Link} from 'react-router';
import type {CSSProperties} from 'react';

export type VendorSize = 'sm' | 'md' | 'lg';

interface ProductVendorProps {
  /** The vendor name */
  vendor?: string | null;
  /** Size variant */
  size?: VendorSize;
  /** Show "Vendor:" label prefix */
  showLabel?: boolean;
  /** Make vendor name clickable (links to vendor collection) */
  linkToVendor?: boolean;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

const sizeStyles: Record<VendorSize, CSSProperties> = {
  sm: {fontSize: '12px'},
  md: {fontSize: '14px'},
  lg: {fontSize: '16px'},
};

/**
 * A reusable component to display the product vendor.
 * Can optionally link to a vendor collection page.
 */
export function ProductVendor({
  vendor,
  size = 'md',
  showLabel = true,
  linkToVendor = false,
  className = '',
  style = {},
}: ProductVendorProps) {
  if (!vendor) return null;

  const baseStyles: CSSProperties = {
    color: '#666',
    marginBottom: '4px',
    ...sizeStyles[size],
    ...style,
  };

  const vendorContent = linkToVendor ? (
    <Link
      to={`/collections/vendors?q=${encodeURIComponent(vendor)}`}
      style={{color: 'inherit', textDecoration: 'underline'}}
    >
      {vendor}
    </Link>
  ) : (
    <span>{vendor}</span>
  );

  return (
    <p className={`product-vendor ${className}`.trim()} style={baseStyles}>
      {showLabel ? (
        <>
          <span>Vendor: </span>
          {vendorContent}
        </>
      ) : (
        vendorContent
      )}
    </p>
  );
}
