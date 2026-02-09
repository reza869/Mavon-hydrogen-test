import { data, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { Outlet, useLoaderData } from 'react-router';
import { requireAdmin } from '~/lib/admin-session.server';
import { hasUnpublishedChanges } from '~/lib/theme-settings.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Theme Dashboard' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { email, role } = await requireAdmin(request);
  const hasChanges = await hasUnpublishedChanges();

  return data({
    admin: { email, role },
    hasUnpublishedChanges: hasChanges,
  });
}

export default function AdminLayout() {
  // This is a minimal wrapper for admin routes
  // Child routes define their own layouts
  return <Outlet />;
}
