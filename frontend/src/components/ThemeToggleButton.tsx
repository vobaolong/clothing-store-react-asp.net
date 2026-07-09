import { Moon, Sun } from 'lucide-react'
import { Button } from 'antd'
import { useTheme } from '@/hooks/useTheme'

export default function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Button
      type="text"
      className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
      onClick={toggleTheme}
    />
  )
}
