import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CUU Student Portal',
  description: 'Cavendish University Uganda — Student Records Management System',
  icons: { icon: '/cuu-logo.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
