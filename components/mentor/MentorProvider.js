'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';
import { errText } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import { CourseModal, LessonModal, AssignmentModal, GradeModal } from './modals';

const Ctx = createContext(null);
export const useMentor = () => useContext(Ctx);

const EMPTY = { courses: [], lessons: [], enrollments: [], assignments: [], subs: [], progress: [] };
const MODALS = { course: CourseModal, lesson: LessonModal, assignment: AssignmentModal, grade: GradeModal };

export default function MentorProvider({ children }) {
  const sb = getSupabase();
  const router = useRouter();
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(null); // { type, props }

  const reload = useCallback(async (uid) => {
    const id = uid || me?.id;
    const [c, l, e, a, s, p] = await Promise.all([
      sb.from('courses').select('*').eq('mentor_id', id).order('created_at', { ascending: false }),
      sb.from('lessons').select('id,course_id,title,content,video_url,position').order('position'),
      sb.from('enrollments').select('student_id,course_id,created_at, student:profiles!student_id(id,full_name,phone)'),
      sb.from('assignments').select('*').order('created_at', { ascending: false }),
      sb.from('submissions').select('*, student:profiles!student_id(full_name)').order('submitted_at', { ascending: false }),
      sb.from('lesson_progress').select('student_id,lesson_id')
    ]);
    const bad = [c, l, e, a, s, p].find((r) => r.error);
    if (bad) { toast(errText(bad.error), 6000); return; }
    const mine = new Set(c.data.map((x) => x.id));
    const assignments = a.data.filter((x) => mine.has(x.course_id));
    const myAsg = new Set(assignments.map((x) => x.id));
    setData({
      courses: c.data,
      lessons: l.data.filter((x) => mine.has(x.course_id)),
      enrollments: e.data.filter((x) => mine.has(x.course_id)),
      assignments,
      subs: s.data.filter((x) => myAsg.has(x.assignment_id)),
      progress: p.data
    });
  }, [sb, me, toast]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return router.replace('/');
      const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single();
      if (!p) return router.replace('/');
      if (p.role !== 'mentor') return router.replace('/student');
      setMe(p);
      await reload(p.id);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const helpers = useMemo(() => {
    const course = (id) => data.courses.find((c) => c.id === id);
    const asg = (id) => data.assignments.find((x) => x.id === id);
    const lessonsOf = (cid) => data.lessons.filter((l) => l.course_id === cid);
    const studentsOf = (cid) => data.enrollments.filter((e) => e.course_id === cid);
    const progressPct = (sid, cid) => {
      const ls = lessonsOf(cid);
      if (!ls.length) return 0;
      const ids = new Set(ls.map((l) => l.id));
      return Math.round((data.progress.filter((p) => p.student_id === sid && ids.has(p.lesson_id)).length / ls.length) * 100);
    };
    const avgScore = (sid, cid) => {
      const g = data.subs.filter((s) => s.student_id === sid && s.score != null && (!cid || asg(s.assignment_id)?.course_id === cid));
      return g.length ? (g.reduce((t, s) => t + (s.score / asg(s.assignment_id).max_score) * 5, 0) / g.length).toFixed(1) : '—';
    };
    return { course, asg, lessonsOf, studentsOf, progressPct, avgScore };
  }, [data]);

  if (!ready || !me) return <div className="main"><p className="muted">Yuklanmoqda...</p></div>;

  const pending = data.subs.filter((s) => s.score == null).length;
  const open = (type, props = {}) => {
    if (type !== 'course' && type !== 'grade' && !data.courses.length) return toast('Avval kurs yarating.');
    setModal({ type, props });
  };
  const value = { me, setMe, ...data, ...helpers, pending, reload, sb, toast, open };
  const Modal = modal && MODALS[modal.type];

  return (
    <Ctx.Provider value={value}>
      <div className="app mentor">
        <Sidebar
          base="/mentor"
          roleLabel="Mentor"
          name={me.full_name}
          items={[
            { group: 'Asosiy' },
            { href: '/mentor', label: 'Bosh sahifa' },
            { href: '/mentor/students', label: 'O‘quvchilar' },
            { group: 'Kontent' },
            { href: '/mentor/courses', label: 'Kurslarim' },
            { href: '/mentor/assignments', label: 'Topshiriqlar' },
            { group: 'Boshqaruv' },
            { href: '/mentor/grading', label: 'Baholash', count: pending },
            { href: '/mentor/stats', label: 'Statistika' },
            { href: '/mentor/profile', label: 'Profil' }
          ]}
        />
        <main className="main">{children}</main>
        {Modal && <Modal {...modal.props} onClose={() => setModal(null)} />}
      </div>
    </Ctx.Provider>
  );
}
