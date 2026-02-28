import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('Impressum');

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
            {t('title')}
          </h1>

          {/* Responsible Person */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {t('responsible')}
            </h2>
            <div className="text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{t('name')}</p>
              <p>{t('address')}</p>
              <p>{t('city')}</p>
              <p>{t('country')}</p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {t('contact')}
            </h2>
            <div className="text-gray-600 space-y-1">
              <p>{t('email')}</p>
              <p>{t('phone')}</p>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {t('disclaimer.title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('disclaimer.content')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
