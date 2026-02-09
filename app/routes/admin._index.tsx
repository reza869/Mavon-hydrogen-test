import { data, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, Link, useFetcher } from 'react-router';
import { useState } from 'react';
import { requireAdmin } from '~/lib/admin-session.server';
import {
  getStoreConfig,
  hasUnpublishedChanges,
  publishSettings,
} from '~/lib/theme-settings.server';
import type { ActionFunctionArgs } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);

  const config = await getStoreConfig(true);
  const hasChanges = await hasUnpublishedChanges();

  return data({
    config,
    hasUnpublishedChanges: hasChanges,
    lastPublished: config.lastPublishedAt,
    lastUpdated: config.updatedAt,
    env: {
      storeDomain: process.env.PUBLIC_STORE_DOMAIN || 'Not configured',
      shopId: process.env.SHOP_ID || 'Not configured',
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'publish') {
    await publishSettings();
    return data({ success: true, message: 'Settings published successfully!' });
  }

  return data({ error: 'Invalid action' }, { status: 400 });
}

export default function AdminDashboard() {
  const { config, hasUnpublishedChanges, lastPublished, env } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'design'>('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['status', 'quick-actions']);

  const isPublishing = fetcher.state !== 'idle';

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Controls */}
      <div className="w-[380px] border-r border-gray-200 bg-white flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'pages'}
            onClick={() => setActiveTab('pages')}
          >
            Pages
          </TabButton>
          <TabButton
            active={activeTab === 'design'}
            onClick={() => setActiveTab('design')}
          >
            Design
          </TabButton>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-0">
              {/* Status Section */}
              <AccordionSection
                title="Status"
                icon={<StatusIcon />}
                expanded={expandedSections.includes('status')}
                onToggle={() => toggleSection('status')}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Theme Status</span>
                    <span
                      className={`text-sm font-medium ${
                        hasUnpublishedChanges ? 'text-amber-600' : 'text-green-600'
                      }`}
                    >
                      {hasUnpublishedChanges ? 'Draft' : 'Published'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Published</span>
                    <span className="text-sm text-gray-900">
                      {lastPublished
                        ? new Date(lastPublished).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pages</span>
                    <span className="text-sm text-gray-900">{config.pages.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sections</span>
                    <span className="text-sm text-gray-900">
                      {config.pages.reduce((acc, p) => acc + p.sections.length, 0)}
                    </span>
                  </div>

                  {hasUnpublishedChanges && (
                    <fetcher.Form method="post" className="pt-2">
                      <input type="hidden" name="intent" value="publish" />
                      <button
                        type="submit"
                        disabled={isPublishing}
                        className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isPublishing ? (
                          <>
                            <LoadingSpinner />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <PublishIcon />
                            Publish Changes
                          </>
                        )}
                      </button>
                    </fetcher.Form>
                  )}

                  {fetcher.data?.success && (
                    <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                      {fetcher.data.message}
                    </div>
                  )}
                </div>
              </AccordionSection>

              {/* Quick Actions Section */}
              <AccordionSection
                title="Quick Actions"
                icon={<ActionsIcon />}
                expanded={expandedSections.includes('quick-actions')}
                onToggle={() => toggleSection('quick-actions')}
              >
                <div className="space-y-2">
                  <ActionLink to="/admin/pages" icon={<PagesIcon />}>
                    Edit Pages
                  </ActionLink>
                  <ActionLink to="/admin/design" icon={<PaletteIcon />}>
                    Colors
                  </ActionLink>
                  <ActionLink to="/admin/typography" icon={<TypographyIcon />}>
                    Typography
                  </ActionLink>
                  <ActionLink to="/admin/layout" icon={<LayoutIcon />}>
                    Layout
                  </ActionLink>
                  <ActionLink to="/admin/settings" icon={<SettingsIcon />}>
                    Settings
                  </ActionLink>
                </div>
              </AccordionSection>

              {/* Store Info Section */}
              <AccordionSection
                title="Store Info"
                icon={<StoreIcon />}
                expanded={expandedSections.includes('store-info')}
                onToggle={() => toggleSection('store-info')}
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Domain</span>
                    <p className="text-sm text-gray-900">
                      {env.storeDomain}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Shop ID</span>
                    <p className="text-sm text-gray-900">
                      {env.shopId}
                    </p>
                  </div>
                </div>
              </AccordionSection>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                Select a page to customize its sections
              </p>
              <div className="space-y-2">
                {config.pages.map((page) => (
                  <Link
                    key={page.id}
                    to={`/admin/pages/${page.handle}`}
                    className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{page.title}</h4>
                      <p className="text-xs text-gray-500">
                        {page.sections.length} sections
                      </p>
                    </div>
                    <ChevronRightIcon />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                Customize your theme appearance
              </p>
              <div className="space-y-2">
                <Link
                  to="/admin/design"
                  className="flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <PaletteIcon />
                  <div>
                    <h4 className="font-medium text-gray-900">Colors</h4>
                    <p className="text-xs text-gray-500">Brand colors & schemes</p>
                  </div>
                </Link>
                <Link
                  to="/admin/typography"
                  className="flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <TypographyIcon />
                  <div>
                    <h4 className="font-medium text-gray-900">Typography</h4>
                    <p className="text-xs text-gray-500">Fonts & text styles</p>
                  </div>
                </Link>
                <Link
                  to="/admin/layout"
                  className="flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <LayoutIcon />
                  <div>
                    <h4 className="font-medium text-gray-900">Layout</h4>
                    <p className="text-xs text-gray-500">Spacing & containers</p>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="flex-1 bg-gray-100 flex flex-col h-full">
        {/* Preview Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Live Preview</span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded border border-gray-300 hover:bg-gray-50" title="Desktop">
                <DesktopIcon />
              </button>
              <button className="p-1.5 rounded border border-gray-300 hover:bg-gray-50" title="Mobile">
                <MobileIcon />
              </button>
            </div>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Open in new tab
            <ExternalLinkIcon />
          </a>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full min-h-[600px]">
            <iframe
              src="/"
              className="w-full h-full border-0"
              title="Theme Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

// Accordion Section Component
function AccordionSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500">{icon}</span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <ChevronIcon expanded={expanded} />
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// Action Link Component
function ActionLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
    >
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm">{children}</span>
    </Link>
  );
}

// Icons
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ActionsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function PagesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}

function TypographyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PublishIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function DesktopIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
