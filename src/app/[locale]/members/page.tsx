import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function MembersPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('MembersPage');

  const cards = [
    {
      key: 'premium',
      color: 'blue',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      key: 'tutorial',
      color: 'green',
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      key: 'dashboard',
      color: 'purple',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      key: 'webinar',
      color: 'orange',
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const colorClasses: Record<string, { bg: string; tagBg: string; tagText: string }> = {
    blue: { bg: 'bg-blue-100', tagBg: 'bg-blue-100', tagText: 'text-blue-700' },
    green: { bg: 'bg-green-100', tagBg: 'bg-green-100', tagText: 'text-green-700' },
    purple: { bg: 'bg-purple-100', tagBg: 'bg-purple-100', tagText: 'text-purple-700' },
    orange: { bg: 'bg-orange-100', tagBg: 'bg-orange-100', tagText: 'text-orange-700' },
  };

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Members Only
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => {
            const colors = colorClasses[card.color];
            return (
              <div
                key={card.key}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <span className={`${colors.tagBg} ${colors.tagText} text-xs font-semibold px-3 py-1 rounded-full`}>
                    {t(`${card.key}.tag`)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t(`${card.key}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`${card.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
