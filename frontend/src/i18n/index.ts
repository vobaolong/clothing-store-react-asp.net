import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'

const supportedLngs = ['vi', 'en'] as const

const getLanguageFromPath = (pathname = window.location.pathname) => {
  const match = pathname.match(/^\/(vi|en)(?=\/|$)/)
  return match?.[1] ?? 'vi'
}

export const syncLanguageFromPath = async (
  pathname = window.location.pathname
) => {
  const nextLng = getLanguageFromPath(pathname)
  const currentLng = i18n.resolvedLanguage || i18n.language || 'vi'

  if (nextLng !== currentLng) {
    await i18n.changeLanguage(nextLng)
  }

  return nextLng
}

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: getLanguageFromPath(),
    fallbackLng: 'en',
    supportedLngs,
    interpolation: { escapeValue: false },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  })

export { i18n }
