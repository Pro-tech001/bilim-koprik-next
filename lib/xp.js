// O'yin elementlari: XP (ball), daraja va nishonlar — mavjud ma'lumotlardan hisoblanadi.
export const XP = { lesson: 10, submit: 20, grade: 30 }; // baho: 100% bo'lsa 30 XP

export const LEVELS = [
  { min: 0, name: 'Yangi boshlovchi' },
  { min: 100, name: 'Izlanuvchi' },
  { min: 250, name: 'Bilimdon' },
  { min: 500, name: 'Iqtidorli' },
  { min: 900, name: 'Bilim ustasi' }
];

// st: { lessonsDone, submissions, ratios: [baho/maks], coursesDone, courses }
export function xpOf(st) {
  return st.lessonsDone * XP.lesson + st.submissions * XP.submit
    + Math.round(st.ratios.reduce((t, r) => t + r * XP.grade, 0));
}

export function levelOf(xp) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].min) i++;
  const cur = LEVELS[i], next = LEVELS[i + 1];
  const pct = next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { n: i + 1, name: cur.name, min: cur.min, next: next?.min ?? null, pct };
}

export const BADGES = [
  { id: 'first', icon: '🌱', name: 'Birinchi qadam', desc: 'Birinchi darsni tugating', ok: (s) => s.lessonsDone >= 1 },
  { id: 'five', icon: '📚', name: 'Faol o‘quvchi', desc: '5 ta darsni tugating', ok: (s) => s.lessonsDone >= 5 },
  { id: 'twenty', icon: '🏃', name: 'Marafonchi', desc: '20 ta darsni tugating', ok: (s) => s.lessonsDone >= 20 },
  { id: 'answer', icon: '✍️', name: 'Birinchi javob', desc: 'Birinchi topshiriqni topshiring', ok: (s) => s.submissions >= 1 },
  { id: 'perfect', icon: '⭐', name: 'A’lochi', desc: 'Topshiriqdan maksimal ball oling', ok: (s) => s.ratios.some((r) => r >= 1) },
  { id: 'three', icon: '🏆', name: 'Uch karra a’lo', desc: '3 ta topshiriqdan maksimal ball oling', ok: (s) => s.ratios.filter((r) => r >= 1).length >= 3 },
  { id: 'course', icon: '🎓', name: 'Kurs bitiruvchisi', desc: 'Bitta kursni 100% tugating', ok: (s) => s.coursesDone >= 1 },
  { id: 'multi', icon: '🧭', name: 'Ko‘p qirrali', desc: '3 ta kursga yoziling', ok: (s) => s.courses >= 3 }
];
