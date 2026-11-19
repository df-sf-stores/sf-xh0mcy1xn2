import type { ReactNode } from 'react'
import '../theme/tokens.css'
import './tailwind.css'
import { theme } from '../theme/manifest'
import { readContent } from './content'
import { themeMedia } from './media'
import { Shell } from './Shell'

export const metadata = { title: theme.name }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Browser extensions (Grammarly, password managers) add attributes to <html> and <body> before React hydrates. Without
    // suppressHydrationWarning, next dev records that as a runtime error and reloads the page on its next HMR update, in a loop.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Shell content={readContent()} media={themeMedia()}>
          {children}
        </Shell>
      </body>
    </html>
  )
}
