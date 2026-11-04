// 타입 테스트: 실제 검사는 pnpm exec tsc --noEmit이 한다 (15 M1 완료 기준 "DB 타입이 앱에서 자동완성됨")
import { describe, expectTypeOf, it } from 'vitest';

import type { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

describe('DB 타입 (src/types/database.ts)', () => {
  it('profiles 컬럼 타입이 마이그레이션과 같다', () => {
    expectTypeOf<Profile['timezone']>().toEqualTypeOf<string>();
    expectTypeOf<Profile>().toHaveProperty('ai_daily_budget_override');
  });

  it('Supabase 클라이언트가 테이블 이름을 안다 (없는 테이블은 타입 오류)', () => {
    // 실행하지 않고 타입만 본다
    const check = (client: typeof supabase) => {
      client.from('profiles');
      // @ts-expect-error 없는 테이블
      client.from('no_such_table');
    };
    expectTypeOf(check).toBeFunction();
  });
});
