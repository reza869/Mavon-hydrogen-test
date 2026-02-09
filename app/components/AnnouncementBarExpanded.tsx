import {Link} from 'react-router';

interface AnnouncementBarExpandedProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  onClose?: () => void;
}

export function AnnouncementBarExpanded({
  title = 'UP TO 70% OFF',
  description = 'Pair text with an image to focus on your chosen product, collection, or blog post. Include information about availability, style, or even a review.',
  imageUrl = '/images/promo-banner.png',
  linkUrl = '/collections/sale',
  linkText = 'SHOP NOW',
  onClose,
}: AnnouncementBarExpandedProps) {
  return (
    <div className="color-scheme-3 bg-background relative pt-[7rem] pb-[7rem]">
      <div className="page-width mx-auto px-4 min-[750px]:px-[3rem] py-12 min-[750px]:py-20">
        <div className="flex flex-col min-[750px]:flex-row items-center gap-20 min-[750px]:gap-16">
          {/* Text Content - Left Side (below 750px: appears below image, 750px+: appears on left) */}
          <div className="flex-1 text-center">
            <h2 className="h1 text-foreground text-[3rem] min-[750px]:text-[4rem] font-bold mb-4 leading-tight bg-gradient-to-r from-[#d4af37] to-[#f5d77a] bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-foreground text-[1.5rem] min-[750px]:text-[1.6rem] leading-relaxed mb-8 min-[750px]:mx-0">
              {description}
            </p>
            <Link
              to={linkUrl}
              className="button button--large inline-flex items-center justify-center px-8 py-4 text-[1.4rem] font-medium text-foreground-75 bg-background border border-foreground rounded-full hover:bg-foreground hover:text-background transition-colors duration-200"
            >
              {linkText}
            </Link>
          </div>

          {/* Image - Right Side (below 750px: appears above text, 750px+: appears on right) */}
          <div className="w-full min-[750px]:w-[50%] flex-shrink-0">
            <div className="relative rounded-2xl overflow-hidden aspect-[2.15/1] bg-foreground-10">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide broken image
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
