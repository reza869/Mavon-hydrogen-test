import type {ScrollingItem} from '~/components/sections/SectionScrollingText';

/**
 * Homepage Scrolling Text Data
 * Configure items for the scrolling text marquee section
 */
export const homepageScrollingItems: ScrollingItem[] = [
  /* Text Item */
  {
    type: 'text',
    text: 'Welcome to our store',
    textStroke: false /* Enable text stroke effect: true | false */,
  },
  /* Image Item */
  {
    type: 'image',
    image: '/images/scrolling-text/1.png' /* Public image path */,
    imageHeight: 100 /* Height in pixels: 30-200 */,
    link: '/collections/featured' /* Optional link URL */,
    cornerRadius: 150 /* Corner radius: 0-150px */,
  },
  /* Text Item with Stroke */
  {
    type: 'text',
    text: 'Welcome to our store',
    textStroke: true,
  },
  /* Image Item */
  {
    type: 'image',
    image: '/images/scrolling-text/2.png' /* Public image path */,
    imageHeight: 100 /* Height in pixels: 30-200 */,
    link: '/collections/featured' /* Optional link URL */,
    cornerRadius: 150 /* Corner radius: 0-150px */,
  },
  /* Text Item */
  {
    type: 'text',
    text: 'Welcome to our store',
    textStroke: false,
  },
  /* Image Item */
  {
    type: 'image',
    image: '/images/scrolling-text/3.png' /* Public image path */,
    imageHeight: 100 /* Height in pixels: 30-200 */,
    link: '/collections/featured' /* Optional link URL */,
    cornerRadius: 150 /* Corner radius: 0-150px */,
  },
  /* Text Item with Stroke */
  {
    type: 'text',
    text: 'Welcome to our store',
    textStroke: true,
  },
  /* Image Item */
  {
    type: 'image',
    image: '/images/scrolling-text/4.png' /* Public image path */,
    imageHeight: 100 /* Height in pixels: 30-200 */,
    link: '/collections/featured' /* Optional link URL */,
    cornerRadius: 150 /* Corner radius: 0-150px */,
  },
  /* Text Item */
  {
    type: 'text',
    text: 'Welcome to our store',
    textStroke: false,
  },
  /* Video Item */
  {
    type: 'video',
    video: '/images/scrolling-text/5.mp4' /* Public video path */,
    videoHeight: 100 /* Height in pixels: 30-200 */,
    link: '/pages/about' /* Optional link URL */,
    cornerRadius: 150 /* Corner radius: 0-150px */,
  },
];
