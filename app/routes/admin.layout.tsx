import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { requireAdmin } from '~/lib/admin-session.server';
import {
  getThemeSettings,
  updateLayoutSettings,
  updateButtonSettings,
} from '~/lib/theme-settings.server';
import type { LayoutSettings, ButtonSettings } from '~/types/theme-settings';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const settings = await getThemeSettings(true);
  return data({
    layout: settings.layout,
    buttons: settings.buttons,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'layout') {
    const layout: Partial<LayoutSettings> = {};
    const containerMaxWidth = formData.get('containerMaxWidth');
    const gridGap = formData.get('gridGap');
    const borderRadius = formData.get('borderRadius');
    const sectionPaddingTop = formData.get('sectionPaddingTop');
    const sectionPaddingBottom = formData.get('sectionPaddingBottom');

    if (containerMaxWidth) layout.containerMaxWidth = parseInt(containerMaxWidth as string);
    if (gridGap) layout.gridGap = parseInt(gridGap as string);
    if (borderRadius) layout.borderRadius = parseInt(borderRadius as string);
    if (sectionPaddingTop) layout.sectionPaddingTop = parseInt(sectionPaddingTop as string);
    if (sectionPaddingBottom) layout.sectionPaddingBottom = parseInt(sectionPaddingBottom as string);

    const updated = await updateLayoutSettings(layout);
    return data({ success: true, layout: updated });
  }

  if (intent === 'buttons') {
    const buttons: Partial<ButtonSettings> = {};
    const borderRadius = formData.get('buttonBorderRadius');
    const fontWeight = formData.get('buttonFontWeight');
    const textTransform = formData.get('buttonTextTransform');
    const borderWidth = formData.get('buttonBorderWidth');
    const letterSpacing = formData.get('buttonLetterSpacing');

    if (borderRadius) buttons.borderRadius = parseInt(borderRadius as string);
    if (fontWeight) buttons.fontWeight = parseInt(fontWeight as string);
    if (textTransform) buttons.textTransform = textTransform as ButtonSettings['textTransform'];
    if (borderWidth) buttons.borderWidth = parseInt(borderWidth as string);
    if (letterSpacing) buttons.letterSpacing = parseFloat(letterSpacing as string);

    const updated = await updateButtonSettings(buttons);
    return data({ success: true, buttons: updated });
  }

  return data({ error: 'Invalid intent' }, { status: 400 });
}

