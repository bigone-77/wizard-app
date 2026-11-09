// 프로필 조회·저장 (16-architecture 5장: REST profiles). 행은 가입할 때 DB 트리거가 만들어서 앱은 읽고 고치기만 한다

import { useMutation, useQuery } from '@tanstack/react-query';

import { type ExperienceLevel, isExperienceLevel } from './experience-level';

import { queryClient } from '@/lib/query-client';
import { supabase } from '@/lib/supabase';

export type Profile = { experienceLevel: ExperienceLevel | null };

export const profileKeys = {
  detail: (userId: string) => ['profile', userId] as const,
};

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? ''),
    enabled: userId !== undefined,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('experience_level')
        .eq('id', userId ?? '')
        .single();
      if (error) throw error;
      const level = data.experience_level;
      return { experienceLevel: isExperienceLevel(level) ? level : null };
    },
  });
}

/**
 * 경험 수준 저장. 같은 값을 다시 써도 결과가 같아서 재시도해도 안전하다.
 * 저장이 끝나도 캐시는 바로 고치지 않는다: 캐시가 바뀌면 이동 규칙이 S02를 닫으므로,
 * 화면이 먼저 다음 화면으로 이동한 뒤 setSavedExperienceLevel을 부른다
 */
export function useSaveExperienceLevel() {
  return useMutation({
    retry: 2,
    mutationFn: async (level: ExperienceLevel): Promise<{ userId: string }> => {
      const { data: auth } = await supabase.auth.getSession();
      const userId = auth.session?.user.id;
      if (!userId) throw new Error('로그인 세션이 없음');
      // user_id 같은 소유자 값은 보내지 않는다. 내 행인지는 RLS가 확인한다 (CLAUDE.md 규칙 6)
      const { data, error } = await supabase
        .from('profiles')
        .update({ experience_level: level })
        .eq('id', userId)
        .select('id');
      if (error) throw error;
      // 조건에 맞는 행이 없으면 오류 없이 0개만 바뀐다. 저장된 것이 아니므로 실패로 본다
      if (data.length !== 1) throw new Error(`profiles 행이 ${data.length}개 바뀜`);
      return { userId };
    },
  });
}

export function setSavedExperienceLevel(userId: string, level: ExperienceLevel) {
  queryClient.setQueryData<Profile>(profileKeys.detail(userId), { experienceLevel: level });
}
