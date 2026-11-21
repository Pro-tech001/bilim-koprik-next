import MentorProvider from '@/components/mentor/MentorProvider';

export const metadata = { title: 'Mentor paneli — Bilim Ko‘prik' };

export default function MentorLayout({ children }) {
  return <MentorProvider>{children}</MentorProvider>;
}
