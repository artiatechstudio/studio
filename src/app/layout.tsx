
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { AppWrapper } from '@/components/app-wrapper';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Careingo | تواصل، تحدى، تطور',
  description: 'كارينجو هي منصتك التفاعلية للنمو الشخصي: تواصل مع المجتمع، تحدى نفسك في مسارات متنوعة، وتطور يومياً.',
  icons: {
    icon: [
      { url: '/logo.png', size: '32x32' },
      { url: '/logo.png', size: '192x192' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet" />
        
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2754396305908181" 
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // فرض الوضع النهاري كوضع افتراضي دائم عند التشغيل الأول
                const savedTheme = localStorage.getItem('theme');
                if (!savedTheme) {
                  localStorage.setItem('theme', 'light');
                  document.documentElement.classList.remove('dark');
                } else if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-right transition-colors duration-300" suppressHydrationWarning>
        <AppWrapper>
          <FirebaseClientProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </AppWrapper>
      </body>
    </html>
  );
}
