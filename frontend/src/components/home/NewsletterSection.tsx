import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ScrollReveal from '@/components/animations/ScrollReveal'

export default function NewsletterSection() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')

  return (
    <ScrollReveal>
      <section className="relative overflow-hidden rounded-xl bg-[#8B2332] text-white">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center px-8 py-12 md:px-16 md:py-16">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold md:text-3xl">{t('footer.subscribeTitle')}</h2>
            <p className="mt-2 text-sm text-red-200 md:text-base">
              {t('footer.subscribeDesc')}
            </p>
          </div>

          <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-0 md:min-w-72">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletterPlaceholder')}
                className="w-full px-11 py-3 text-sm text-white placeholder-red-200 bg-white/15 backdrop-blur-xs rounded-full border border-white/20 outline-none focus:bg-white/25 focus:border-white/40 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex gap-2 items-center px-6 py-3 text-sm font-bold bg-white text-red-900! rounded-full hover:bg-red-50 transition-all whitespace-nowrap cursor-pointer"
            >
              {t('footer.newsletterButton')}
            </button>
          </form>
        </div>
      </section>
    </ScrollReveal>
  )
}
