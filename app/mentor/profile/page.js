'use client';
import ProfileForm from '@/components/ProfileForm';
import { useMentor } from '@/components/mentor/MentorProvider';

export default function MentorProfile() {
  const { me, setMe } = useMentor();
  return <ProfileForm me={me} withBio onSaved={(upd) => setMe({ ...me, ...upd })} />;
}
