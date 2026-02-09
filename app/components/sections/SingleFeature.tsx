import {IconFeatures, type IconName} from './IconFeatures';

// Types
export type ContentAlignment = 'left' | 'center' | 'right';

export interface SingleFeatureProps {
  // Icon or Image
  useImage?: boolean;
  icon?: IconName;
  image?: string;

  // Content Settings
  heading?: string;
  text?: string;
}

/**
 * SingleFeature Component
 * Individual feature item for the Text with Icons section
 * Icon/image, heading (h4), and text content
 */
export function SingleFeature({
  useImage = false,
  icon = 'check',
  image,
  heading,
  text,
}: SingleFeatureProps) {
  return (
    <div className="single-feature">
      {/* Icon or Image */}
      <div className="single-feature__icon-wrapper">
        {useImage && image ? (
          <img
            src={image}
            alt={heading || 'Feature icon'}
            className="single-feature__image"
            width={70}
            height={70}
            loading="lazy"
          />
        ) : (
          <IconFeatures
            icon={icon}
            size={50}
            className="single-feature__icon"
          />
        )}
      </div>

      {/* Content */}
      <div className="single-feature__content">
        {/* Heading with h4 class */}
        {heading && (
          <h4 className="single-feature__heading h4">
            {heading}
          </h4>
        )}

        {/* Text */}
        {text && (
          <div
            className="single-feature__text"
            dangerouslySetInnerHTML={{__html: text}}
          />
        )}
      </div>
    </div>
  );
}
