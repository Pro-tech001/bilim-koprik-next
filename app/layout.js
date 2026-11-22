import './globals.css';
import { cookies } from 'next/headers';
import { ToastProvider } from '@/components/Toast';
import { I18nProvider } from '@/lib/i18n';
import { normLang } from '@/lib/lang';

export const metadata = {
  title: 'Bilim Ko‘prik',
  description: 'O‘quvchi va mentorlar uchun onlayn ta‘lim platformasi'
};

export default async function RootLayout({ children }) {
  const lang = normLang((await cookies()).get('lang')?.value);
  return (
    <html lang={lang === 'oz' ? 'uz' : lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <I18nProvider initial={lang}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
