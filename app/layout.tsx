import '@fortawesome/fontawesome-free/css/all.min.css'
import '../styles/globals.scss'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mind Map using D3.js',
  description: 'Interactive mind mapping application built with D3.js and Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}