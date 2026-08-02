import { redirect } from 'next/navigation';

export default function FrontendAdminRedirectPage() {
  // All Admin features are 100% backend-driven served directly on Port 4000
  redirect('http://localhost:4000/admin/login');
}
