import { Moon, Sun } from 'lucide-react'
import { Button } from 'antd'
import { useTheme } from '@/hooks/useTheme'

export default function ThemeToggleButton() {
	const { isDark, toggleTheme } = useTheme()

	return (
		<Button
			type="default"
			className="mr-2! h-9 rounded-md! border-slate-300 px-3 text-slate-700 hover:border-slate-400 hover:text-slate-900"
			icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
			onClick={toggleTheme}
		/>
	)
}
