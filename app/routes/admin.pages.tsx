import { Outlet } from 'react-router';

/**
 * Layout route for /admin/pages/*
 * Simply renders child routes (index or $handle)
 */
export default function AdminPagesLayout() {
  return <Outlet />;
}
