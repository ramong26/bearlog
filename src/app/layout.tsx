import type { Viewport, Metadata } from 'next';
import '@/styles/globals.css';
import Providers from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Bearlog | 목표와 할 일을 한 곳에서',
  description: '일반 모드로 일상 목표를 관리하고, 개발자 모드로 GitHub 레포지토리와 연동해 개발 할 일을 추적하세요.',
  metadataBase: new URL('https://bearlog.vercel.app'),
  openGraph: {
    title: 'Bearlog | 목표와 할 일을 한 곳에서',
    description: '일반 모드로 일상 목표를 관리하고, 개발자 모드로 GitHub 레포지토리와 연동해 개발 할 일을 추적하세요.',
    url: 'https://bearlog.vercel.app',
    siteName: 'Bearlog',
    images: [
      {
        url: 'https://bearlog.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bearlog 서비스 미리보기 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      {process.env.NODE_ENV === 'development' ? (
        <head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        </head>
      ) : null}
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=JSON.parse(localStorage.getItem('theme'));if(t&&t.state&&t.state.isDark)document.documentElement.classList.add('dark');}catch(e){}})();",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
