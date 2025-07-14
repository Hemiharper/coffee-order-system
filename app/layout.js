// app/layout.js

import './globals.css'
import '@/styles/vendor/normalize.css'
import '@/styles/layouts/main.css'
import '@/styles/themes/coffee-theme.css'
import '@/styles/components/buttons.css'
import '@/styles/components/forms.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// This metadata object sets the default title for all pages in your app.
export const metadata = {
  title: 'Big Brews',
  description: 'Order your perfect coffee online.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
