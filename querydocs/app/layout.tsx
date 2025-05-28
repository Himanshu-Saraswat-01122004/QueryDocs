import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'QueryDocs | AI-Powered Document Chat',
  description: 'Upload your PDFs and chat with them using AI',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-white min-h-screen`}>
          <SignedIn>
            {/* Header with app name and user button for signed-in users */}
            <header className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-6 py-3 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 h-16">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-indigo-400">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M14 2H10a2 2 0 0 0-2 2v2h8V4a2 2 0 0 0-2-2Z" />
                  <path d="m9 14 2 2 4-4" />
                </svg>
                <span className="font-bold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">QueryDocs</span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-10 h-10'
                  }
                }}
                afterSignOutUrl="/"
              />
            </header>
            
            {/* Main content with top padding for header */}
            <main className="pt-16">
              {children}
            </main>
          </SignedIn>
          
          <SignedOut>
            {/* No header for signed-out users, just show the auth screen */}
            {children}
          </SignedOut>
        </body>
      </html>
    </ClerkProvider>
  )
}