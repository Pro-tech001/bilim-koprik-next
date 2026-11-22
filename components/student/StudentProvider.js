'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';
import { errText } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import { useT } from '@/lib/i18n';
import SubmitModal from './SubmitModal';
import { xpOf, levelOf, BADGES } from '@/lib/xp';

const Ctx = createContext(null);
export const useStudent = () => useContext(Ctx);

const EMPTY = { courses: [], lessons: [], done: new Set(), assignments: [], subs: new Map() };

export default function StudentProvider({ children }) {
  const sb = getSupabase();
  const router = useRouter();
  const toast = useToast();
  const t = useT();
  const [me, setMe] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [submitFor, setSubmitFor] = useState(null); // assignment

  const reload = useCallback(async (uid) => {
    const id = uid || me?.id;
    const [enr, les, prog, asg, sub] = await Promise.all([
      sb.from('enrollments').select('course_id, created_at, course:courses(id,title,description,subject, mentor:profiles!mentor_id(full_name))').eq('student_id', id),
      sb.from('lessons').select('id,course_id,title,position').order('position'),
      sb.from('lesson_progress').select('lesson_id').eq('student_id', id),
      sb.from('assignments').select('*').order('due_at', { ascending: true, nullsFirst: false }),
      sb.from('submissions').select('*').eq('student_id', id)
    ]);
    const bad = [enr, les, prog, asg, sub].find((r) => r.error);
    if (bad) { toast(errText(bad.error), 6000); return; }
    setData({
      courses: enr.data.filter((e) => e.course).map((e) => e.course),
      lessons: les.data,
      done: new Set(prog.data.map((p) => p.lesson_id)),
      assignments: asg.data,
      subs: new Map(sub.data.map((s) => [s.assignment_id, s]))
    });
  }, [sb, me, toast]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return router.replace('/');
      const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single();
      if (!p) return router.replace('/');
      if (p.role !== 'student') return router.replace('/mentor');
      setMe(p);
      await reload(p.id);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const helpers = useMemo(() => {
    const courseById = (id) => data.courses.find((c) => c.id === id);
    const lessonsOf = (cid) => data.lessons.filter((l) => l.course_id === cid);
    const pctOf = (cid) => {
      const ls = lessonsOf(cid);
      return ls.length ? Math.round((ls.filter((l) => data.done.has(l.id)).length / ls.length) * 100) : 0;
    };
    // O'yin: XP, daraja, nishonlar
    const ratios = [...data.subs.values()].filter((x) => x.score != null).map((x) => {
      const a = data.assignments.find((y) => y.id === x.assignment_id);
      return a ? x.score / a.max_score : 0;
    });
    const st = {
      lessonsDone: data.done.size,
      submissions: data.subs.size,
      ratios,
      coursesDone: data.courses.filter((c) => lessonsOf(c.id).length && pctOf(c.id) === 100).length,
      courses: data.courses.length
    };
    const xp = xpOf(st);
    const game = { st, xp, level: levelOf(xp), badges: BADGES.map((b) => ({ ...b, got: b.ok(st) })) };
    return { courseById, lessonsOf, pctOf, game };
  }, [data]);

  if (!ready || !me) return <div className="main"><p className="muted">{t('Yuklanmoqda...')}</p></div>;

  const todo = data.assignments.filter((a) => !data.subs.has(a.id)).length;
  const value = { me, setMe, ...data, ...helpers, reload, sb, toast, openSubmit: setSubmitFor };

  return (
    <Ctx.Provider value={value}>
      <div className="app student">
        <Sidebar
          base="/student"
          roleLabel="O‘quvchi"
          name={me.full_name}
          items={[
            { href: '/student', label: 'Bosh sahifa' },
            { href: '/student/courses', label: 'Kurslarim' },
            { href: '/student/catalog', label: 'Kurslar katalogi' },
            { href: '/student/apply', label: 'Kursga ariza' },
            { href: '/student/tasks', label: 'Topshiriqlar', count: todo },
            { href: '/student/results', label: 'Natijalarim' },
            { href: '/student/achievements', label: 'Yutuqlarim' },
            { href: '/student/profile', label: 'Profil' },
            { href: '/student/about', label: 'Sayt haqida' }
          ]}
        />
        <main className="main">{children}</main>
        {submitFor && <SubmitModal assignment={submitFor} onClose={() => setSubmitFor(null)} />}
      </div>
    </Ctx.Provider>
  );
}
