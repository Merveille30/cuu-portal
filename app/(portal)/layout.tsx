import { redirect } from 'next/navigation'
import { getSession, getStudentById } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const student = await getStudentById(session.id)
  if (!student) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar studentName={student.name} regNo={student.reg_no} />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  )
}
