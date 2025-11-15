import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChemVision - Molecular Structure Recognition',
  description: 'Convert between molecular images, SMILES, and IUPAC names',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
