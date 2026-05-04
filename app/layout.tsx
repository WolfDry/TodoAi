import type { Metadata } from 'next'
import '../styles/App.css'

export const metadata: Metadata = {
  title: 'Life Manager',
  description: 'Application web tout-en-un conçue pour centraliser et automatiser votre organisation quotidienne',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}