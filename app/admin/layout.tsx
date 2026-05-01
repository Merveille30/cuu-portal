import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar adminName={session.name} role={session.role} />
      <div className="lg:ml-64">{children}</div>
    </div>
  )
}
