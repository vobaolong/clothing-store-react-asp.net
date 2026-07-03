import { i18n } from '@/i18n'

const getCurrentLanguage = () => i18n.language || i18n.resolvedLanguage || 'vi'

export const lp = (path: string) => {
  const lang = getCurrentLanguage()
  return path.startsWith(`/${lang}`) ? path : `/${lang}${path}`
}