export default function AdminLayout() {
  const { layout, buttons } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [localLayout, setLocalLayout] = useState(layout);
  const [localButtons, setLocalButtons] = useState(buttons);

  useEffect(() => {
    if (fetcher.data?.layout) {
      setLocalLayout(fetcher.data.layout);
    }
    if (fetcher.data?.buttons) {
      setLocalButtons(fetcher.data.buttons);
    }
  }, [fetcher.data]);

  const handleLayoutChange = (key: keyof LayoutSettings, value: number) => {
    setLocalLayout((prev) => ({ ...prev, [key]: value }));
  };

  const handleButtonChange = (key: keyof ButtonSettings, value: string | number) => {
    setLocalButtons((prev) => ({ ...prev, [key]: value }));
  };

  const saveLayout = () => {
    const formData = new FormData();
    formData.append('intent', 'layout');
    Object.entries(localLayout).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    fetcher.submit(formData, { method: 'post' });
  };

  const saveButtons = () => {
    const formData = new FormData();
    formData.append('intent', 'buttons');
    formData.append('buttonBorderRadius', String(localButtons.borderRadius));
    formData.append('buttonFontWeight', String(localButtons.fontWeight));
    formData.append('buttonTextTransform', localButtons.textTransform);
    formData.append('buttonBorderWidth', String(localButtons.borderWidth));
    formData.append('buttonLetterSpacing', String(localButtons.letterSpacing));
    fetcher.submit(formData, { method: 'post' });
  };

  const isSaving = fetcher.state !== 'idle';
  const hasLayoutChanges = JSON.stringify(layout) !== JSON.stringify(localLayout);
  const hasButtonChanges = JSON.stringify(buttons) !== JSON.stringify(localButtons);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Layout Settings</h1>
        <p className="text-gray-600 mt-1">Customize spacing, containers, and buttons</p>
      </div>

      {fetcher.data?.success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Settings updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Layout Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Container & Spacing</h2>
            <button
              onClick={saveLayout}
              disabled={isSaving || !hasLayoutChanges}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="space-y-6">
            <RangeField
              label="Container Max Width"
              value={localLayout.containerMaxWidth}
              onChange={(v) => handleLayoutChange('containerMaxWidth', v)}
              min={1000}
              max={1800}
              step={10}
              unit="px"
              description="Maximum width of the main content container"
            />

            <RangeField
              label="Grid Gap"
              value={localLayout.gridGap}
              onChange={(v) => handleLayoutChange('gridGap', v)}
              min={8}
              max={48}
              step={4}
              unit="px"
              description="Spacing between grid items"
            />

            <RangeField
              label="Border Radius"
              value={localLayout.borderRadius}
              onChange={(v) => handleLayoutChange('borderRadius', v)}
              min={0}
              max={24}
              step={2}
              unit="px"
              description="Default border radius for cards and elements"
            />

            <RangeField
              label="Section Padding Top"
              value={localLayout.sectionPaddingTop}
              onChange={(v) => handleLayoutChange('sectionPaddingTop', v)}
              min={0}
              max={100}
              step={4}
              unit="px"
              description="Top padding for sections"
            />

            <RangeField
              label="Section Padding Bottom"
              value={localLayout.sectionPaddingBottom}
              onChange={(v) => handleLayoutChange('sectionPaddingBottom', v)}
              min={0}
              max={100}
              step={4}
              unit="px"
              description="Bottom padding for sections"
            />
          </div>
        </div>

        {/* Button Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Buttons</h2>
            <button
              onClick={saveButtons}
              disabled={isSaving || !hasButtonChanges}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="space-y-6">
            <RangeField
              label="Button Border Radius"
              value={localButtons.borderRadius}
              onChange={(v) => handleButtonChange('borderRadius', v)}
              min={0}
              max={24}
              step={2}
              unit="px"
              description="Roundness of button corners"
            />

            <SelectField
              label="Button Font Weight"
              value={localButtons.fontWeight}
              onChange={(v) => handleButtonChange('fontWeight', parseInt(v))}
              options={[
                { value: 400, label: 'Regular (400)' },
                { value: 500, label: 'Medium (500)' },
                { value: 600, label: 'Semi-Bold (600)' },
                { value: 700, label: 'Bold (700)' },
              ]}
            />

            <SelectField
              label="Text Transform"
              value={localButtons.textTransform}
              onChange={(v) => handleButtonChange('textTransform', v)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'uppercase', label: 'UPPERCASE' },
                { value: 'lowercase', label: 'lowercase' },
                { value: 'capitalize', label: 'Capitalize' },
              ]}
            />

            <RangeField
              label="Border Width"
              value={localButtons.borderWidth}
              onChange={(v) => handleButtonChange('borderWidth', v)}
              min={0}
              max={4}
              step={1}
              unit="px"
              description="Border thickness for outlined buttons"
            />

            <RangeField
              label="Letter Spacing"
              value={localButtons.letterSpacing}
              onChange={(v) => handleButtonChange('letterSpacing', v)}
              min={0}
              max={0.3}
              step={0.05}
              unit="em"
              description="Space between letters"
            />
          </div>

          {/* Button Preview */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 py-2 bg-black text-white"
                style={{
                  borderRadius: `${localButtons.borderRadius}px`,
                  fontWeight: localButtons.fontWeight,
                  textTransform: localButtons.textTransform,
                  letterSpacing: `${localButtons.letterSpacing}em`,
                }}
              >
                Add to Cart
              </button>
              <button
                className="px-4 py-2 bg-transparent text-black"
                style={{
                  borderRadius: `${localButtons.borderRadius}px`,
                  fontWeight: localButtons.fontWeight,
                  textTransform: localButtons.textTransform,
                  letterSpacing: `${localButtons.letterSpacing}em`,
                  border: `${localButtons.borderWidth}px solid black`,
                }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  description,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  description?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-sm font-medium text-gray-900">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full mt-2"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
