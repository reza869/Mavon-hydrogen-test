import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useFetcher } from 'react-router';
import { useState, useEffect } from 'react';
import { requireAdmin } from '~/lib/admin-session.server';
import { getThemeSettings, updateTypographySettings } from '~/lib/theme-settings.server';
import type { TypographySettings } from '~/types/theme-settings';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const settings = await getThemeSettings(true);
  return data({ typography: settings.typography });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const typography: Partial<TypographySettings> = {};

  const headingFont = formData.get('headingFont');
  const bodyFont = formData.get('bodyFont');
  const baseFontSize = formData.get('baseFontSize');
  const headingFontWeight = formData.get('headingFontWeight');
  const bodyFontWeight = formData.get('bodyFontWeight');
  const lineHeight = formData.get('lineHeight');

  if (headingFont) typography.headingFont = headingFont as string;
  if (bodyFont) typography.bodyFont = bodyFont as string;
  if (baseFontSize) typography.baseFontSize = parseInt(baseFontSize as string);
  if (headingFontWeight) typography.headingFontWeight = parseInt(headingFontWeight as string);
  if (bodyFontWeight) typography.bodyFontWeight = parseInt(bodyFontWeight as string);
  if (lineHeight) typography.lineHeight = parseFloat(lineHeight as string);

  const updated = await updateTypographySettings(typography);
  return data({ success: true, typography: updated });
}

const FONT_OPTIONS = [
  { value: 'Lato', label: 'Lato' },
  { value: 'Chivo', label: 'Chivo' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Oswald', label: 'Oswald' },
];

const WEIGHT_OPTIONS = [
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi-Bold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'Extra-Bold (800)' },
];

export default function AdminTypography() {
  const { typography } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [local, setLocal] = useState(typography);

  useEffect(() => {
    if (fetcher.data?.typography) {
      setLocal(fetcher.data.typography);
    }
  }, [fetcher.data]);

  const handleChange = (key: keyof TypographySettings, value: string | number) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const formData = new FormData();
    Object.entries(local).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    fetcher.submit(formData, { method: 'post' });
  };

  const isSaving = fetcher.state !== 'idle';
  const hasChanges = JSON.stringify(typography) !== JSON.stringify(local);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Typography</h1>
          <p className="text-gray-600 mt-1">Customize fonts and text styles</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {fetcher.data?.success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Typography settings updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Font Families</h2>

            <div className="space-y-4">
              <SelectField
                label="Heading Font"
                value={local.headingFont}
                onChange={(v) => handleChange('headingFont', v)}
                options={FONT_OPTIONS}
                description="Font family for headings (h1-h6)"
              />

              <SelectField
                label="Body Font"
                value={local.bodyFont}
                onChange={(v) => handleChange('bodyFont', v)}
                options={FONT_OPTIONS}
                description="Font family for body text"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Font Weights</h2>

            <div className="space-y-4">
              <SelectField
                label="Heading Weight"
                value={local.headingFontWeight}
                onChange={(v) => handleChange('headingFontWeight', parseInt(v))}
                options={WEIGHT_OPTIONS}
                description="Font weight for headings"
              />

              <SelectField
                label="Body Weight"
                value={local.bodyFontWeight}
                onChange={(v) => handleChange('bodyFontWeight', parseInt(v))}
                options={WEIGHT_OPTIONS}
                description="Font weight for body text"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Size & Spacing</h2>

            <div className="space-y-4">
              <RangeField
                label="Base Font Size"
                value={local.baseFontSize}
                onChange={(v) => handleChange('baseFontSize', v)}
                min={12}
                max={20}
                step={1}
                unit="px"
                description="Base font size for the entire site"
              />

              <RangeField
                label="Line Height"
                value={local.lineHeight}
                onChange={(v) => handleChange('lineHeight', v)}
                min={1}
                max={2}
                step={0.1}
                description="Line height multiplier for text"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

          <div className="space-y-6">
            <div
              style={{
                fontFamily: `"${local.headingFont}", sans-serif`,
                fontWeight: local.headingFontWeight,
              }}
            >
              <h1 className="text-4xl mb-2">Heading 1</h1>
              <h2 className="text-3xl mb-2">Heading 2</h2>
              <h3 className="text-2xl mb-2">Heading 3</h3>
              <h4 className="text-xl mb-2">Heading 4</h4>
            </div>

            <hr className="border-gray-200" />

            <div
              style={{
                fontFamily: `"${local.bodyFont}", sans-serif`,
                fontWeight: local.bodyFontWeight,
                fontSize: `${local.baseFontSize}px`,
                lineHeight: local.lineHeight,
              }}
            >
              <p className="mb-4">
                This is a sample paragraph demonstrating how body text will appear
                on your storefront. The font family, size, weight, and line height
                all affect readability.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  description,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  description?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5 mb-2">{description}</p>
      )}
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
