import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import { Form, useActionData, useNavigation } from 'react-router';
import {
  getAdminSession,
  verifyAdminCredentials,
  createAdminSession,
} from '~/lib/admin-session.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Admin Login | Dashboard' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getAdminSession(request);
  const adminId = session.get('adminId');

  // If already logged in, redirect to dashboard
  if (adminId) {
    return redirect('/admin');
  }

  return data({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return data(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const admin = await verifyAdminCredentials(email, password);

  if (!admin) {
    return data(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  return createAdminSession(request, admin, '/admin');
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Theme Dashboard</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your theme</p>
        </div>

        <Form method="post" className="space-y-6">
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {actionData.error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Default credentials: admin@example.com / admin123
          </p>
          <p className="text-xs text-gray-400 mt-1">
            (Change in .env for production)
          </p>
        </div>
      </div>
    </div>
  );
}
