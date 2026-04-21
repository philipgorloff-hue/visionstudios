import { Space_Grotesk, Inter } from 'next/font/google';
import { LangProvider } from '@/lib/LangContext';
import Nav from '@/components/Nav';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
});

export const metadata = {
  title: 'Vision Studios — We Engineer Motion',
  description: 'Cinematic digital experiences. Motion design, 3D, and interactive web for brands that demand attention.',
  keywords: ['motion design', '3D web', 'interactive design', 'digital agency', 'web design', 'Zurich'],
  authors: [{ name: 'Vision Studios' }],
  creator: 'Vision Studios',
  metadataBase: new URL('https://visionstudios.netlify.app'),
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'Vision Studios — We Engineer Motion',
    description: 'Cinematic digital experiences. Motion design, 3D, and interactive web for brands that demand attention.',
    url: 'https://visionstudios.netlify.app',
    siteName: 'Vision Studios',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vision Studios — We Engineer Motion',
    description: 'Cinematic digital experiences built to move.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body><LangProvider><Nav />{children}</LangProvider></body>
    </html>
  );
}
