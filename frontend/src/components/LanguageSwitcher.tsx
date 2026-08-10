import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()

  const current = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const next = current === 'vi' ? 'en' : 'vi'

  const toggle = () => {
    const path = window.location.pathname.replace(
      /^\/(vi|en)(?=\/|$)/,
      `/${next}`
    )
    void i18n.changeLanguage(next)
    navigate(path + window.location.search, { replace: true })
  }

  return (
    <button
      onClick={toggle}
      className="px-2 py-0 font-medium bg-transparent border-none cursor-pointer text-inherit"
    >
      {current.toUpperCase()}
    </button>
  )
}
