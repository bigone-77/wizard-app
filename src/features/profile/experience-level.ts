// 경험 수준 (10 profiles.experience_level). DB 타입은 check 제약을 담지 못해 string | null이라 여기서 좁힌다
// S02 박사 인사의 3갈래 (05 ①). 라벨은 05 원문, 설명은 T075 화면 뼈대

export const EXPERIENCE_LEVELS = ['pre_adoption', 'beginner', 'experienced'] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export function isExperienceLevel(value: string | null): value is ExperienceLevel {
  return (EXPERIENCE_LEVELS as readonly (string | null)[]).includes(value);
}

export type GreetingChoice = {
  label: string;
  description: string;
  level: ExperienceLevel;
  /** 저장한 뒤 갈 화면 (16-architecture 4장 경로) */
  next: '/pre-adoption' | '/register-pet';
};

export const GREETING_CHOICES: readonly GreetingChoice[] = [
  {
    label: '아직 데려오기 전이야',
    description: '준비물과 분양받을 때 물어볼 것',
    level: 'pre_adoption',
    next: '/pre-adoption',
  },
  {
    label: '막 데려왔어, 처음 키워봐',
    description: '처음이라도 괜찮아, 하나씩 같이 챙길게',
    level: 'beginner',
    // 긴급 환경 점검(S08)은 M4(T041)에서 등록 앞에 끼워 넣는다
    next: '/register-pet',
  },
  {
    label: '키워본 적 있어',
    description: '바로 우리 아이 등록하기',
    level: 'experienced',
    next: '/register-pet',
  },
];
