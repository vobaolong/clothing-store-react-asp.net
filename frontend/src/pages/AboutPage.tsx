import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl card p-5 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#234483] dark:text-[#a6c0ef]">
            {t('about.title')}
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#0F1E3C] dark:text-[#e2e8f0] sm:text-4xl md:text-5xl">
            {t('about.subtitle')}
          </h1>
          <p className="mt-6 text-base leading-8 text-[#0F1E3C]/80 dark:text-[#94a3b8] sm:text-lg">
            {t('about.description')}
          </p>
          <div className="flex flex-col gap-3 mt-8 sm:flex-row sm:items-center">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#234483] px-6 text-sm font-semibold text-[#FAF9F6] transition hover:bg-[#2E5299]"
            >
              {t('about.cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <article className="rounded-2xl card p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#234483] dark:text-[#a6c0ef]">
            {t('about.missionTitle')}
          </p>
          <h2 className="mt-4 text-xl font-semibold text-[#0F1E3C] dark:text-[#e2e8f0] sm:text-2xl">
            {t('about.missionSubtitle')}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#0F1E3C]/75 dark:text-[#94a3b8]">
            {t('about.missionDesc')}
          </p>
        </article>

        <article className="rounded-2xl card p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#234483] dark:text-[#a6c0ef]">
            {t('about.valuesTitle')}
          </p>
          <h2 className="mt-4 text-xl font-semibold text-[#0F1E3C] dark:text-[#e2e8f0] sm:text-2xl">
            {t('about.valuesSubtitle')}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#0F1E3C]/75 dark:text-[#94a3b8]">
            {t('about.valuesDesc')}
          </p>
        </article>

        <article className="rounded-2xl card p-5 sm:col-span-2 sm:p-8 lg:col-span-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#234483] dark:text-[#a6c0ef]">
            {t('about.servicesTitle')}
          </p>
          <h2 className="mt-4 text-xl font-semibold text-[#0F1E3C] dark:text-[#e2e8f0] sm:text-2xl">
            {t('about.servicesSubtitle')}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#0F1E3C]/75 dark:text-[#94a3b8]">
            {t('about.servicesDesc')}
          </p>
        </article>
      </section>
    </div>
  )
}
