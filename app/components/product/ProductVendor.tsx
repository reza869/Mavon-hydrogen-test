import {Link} from 'react-router';

interface ProductVendorProps {
  /** The vendor name */
  vendor?: string | null;
  /** Show "Vendor:" label prefix */
  showLabel?: boolean;
  /** Make vendor name clickable (links to vendor collection) */
  linkToVendor?: boolean;
  /** Custom className */
  className?: string;
  /** Custom className */
  classNameLink?: string;
}

/**
 * A reusable component to display the product vendor.
 * Can optionally link to a vendor collection page.
 */
export function ProductVendor({
  vendor,
  showLabel = true,
  linkToVendor,
  className,
  classNameLink
}: ProductVendorProps) {
  if (!vendor) return null;

  const vendorContent = linkToVendor ? (
    <Link
      to={`/collections/vendors?q=${encodeURIComponent(vendor)}`}
      className={classNameLink}
    >
      {vendor}
    </Link>
  ) : (
    <span>{vendor}</span>
  );

  return (
    <p className={`product-vendor ${className}`.trim()}>
      {showLabel ? (
        <>
          <strong>Vendor: </strong>
          {vendorContent}
        </>
      ) : (
        vendorContent
      )}
    </p>
  );
}
