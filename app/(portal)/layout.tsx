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
      <Sidebar studentName={student.name} regNo={student.reg_no || ''} />
      {/* Mobile: offset for mobile topbar (56px) + page header (56px) = pt-28
          Desktop: offset for sidebar (256px) only, header is fixed inside each page */}
      <div className="lg:ml-64 min-h-screen">
        {children}
      </div>
    </div>
  )
}
