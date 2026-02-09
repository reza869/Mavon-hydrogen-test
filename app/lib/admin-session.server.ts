import {
  createCookieSessionStorage,
  redirect,
  type Session,
} from 'react-router';

// Admin session storage
const adminSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'admin_session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.ADMIN_SESSION_SECRET || 'default-admin-secret-change-in-production'],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
  },
});

export interface AdminSession {
  adminId: string;
  email: string;
  role: 'owner' | 'admin' | 'editor';
}

export async function getAdminSession(request: Request): Promise<Session> {
  return adminSessionStorage.getSession(request.headers.get('Cookie'));
}

export async function commitAdminSession(session: Session): Promise<string> {
  return adminSessionStorage.commitSession(session);
}

export async function destroyAdminSession(session: Session): Promise<string> {
  return adminSessionStorage.destroySession(session);
}

export async function requireAdmin(request: Request): Promise<{
  adminId: string;
  email: string;
  role: string;
  session: Session;
}> {
  const session = await getAdminSession(request);
  const adminId = session.get('adminId');
  const email = session.get('email');
  const role = session.get('role');

  if (!adminId) {
    throw redirect('/admin/login');
  }

  return { adminId, email, role, session };
}

export async function createAdminSession(
  request: Request,
  adminData: AdminSession,
  redirectTo: string = '/admin'
): Promise<Response> {
  const session = await getAdminSession(request);
  session.set('adminId', adminData.adminId);
  session.set('email', adminData.email);
  session.set('role', adminData.role);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitAdminSession(session),
    },
  });
}

// Simple password verification (in production, use bcrypt)
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminSession | null> {
  // Default admin credentials from environment
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === adminEmail && password === adminPassword) {
    return {
      adminId: 'admin-1',
      email: adminEmail,
      role: 'owner',
    };
  }

  return null;
}
