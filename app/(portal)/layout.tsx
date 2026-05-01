import { redirect } from 'next/navigation'
import { getSession, getStudentById } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const student = await getStudentById(session.id)
  if (!student) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar studentName={student.name} regNo={student.reg_no} />
      {/* On mobile: offset for top bar (56px) + topbar header (56px) = 112px
          On desktop: offset for sidebar (256px) + header (64px) */}
      <div className="lg:ml-64">
        {children}
      </div>
    </div>
  )
}
