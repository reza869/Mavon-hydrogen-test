import { data, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, Link } from 'react-router';
import { requireAdmin } from '~/lib/admin-session.server';
import { getAllPages } from '~/lib/theme-settings.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const pages = await getAllPages(true);
  return data({ pages });
}

export default function AdminPages() {
  const { pages } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-1">Manage your page sections and content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div
            key={page.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {page.title}
              </h3>
              <ArrowIcon />
            </div>

            <p className="text-sm text-gray-500 mb-4">
              /{page.handle === 'index' ? '' : page.handle}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <SectionsIcon />
              <span>{page.sections.length} sections</span>
            </div>

            {/* Section Preview */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                {page.sections.slice(0, 3).map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-2 text-xs text-gray-500"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        section.isVisible ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span>{section.name}</span>
                  </div>
                ))}
                {page.sections.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{page.sections.length - 3} more sections
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Link
              to={`/admin/pages/${page.handle}`}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              <EditIcon />
              Customize Sections
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

function SectionsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}
