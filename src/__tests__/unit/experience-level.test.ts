import { describe, expect, it } from 'vitest';

import {
  EXPERIENCE_LEVELS,
  GREETING_CHOICES,
  isExperienceLevel,
} from '@/features/profile/experience-level';

describe('경험 수준 (10 profiles.experience_level, 05 ①)', () => {
  it('값 3개가 DB check 제약과 같다', () => {
    expect([...EXPERIENCE_LEVELS]).toEqual(['pre_adoption', 'beginner', 'experienced']);
  });

  it('S02 갈래는 05 ① 순서대로 저장 값과 다음 경로가 이어진다', () => {
    expect(GREETING_CHOICES.map(({ label, level, next }) => ({ label, level, next }))).toEqual([
      { label: '아직 데려오기 전이야', level: 'pre_adoption', next: '/pre-adoption' },
      // 긴급 점검(S08)은 M4(T041)에서 등록 앞에 끼워 넣는다. 그전까지는 바로 등록으로
      { label: '막 데려왔어, 처음 키워봐', level: 'beginner', next: '/register-pet' },
      { label: '키워본 적 있어', level: 'experienced', next: '/register-pet' },
    ]);
  });

  it('isExperienceLevel은 세 값만 통과시킨다 (DB 타입이 string | null이라서)', () => {
    for (const level of EXPERIENCE_LEVELS) expect(isExperienceLevel(level)).toBe(true);
    expect(isExperienceLevel(null)).toBe(false);
    expect(isExperienceLevel('')).toBe(false);
    expect(isExperienceLevel('expert')).toBe(false);
  });
});
