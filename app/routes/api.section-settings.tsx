import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { getSlideshowSettings, updateSection, getSections } from '~/lib/theme-settings.server';

/**
 * API route to get and update section settings
 * GET: Returns section settings for the homepage
 * POST: Updates section settings
 */

// GET: Get section settings
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const sectionType = url.searchParams.get('type') || 'slideshow';
  const pageHandle = url.searchParams.get('page') || 'index';

  if (sectionType === 'slideshow') {
    const slideshowSettings = await getSlideshowSettings(pageHandle);
    return data({ settings: slideshowSettings });
  }

  // Get all sections
  const sections = await getSections(pageHandle);
  return data({ sections });
}

// POST: Update section settings
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return data({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { sectionId, settings, pageHandle = 'index' } = body;

    if (!sectionId || !settings) {
      return data({ error: 'sectionId and settings are required' }, { status: 400 });
    }

    const updatedSection = await updateSection(pageHandle, sectionId, settings);

    if (!updatedSection) {
      return data({ error: 'Section not found' }, { status: 404 });
    }

    return data({ success: true, section: updatedSection });
  } catch (error) {
    console.error('Error updating section settings:', error);
    return data({ error: 'Failed to update settings' }, { status: 500 });
  }
}
