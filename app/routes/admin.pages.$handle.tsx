import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { useLoaderData, useFetcher, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { requireAdmin } from '~/lib/admin-session.server';
import { getStoreConfig, getSlideshowSettings, updateSection, publishSettings } from '~/lib/theme-settings.server';
import type { SlideshowSettings } from '~/types/theme-settings';

// Define section types for the homepage
const HOMEPAGE_SECTIONS = [
  {
    id: 'slideshow',
    type: 'slideshow',
    name: 'Slideshow with tab',
    icon: 'slideshow',
    blocks: [
      { id: 'slide-1', type: 'slide-video', name: 'Slide video - LUXURY & MODERN...' },
      { id: 'slide-2', type: 'slide-image', name: 'Slide image - MODERN DRESS 2...' },
      { id: 'slide-3', type: 'slide-image', name: 'Slide image - TRENDING & TOPS...' },
    ],
  },
  { id: 'promo-banner', type: 'promo-banner', name: 'Promo banner', icon: 'banner' },
  { id: 'featured-collection', type: 'featured-collection', name: 'Featured collection', icon: 'products' },
  { id: 'rich-text', type: 'rich-text', name: 'Rich text', icon: 'text' },
  { id: 'collection-links', type: 'collection-list', name: 'Collection links', icon: 'collection' },
  { id: 'scrolling-text', type: 'scrolling-text', name: 'Scrolling text', icon: 'text' },
  { id: 'reveal-text', type: 'reveal-text', name: 'Reveal text animation', icon: 'animation' },
  { id: 'reveal-video', type: 'reveal-video', name: 'Reveal video with text', icon: 'video' },
  { id: 'tab-collection', type: 'tab-collection', name: 'Tab with collection', icon: 'tabs' },
  { id: 'banner-list', type: 'banner-list', name: 'Banner list', icon: 'banner' },
  { id: 'products-bundle', type: 'products-bundle', name: 'Products bundle', icon: 'bundle' },
  { id: 'shop-the-look', type: 'shop-the-look', name: 'Shop the look slider', icon: 'look' },
  { id: 'featured-product', type: 'featured-product', name: 'Featured product', icon: 'product' },
  { id: 'before-after', type: 'before-after', name: 'Before/after image slider', icon: 'compare' },
  { id: 'testimonials', type: 'testimonials', name: 'Testimonials', icon: 'quote' },
  { id: 'countdown', type: 'countdown', name: 'Countdown with products', icon: 'timer' },
];

// Default settings for slideshow section
const DEFAULT_SLIDESHOW_SETTINGS = {
  slideHeight: 'adapt',
  animationType: 'slide',
  autoRotateSlides: false,
  changeSlides: 5,
  tabFontFamily: 'heading',
  tabFontSize: 'medium',
  tabBorderPosition: 'both',
  colorScheme: 'scheme-3',
  useCustomColorMobile: false,
  desktopPaddingTop: 0,
  desktopPaddingBottom: 0,
  mobilePaddingTop: 0,
  mobilePaddingBottom: 50,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const { handle } = params;

  const config = await getStoreConfig(true);
  const page = config.pages.find((p) => p.handle === handle);

  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }

  // Get slideshow settings from stored config (draft version for editing)
  const storedSlideshow = await getSlideshowSettings(handle || 'index', true) as SlideshowSettings | null;

  // Merge stored settings with defaults
  const slideshowSettings = storedSlideshow ? {
    slideHeight: storedSlideshow.slideHeight || 'adapt',
    animationType: storedSlideshow.animationType || 'slide',
    autoRotateSlides: storedSlideshow.autoRotateSlides ?? false,
    changeSlides: storedSlideshow.changeSlides ?? 5,
    tabFontFamily: storedSlideshow.tabFontFamily || 'heading',
    tabFontSize: storedSlideshow.tabFontSize || 'medium',
    tabBorderPosition: storedSlideshow.tabBorderPosition || 'both',
    colorScheme: storedSlideshow.colorScheme || 'scheme-3',
    useCustomColorMobile: storedSlideshow.useCustomColorMobile ?? false,
    desktopPaddingTop: storedSlideshow.desktopPaddingTop ?? 0,
    desktopPaddingBottom: storedSlideshow.desktopPaddingBottom ?? 0,
    mobilePaddingTop: storedSlideshow.mobilePaddingTop ?? 0,
    mobilePaddingBottom: storedSlideshow.mobilePaddingBottom ?? 50,
    // Navigation settings
    navigationStyle: storedSlideshow.navigationStyle || 'split-controls',
    navigationIconType: storedSlideshow.navigationIconType || 'long-arrow',
    navigationContainerDesktop: storedSlideshow.navigationContainerDesktop || 'fullwidth',
    showContentBelowImageOnMobile: storedSlideshow.showContentBelowImageOnMobile ?? true,
    customColorPagination: storedSlideshow.customColorPagination ?? true,
    paginationColorDesktop: storedSlideshow.paginationColorDesktop || '#ffffff',
    paginationColorMobile: storedSlideshow.paginationColorMobile || '#333333',
  } : DEFAULT_SLIDESHOW_SETTINGS;

  return data({
    page,
    sections: HOMEPAGE_SECTIONS,
    slideshowSettings,
    sectionId: storedSlideshow?.id || 'slideshow-1',
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAdmin(request);
  const { handle } = params;

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'save') {
    try {
      const sectionId = formData.get('sectionId') as string;
      const settingsJson = formData.get('settings') as string;
      const settings = JSON.parse(settingsJson);

      // Update the section with new settings
      const updatedSection = await updateSection(handle || 'index', sectionId, settings);

      if (!updatedSection) {
        return data({ error: 'Section not found' }, { status: 404 });
      }

      return data({ success: true, message: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      return data({ error: 'Failed to save settings' }, { status: 500 });
    }
  }

  if (intent === 'publish') {
    try {
      await publishSettings();
      return data({ success: true, message: 'Settings published! Changes are now live.' });
    } catch (error) {
      console.error('Error publishing settings:', error);
      return data({ error: 'Failed to publish settings' }, { status: 500 });
    }
  }

  return data({ error: 'Invalid action' }, { status: 400 });
}

export default function PageEditor() {
  const { page, sections, slideshowSettings, sectionId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [selectedSection, setSelectedSection] = useState<string | null>('slideshow');
  const [expandedSections, setExpandedSections] = useState<string[]>(['slideshow']);
  const [settings, setSettings] = useState(slideshowSettings);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const isSaving = fetcher.state !== 'idle';

  const toggleExpand = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    fetcher.submit(
      {
        intent: 'save',
        sectionId: sectionId,
        settings: JSON.stringify(settings),
      },
      { method: 'post' }
    );
  };

  const handlePublish = () => {
    fetcher.submit(
      { intent: 'publish' },
      { method: 'post' }
    );
  };

  // Refresh preview after successful save
  useEffect(() => {
    if (fetcher.data?.success) {
      setHasChanges(false);
      setPreviewKey((prev) => prev + 1);
    }
  }, [fetcher.data]);

  const selectedSectionData = sections.find((s) => s.id === selectedSection);

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'max-w-full';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Section Tree */}
      <div className="w-[260px] bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Page Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ChevronLeftIcon />
            <span>Back</span>
          </Link>
          <h1 className="text-base font-semibold text-gray-900">{page.title}</h1>
        </div>

        {/* Section Tree */}
        <div className="flex-1 overflow-y-auto text-sm">
          {/* Header Group */}
          <div className="border-b border-gray-100">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Header
            </div>
            <SectionTreeItem
              icon={<AnnouncementIcon />}
              name="Announcement bar"
              onClick={() => setSelectedSection('announcement')}
              selected={selectedSection === 'announcement'}
              indent={0}
            />
            <SectionTreeItem
              icon={<HeaderIcon />}
              name="Header"
              onClick={() => setSelectedSection('header')}
              selected={selectedSection === 'header'}
              indent={0}
            />
            <AddSectionButton />
          </div>

          {/* Template Group */}
          <div className="border-b border-gray-100">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Template
            </div>
            {sections.map((section) => (
              <div key={section.id}>
                <SectionTreeItem
                  icon={<SectionIcon type={section.type} />}
                  name={section.name}
                  hasChildren={section.blocks && section.blocks.length > 0}
                  expanded={expandedSections.includes(section.id)}
                  onToggle={() => toggleExpand(section.id)}
                  onClick={() => setSelectedSection(section.id)}
                  selected={selectedSection === section.id}
                  indent={0}
                />
                {/* Child blocks */}
                {section.blocks && expandedSections.includes(section.id) && (
                  <div className="bg-gray-50">
                    <button className="w-full px-4 py-1.5 pl-10 text-left text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                      <PlusIcon className="w-3 h-3" />
                      Add block
                    </button>
                    {section.blocks.map((block) => (
                      <SectionTreeItem
                        key={block.id}
                        icon={<BlockIcon type={block.type} />}
                        name={block.name}
                        onClick={() => setSelectedSection(block.id)}
                        selected={selectedSection === block.id}
                        indent={1}
                        small
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Group */}
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Footer
            </div>
            <SectionTreeItem
              icon={<FooterIcon />}
              name="Footer"
              onClick={() => setSelectedSection('footer')}
              selected={selectedSection === 'footer'}
              indent={0}
            />
          </div>
        </div>
      </div>

      {/* Center - Live Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Preview Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Desktop"
              >
                <DesktopIcon className={previewMode === 'desktop' ? 'text-blue-600' : 'text-gray-500'} />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-1.5 rounded ${previewMode === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Tablet"
              >
                <TabletIcon className={previewMode === 'tablet' ? 'text-blue-600' : 'text-gray-500'} />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Mobile"
              >
                <MobileIcon className={previewMode === 'mobile' ? 'text-blue-600' : 'text-gray-500'} />
              </button>
            </div>
            {/* Feedback Message */}
            {fetcher.data?.message && (
              <div className={`text-sm px-3 py-1 rounded ${fetcher.data?.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {fetcher.data.message}
              </div>
            )}
            {fetcher.data?.error && (
              <div className="text-sm px-3 py-1 rounded bg-red-100 text-red-700">
                {fetcher.data.error}
              </div>
            )}
            {/* Unsaved Changes Indicator */}
            {hasChanges && !isSaving && (
              <div className="text-sm text-amber-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Unsaved changes
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-gray-100" title="Undo">
              <UndoIcon />
            </button>
            <button className="p-1.5 rounded hover:bg-gray-100" title="Redo">
              <RedoIcon />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`px-4 py-1.5 text-sm rounded border transition-colors ${
                hasChanges && !isSaving
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving && fetcher.formData?.get('intent') === 'save' ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className={`px-4 py-1.5 text-sm rounded transition-colors ${
                isSaving && fetcher.formData?.get('intent') === 'publish'
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isSaving && fetcher.formData?.get('intent') === 'publish' ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 p-4 overflow-auto bg-gray-200 flex justify-center">
          <div className={`bg-white shadow-lg overflow-hidden h-full w-full ${getPreviewWidth()} transition-all duration-300`}>
            <iframe
              key={previewKey}
              src="/?draft=true"
              className="w-full h-full border-0"
              title="Theme Preview"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Section Settings */}
      {selectedSection && selectedSectionData && (
        <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
          {/* Settings Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-gray-900 text-sm">{selectedSectionData.name}</h2>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreIcon />
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedSection === 'slideshow' && (
              <SlideshowSettings
                settings={settings}
                onChange={handleSettingChange}
              />
            )}
            {selectedSection !== 'slideshow' && (
              <div className="p-4 text-sm text-gray-500">
                Settings for {selectedSectionData.name} section
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Slideshow Settings Panel (matches screenshot)
function SlideshowSettings({
  settings,
  onChange,
}: {
  settings: typeof DEFAULT_SLIDESHOW_SETTINGS;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="divide-y divide-gray-100">
      {/* Slide Height */}
      <div className="p-4">
        <label className="block text-sm text-gray-700 mb-2">
          Slide height
        </label>
        <select
          value={settings.slideHeight}
          onChange={(e) => onChange('slideHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="adapt">Fit</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Slider Settings */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Slider settings</h3>

        {/* Animation Type */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Animation type</label>
          <div className="flex">
            <button
              onClick={() => onChange('animationType', 'slide')}
              className={`flex-1 px-4 py-2 text-sm border ${
                settings.animationType === 'slide'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-l-md`}
            >
              Slide
            </button>
            <button
              onClick={() => onChange('animationType', 'fade')}
              className={`flex-1 px-4 py-2 text-sm border-t border-b border-r ${
                settings.animationType === 'fade'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-r-md`}
            >
              Fade
            </button>
          </div>
        </div>

        {/* Enable Autoplay */}
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm text-gray-600">Enable autoplay</label>
          <ToggleSwitch
            checked={settings.autoRotateSlides}
            onChange={(checked) => onChange('autoRotateSlides', checked)}
          />
        </div>

        {/* Change Slides Every */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Change slides every</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={settings.changeSlides}
                onChange={(e) => onChange('changeSlides', parseInt(e.target.value) || 5)}
                className="w-14 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                min={1}
                max={20}
              />
              <span className="text-sm text-gray-500">s</span>
            </div>
          </div>
          <input
            type="range"
            value={settings.changeSlides}
            onChange={(e) => onChange('changeSlides', parseInt(e.target.value))}
            min={1}
            max={20}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
        </div>
      </div>

      {/* Tab Settings */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Tab settings</h3>

        {/* Font Family */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Font family</label>
          <div className="flex">
            <button
              onClick={() => onChange('tabFontFamily', 'body')}
              className={`flex-1 px-4 py-2 text-sm border ${
                settings.tabFontFamily === 'body'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-l-md`}
            >
              Body
            </button>
            <button
              onClick={() => onChange('tabFontFamily', 'heading')}
              className={`flex-1 px-4 py-2 text-sm border-t border-b border-r ${
                settings.tabFontFamily === 'heading'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-r-md`}
            >
              Heading
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Font size</label>
          <div className="flex">
            <button
              onClick={() => onChange('tabFontSize', 'small')}
              className={`flex-1 px-3 py-2 text-sm border ${
                settings.tabFontSize === 'small'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-l-md`}
            >
              Small
            </button>
            <button
              onClick={() => onChange('tabFontSize', 'medium')}
              className={`flex-1 px-3 py-2 text-sm border-t border-b ${
                settings.tabFontSize === 'medium'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => onChange('tabFontSize', 'large')}
              className={`flex-1 px-3 py-2 text-sm border-t border-b border-r ${
                settings.tabFontSize === 'large'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-r-md`}
            >
              Large
            </button>
          </div>
        </div>

        {/* Border Position */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Border position</label>
          <select
            value={settings.tabBorderPosition}
            onChange={(e) => onChange('tabBorderPosition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="both">Both</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Colors */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Colors</h3>

        {/* Color Scheme */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">
            Color scheme tab menu desktop
          </label>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-medium">
              Aa
            </div>
            <select
              value={settings.colorScheme}
              onChange={(e) => onChange('colorScheme', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="scheme-1">Scheme 1</option>
              <option value="scheme-2">Scheme 2</option>
              <option value="scheme-3">Scheme 3</option>
              <option value="scheme-4">Scheme 4</option>
              <option value="scheme-5">Scheme 5</option>
            </select>
          </div>
        </div>

        {/* Use Custom Color for Mobile */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Use custom color for mobile</label>
          <ToggleSwitch
            checked={settings.useCustomColorMobile}
            onChange={(checked) => onChange('useCustomColorMobile', checked)}
          />
        </div>
      </div>

      {/* Section Padding */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Section padding</h3>

        {/* Desktop Padding Top */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Padding top (desktop)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={settings.desktopPaddingTop}
                onChange={(e) => onChange('desktopPaddingTop', parseInt(e.target.value) || 0)}
                className="w-14 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                min={0}
                max={200}
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
          <input
            type="range"
            value={settings.desktopPaddingTop}
            onChange={(e) => onChange('desktopPaddingTop', parseInt(e.target.value))}
            min={0}
            max={200}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
        </div>

        {/* Desktop Padding Bottom */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Padding bottom (desktop)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={settings.desktopPaddingBottom}
                onChange={(e) => onChange('desktopPaddingBottom', parseInt(e.target.value) || 0)}
                className="w-14 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                min={0}
                max={200}
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
          <input
            type="range"
            value={settings.desktopPaddingBottom}
            onChange={(e) => onChange('desktopPaddingBottom', parseInt(e.target.value))}
            min={0}
            max={200}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
        </div>

        {/* Mobile Padding Top */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Padding top (mobile)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={settings.mobilePaddingTop}
                onChange={(e) => onChange('mobilePaddingTop', parseInt(e.target.value) || 0)}
                className="w-14 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                min={0}
                max={200}
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
          <input
            type="range"
            value={settings.mobilePaddingTop}
            onChange={(e) => onChange('mobilePaddingTop', parseInt(e.target.value))}
            min={0}
            max={200}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
        </div>

        {/* Mobile Padding Bottom */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Padding bottom (mobile)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={settings.mobilePaddingBottom}
                onChange={(e) => onChange('mobilePaddingBottom', parseInt(e.target.value) || 0)}
                className="w-14 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                min={0}
                max={200}
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
          <input
            type="range"
            value={settings.mobilePaddingBottom}
            onChange={(e) => onChange('mobilePaddingBottom', parseInt(e.target.value))}
            min={0}
            max={200}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
        </div>
      </div>
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Section Tree Item Component
function SectionTreeItem({
  icon,
  name,
  hasChildren,
  expanded,
  onToggle,
  small,
  onClick,
  selected,
  indent = 0,
}: {
  icon: React.ReactNode;
  name: string;
  hasChildren?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  small?: boolean;
  onClick: () => void;
  selected?: boolean;
  indent?: number;
}) {
  const paddingLeft = 16 + (indent * 16);

  return (
    <div
      className={`flex items-center gap-2 pr-2 cursor-pointer hover:bg-gray-50 ${
        selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
      } ${small ? 'py-1' : 'py-2'}`}
      style={{ paddingLeft }}
      onClick={onClick}
    >
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          className="p-0.5 hover:bg-gray-200 rounded"
        >
          <ChevronIcon expanded={expanded} />
        </button>
      )}
      {!hasChildren && <span className="w-4" />}
      <span className={`${small ? 'text-xs' : 'text-sm'} text-gray-400 shrink-0`}>{icon}</span>
      <span className={`${small ? 'text-xs' : 'text-sm'} truncate flex-1`}>{name}</span>
      <GripIcon className="text-gray-300 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

function AddSectionButton() {
  return (
    <button className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2">
      <PlusCircleIcon className="w-4 h-4" />
      Add section
    </button>
  );
}

// Icon Components
function ChevronIcon({ expanded }: { expanded?: boolean }) {
  return (
    <svg
      className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6-12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={`${className || 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={`${className || 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className || 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className || 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function MobileIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className || 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
    </svg>
  );
}

function AnnouncementIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function HeaderIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function FooterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  );
}

function SectionIcon({ type }: { type: string }) {
  switch (type) {
    case 'slideshow':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'promo-banner':
    case 'banner-list':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'featured-collection':
    case 'products-bundle':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'collection-list':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'rich-text':
    case 'scrolling-text':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      );
    case 'testimonials':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
  }
}

function BlockIcon({ type }: { type: string }) {
  if (type.includes('video')) {
    return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
