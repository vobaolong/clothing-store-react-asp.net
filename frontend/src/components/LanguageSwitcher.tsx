import { GlobalOutlined } from '@ant-design/icons'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const LANGUAGES = [
  { value: 'vi', label: 'VI' },
  { value: 'en', label: 'EN' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()

  const handleChange = (lng: string) => {
    const path = window.location.pathname.replace(/^\/\w{2}/, `/${lng}`)
    i18n.changeLanguage(lng)
    navigate(path + window.location.search, { replace: true })
  }

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      options={LANGUAGES}
      className="w-16!"
      size="small"
      variant="borderless"
      suffixIcon={<GlobalOutlined />}
    />
  )
}
