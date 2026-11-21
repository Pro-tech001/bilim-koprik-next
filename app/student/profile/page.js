'use client';
import ProfileForm from '@/components/ProfileForm';
import { useStudent } from '@/components/student/StudentProvider';

export default function StudentProfile() {
  const { me, setMe } = useStudent();
  return <ProfileForm me={me} onSaved={(upd) => setMe({ ...me, ...upd })} />;
}
