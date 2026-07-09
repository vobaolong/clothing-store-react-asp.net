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
      className="border-none bg-transparent cursor-pointer text-inherit font-medium px-2 py-0"
    >
      {current.toUpperCase()}
    </button>
  )
}
