import StudentProvider from '@/components/student/StudentProvider';

export const metadata = { title: 'O‘quvchi paneli — Bilim Ko‘prik' };

export default function StudentLayout({ children }) {
  return <StudentProvider>{children}</StudentProvider>;
}
