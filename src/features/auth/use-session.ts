// 로그인 세션 상태. 저장된 세션(암호화 세션 저장소)을 먼저 읽고, 이후 바뀌는 것을 따라간다

import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { queryClient } from '@/lib/query-client';
import { supabase } from '@/lib/supabase';

export type SessionState = { status: 'loading' } | { status: 'ready'; session: Session | null };

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ status: 'ready', session: data.session });
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // 계정을 바꿀 때 이전 계정의 데이터가 화면에 남지 않게 한다
      if (event === 'SIGNED_OUT') queryClient.clear();
      if (active) setState({ status: 'ready', session });
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
