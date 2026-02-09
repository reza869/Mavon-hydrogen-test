import type {SingleFeatureProps} from '~/components/sections/SectionTextWithIcons';

/**
 * Homepage Text with Icons Data
 * Configure features for the homepage text with icons section
 */
export const homepageFeatures: SingleFeatureProps[] = [
  {
    /* Icon Settings */
    useImage: true /* Set to true to use custom image instead of icon */,
    // icon: 'gift' /* Icon: truck | award | alarm | camera | check | clock | compass | card | dollar | gift | lock | map | mic | monitor | moon | music | phone | printer | compare | search | cart | bag | smart_phone | smile | sun | thumbs_up | thumbs_down | trash | umbrella | user | users | watch */,
    image: '/images/text-with-icon/icon-1.png' /* Custom image path (when useImage is true) - 70x70px */,
    /* Content */
    heading: 'Quality Products.',
    text: 'Pair text with an icon to focus on your store\'s features.',
  },
  {
    useImage: true,
    // icon: 'award',
    image: '/images/text-with-icon/icon-2.png' /* Custom image path (when useImage is true) - 70x70px */,
    heading: 'Safe Return Process.',
    text: 'Pair text with an icon to focus on your store\'s features.',
  },
  {
    useImage: true,
    // icon: 'truck',
    image: '/images/text-with-icon/icon-3.png' /* Custom image path (when useImage is true) - 70x70px */,
    heading: 'Fast Delivery.',
    text: 'Pair text with an icon to focus on your store\'s features.',
  },
];
