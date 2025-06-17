import './globals.css'
import '@/styles/vendor/normalize.css'
import '@/styles/layouts/main.css'
import '@/styles/themes/coffee-theme.css'
import '@/styles/components/buttons.css'
import '@/styles/components/forms.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Coffee Order System',
  description: 'A modern coffee ordering system for cafes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}