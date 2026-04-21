import AboutContent from '@/components/AboutContent';

export const metadata = {
  title: 'About Us — Vision Studios | Philip & Jan',
  description: 'Meet Philip Orloff and Jan — two student founders building cinematic digital experiences for ambitious brands. Premium motion design and 3D web at student prices.',
  openGraph: {
    title: 'About Us — Vision Studios',
    description: 'Two students. One vision. We build cinematic digital experiences for brands that demand attention.',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
