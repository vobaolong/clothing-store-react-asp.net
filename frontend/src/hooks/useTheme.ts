import { ThemeContext } from '@/context/theme-context'
import { use } from 'react'

export function useTheme() {
  const ctx = use(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
