import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { requireAdmin } from '~/lib/admin-session.server';
import { getThemeSettings, updateColorSettings } from '~/lib/theme-settings.server';
import type { ColorSettings } from '~/types/theme-settings';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const settings = await getThemeSettings(true);
  return data({ colors: settings.colors });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const colors: Partial<ColorSettings> = {};

  const fields = [
    'primary',
    'secondary',
    'accent',
    'background',
    'text',
    'buttonBackground',
    'buttonText',
  ] as const;

  for (const field of fields) {
    const value = formData.get(field);
    if (value && typeof value === 'string') {
      colors[field] = value;
    }
  }

  const updatedColors = await updateColorSettings(colors);
  return data({ success: true, colors: updatedColors });
}

export default function AdminDesign() {
  const { colors } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [localColors, setLocalColors] = useState(colors);

  useEffect(() => {
    if (fetcher.data?.colors) {
      setLocalColors(fetcher.data.colors);
    }
  }, [fetcher.data]);

  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    setLocalColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const formData = new FormData();
    Object.entries(localColors).forEach(([key, value]) => {
      formData.append(key, value);
    });
    fetcher.submit(formData, { method: 'post' });
  };

  const isSaving = fetcher.state !== 'idle';
  const hasChanges = JSON.stringify(colors) !== JSON.stringify(localColors);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colors</h1>
          <p className="text-gray-600 mt-1">Customize your brand colors</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <LoadingSpinner />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {fetcher.data?.success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Colors updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h2>

            <div className="space-y-4">
              <ColorInput
                label="Primary Color"
                value={localColors.primary}
                onChange={(v) => handleColorChange('primary', v)}
                description="Main brand color for buttons and accents"
              />

              <ColorInput
                label="Secondary Color"
                value={localColors.secondary}
                onChange={(v) => handleColorChange('secondary', v)}
                description="Supporting color for backgrounds"
              />

              <ColorInput
                label="Accent Color"
                value={localColors.accent}
                onChange={(v) => handleColorChange('accent', v)}
                description="Highlight color for interactive elements"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Base Colors</h2>

            <div className="space-y-4">
              <ColorInput
                label="Background Color"
                value={localColors.background}
                onChange={(v) => handleColorChange('background', v)}
                description="Page background color"
              />

              <ColorInput
                label="Text Color"
                value={localColors.text}
                onChange={(v) => handleColorChange('text', v)}
                description="Main text color"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Button Colors</h2>

            <div className="space-y-4">
              <ColorInput
                label="Button Background"
                value={localColors.buttonBackground}
                onChange={(v) => handleColorChange('buttonBackground', v)}
                description="Default button background color"
              />

              <ColorInput
                label="Button Text"
                value={localColors.buttonText}
                onChange={(v) => handleColorChange('buttonText', v)}
                description="Button text color"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

          <div
            className="rounded-lg p-6 space-y-4"
            style={{ backgroundColor: localColors.background }}
          >
            <h3
              className="text-2xl font-bold"
              style={{ color: localColors.text }}
            >
              Sample Heading
            </h3>

            <p style={{ color: localColors.text }}>
              This is sample text showing how your colors will look on the storefront.
              The text color adapts to your settings.
            </p>

            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded-md font-medium"
                style={{
                  backgroundColor: localColors.buttonBackground,
                  color: localColors.buttonText,
                }}
              >
                Primary Button
              </button>

              <button
                className="px-4 py-2 rounded-md font-medium border-2"
                style={{
                  borderColor: localColors.primary,
                  color: localColors.primary,
                  backgroundColor: 'transparent',
                }}
              >
                Secondary Button
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <div
                className="w-12 h-12 rounded-md"
                style={{ backgroundColor: localColors.primary }}
                title="Primary"
              />
              <div
                className="w-12 h-12 rounded-md"
                style={{ backgroundColor: localColors.secondary }}
                title="Secondary"
              />
              <div
                className="w-12 h-12 rounded-md"
                style={{ backgroundColor: localColors.accent }}
                title="Accent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md font-mono"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
