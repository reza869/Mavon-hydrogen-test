import { redirect, type ActionFunctionArgs } from 'react-router';
import {
  getAdminSession,
  destroyAdminSession,
} from '~/lib/admin-session.server';

export async function action({ request }: ActionFunctionArgs) {
  const session = await getAdminSession(request);

  return redirect('/admin/login', {
    headers: {
      'Set-Cookie': await destroyAdminSession(session),
    },
  });
}

export async function loader() {
  return redirect('/admin/login');
}
