import './globals.css';
import { ToastProvider } from '@/components/Toast';
import { I18nProvider } from '@/lib/i18n';

export const metadata = {
  title: 'Bilim Ko‘prik',
  description: 'O‘quvchi va mentorlar uchun onlayn ta‘lim platformasi'
};

// Til brauzerda (cookie'dan) o'qiladi: sahifalar statik qoladi va tez ochiladi.
const LANG_BOOT = "try{var m=document.cookie.match(/(?:^|; )lang=(\\w+)/);if(m&&m[1]!=='uz'){var d=document.documentElement;d.classList.add('i18n-wait');setTimeout(function(){d.classList.remove('i18n-wait')},1500)}}catch(e){}";

export default function RootLayout({ children }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
