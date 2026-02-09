import {useEffect, useRef, useCallback, type CSSProperties} from 'react';

// Autoplay Video Component - fixes React muted attribute issue
// Uses <source> element pattern like Mavon's implementation
function AutoplayVideo({src, className}: {src: string; className: string}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {
        // Autoplay was prevented, ignore
      });
    }
  }, []);

  // Determine video type from extension
  const getVideoType = (url: string) => {
    if (url.endsWith('.mp4')) return 'video/mp4';
    if (url.endsWith('.webm')) return 'video/webm';
    if (url.endsWith('.ogg')) return 'video/ogg';
    return 'video/mp4';
  };

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    >
      <source src={src} type={getVideoType(src)} />
    </video>
  );
}

// Types
export type ScrollDirection = 'left' | 'right';
export type TextSize = 'body-text' | 'h4' | 'h3' | 'h2' | 'h1' | 'h0';
export type ColumnGap = 'small' | 'medium' | 'large';
export type ColorScheme =
  | 'scheme-1'
  | 'scheme-2'
  | 'scheme-3'
  | 'scheme-4'
  | 'scheme-5';

// Scrolling Item Types
export interface ScrollingTextItem {
  type: 'text';
  text: string;
  textStroke?: boolean;
}

export interface ScrollingImageItem {
  type: 'image';
  image: string;
  imageHeight?: number;
  link?: string;
  cornerRadius?: number;
}

export interface ScrollingVideoItem {
  type: 'video';
  video: string;
  videoHeight?: number;
  link?: string;
  cornerRadius?: number;
}

export type ScrollingItem = ScrollingTextItem | ScrollingImageItem | ScrollingVideoItem;

export interface SectionScrollingTextProps {
  // Items
  items: ScrollingItem[];

  // Settings
  speed?: number; // 2-30 seconds
  direction?: ScrollDirection;
  textSize?: TextSize;
  columnGap?: ColumnGap;
  imageCornerRadius?: number; // 0-150px

  // Padding
  desktopPaddingTop?: string;
  desktopPaddingBottom?: string;
  mobilePaddingTop?: string;
  mobilePaddingBottom?: string;

  // Colors
  sectionColorScheme?: ColorScheme;

  className?: string;
}

/**
 * SectionScrollingText Component
 * Infinite scrolling text/image marquee section
 * Following Mavon Liquid theme pattern
 */
export function SectionScrollingText({
  items,
  speed = 15,
  direction = 'left',
  textSize = 'h2',
  columnGap = 'small',
  imageCornerRadius = 0,
  desktopPaddingTop = '50',
  desktopPaddingBottom = '50',
  mobilePaddingTop = '50',
  mobilePaddingBottom = '50',
  sectionColorScheme,
  className = '',
}: SectionScrollingTextProps) {
  const scrollingRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Clone items for infinite scroll effect
  useEffect(() => {
    if (!scrollingRef.current || isInitialized.current) return;

    const container = scrollingRef.current;
    const scrollingItem = container.querySelector('.scrolling--item');

    if (!scrollingItem) return;

    // Clone the scrolling item multiple times for seamless loop
    for (let i = 0; i < 10; i++) {
      const clone = scrollingItem.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      container.appendChild(clone);
    }

    isInitialized.current = true;

    // Pause animation when not in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            container.classList.remove('scrolling--text--paused');
          } else {
            container.classList.add('scrolling--text--paused');
          }
        });
      },
      {rootMargin: '0px 0px 50px 0px'},
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Section styles
  const sectionStyle: CSSProperties = {
    '--section-padding-top-desktop': desktopPaddingTop,
    '--section-padding-bottom-desktop': desktopPaddingBottom,
    '--section-padding-top-mobile': mobilePaddingTop,
    '--section-padding-bottom-mobile': mobilePaddingBottom,
    '--duration': `${speed}s`,
    '--image-corner-radius': `${imageCornerRadius}px`,
  } as CSSProperties;

  // Color scheme class
  const colorSchemeClass = sectionColorScheme ? `color-${sectionColorScheme}` : '';

  return (
    <section
      className={`section section-scrolling-text ${colorSchemeClass} ${className}`}
      style={sectionStyle}
    >
      <div
        ref={scrollingRef}
        className={`scrolling--text scrolling--text--${direction}`}
      >
        <div className="scrolling--item scrolling--animated">
          {items.map((item, index) => (
            <ScrollingItemComponent
              key={index}
              item={item}
              textSize={textSize}
              columnGap={columnGap}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Individual scrolling item component
function ScrollingItemComponent({
  item,
  textSize,
  columnGap,
}: {
  item: ScrollingItem;
  textSize: TextSize;
  columnGap: ColumnGap;
}) {
  if (item.type === 'text') {
    return (
      <div
        className={`scrolling--item__inner column--gap-${columnGap} ${textSize} ${
          item.textStroke ? 'scrolling--item__text--stroke' : ''
        }`}
      >
        <span className="scrolling--text__content">{item.text}</span>
      </div>
    );
  }

  if (item.type === 'image') {
    const imageStyle: CSSProperties = {
      '--scrolling-media-height': `${item.imageHeight || 100}px`,
      '--scrolling-media-radius': `${item.cornerRadius || 0}px`,
    } as CSSProperties;

    const imageContent = (
      <img
        src={item.image}
        alt=""
        className="scrolling--media-img"
        loading="lazy"
      />
    );

    return (
      <div
        className={`scrolling--item__inner column--gap-${columnGap} scrolling--media-item`}
        style={imageStyle}
      >
        {item.link ? (
          <a href={item.link} className="scrolling--link">
            {imageContent}
          </a>
        ) : (
          imageContent
        )}
      </div>
    );
  }

  if (item.type === 'video') {
    const videoStyle: CSSProperties = {
      '--scrolling-media-height': `${item.videoHeight || 100}px`,
      '--scrolling-media-radius': `${item.cornerRadius || 0}px`,
    } as CSSProperties;

    const videoContent = (
      <AutoplayVideo
        src={item.video}
        className="scrolling--media-video"
      />
    );

    return (
      <div
        className={`scrolling--item__inner column--gap-${columnGap} scrolling--media-item scrolling--item-video`}
        style={videoStyle}
      >
        {item.link ? (
          <a href={item.link} className="scrolling--link">
            {videoContent}
          </a>
        ) : (
          videoContent
        )}
      </div>
    );
  }

  return null;
}
