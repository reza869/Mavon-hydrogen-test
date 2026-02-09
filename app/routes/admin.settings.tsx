import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useFetcher } from 'react-router';
import { useState } from 'react';
import { requireAdmin } from '~/lib/admin-session.server';
import { getStoreConfig, resetToDefaults } from '~/lib/theme-settings.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { email, role } = await requireAdmin(request);
  const config = await getStoreConfig(true);

  return data({
    admin: { email, role },
    config,
    env: {
      storeDomain: process.env.PUBLIC_STORE_DOMAIN || 'Not set',
      shopId: process.env.SHOP_ID || 'Not set',
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'reset') {
    await resetToDefaults();
    return data({ success: true, message: 'Settings reset to defaults' });
  }

  return data({ error: 'Invalid action' }, { status: 400 });
}

export default function AdminSettings() {
  const { admin, config, env } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    fetcher.submit({ intent: 'reset' }, { method: 'post' });
    setShowResetConfirm(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage dashboard and store settings</p>
      </div>

      {fetcher.data?.success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {fetcher.data.message}
        </div>
      )}

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{admin.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-gray-900 capitalize">{admin.role}</p>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Store Domain</label>
              <p className="text-gray-900">{env.storeDomain}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Shop ID</label>
              <p className="text-gray-900">{env.shopId}</p>
            </div>
          </div>
        </div>

        {/* Theme Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Theme Status</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className={`font-medium ${config.isDraft ? 'text-amber-600' : 'text-green-600'}`}>
                {config.isDraft ? 'Draft (Unpublished)' : 'Published'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-gray-900">
                {new Date(config.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Published</label>
              <p className="text-gray-900">
                {config.lastPublishedAt
                  ? new Date(config.lastPublishedAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Pages</label>
              <p className="text-gray-900">{config.pages.length}</p>
            </div>
          </div>
        </div>

        {/* Environment Variables Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment</h2>
          <p className="text-sm text-gray-600 mb-4">
            These settings are configured via environment variables in your .env file.
          </p>

          <div className="bg-gray-50 rounded-md p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap text-gray-700">
                {`# Dashboard Settings
                ADMIN_SESSION_SECRET=your-secret-key
                ADMIN_EMAIL=admin@example.com
                ADMIN_PASSWORD=admin123

                # Store Settings (existing)
                PUBLIC_STORE_DOMAIN=${env.storeDomain}
                SHOP_ID=${env.shopId}`}
            </pre>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Reset to Defaults</h3>
              <p className="text-sm text-gray-500">
                This will reset all theme settings to their default values.
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reset Settings
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset to Defaults?
            </h3>
            <p className="text-gray-600 mb-4">
              This will reset all your theme customizations. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
