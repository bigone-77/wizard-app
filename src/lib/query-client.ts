// 서버 상태 캐시 (CLAUDE.md 데이터 접근: TanStack Query). 쿼리 키는 기능 폴더별로 정의한다

import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2 },
    // 쓰기 재시도는 기능별로 켠다. 같은 UUIDv7과 upsert(ignoreDuplicates)로 재시도해야 중복이 생기지 않는다 (CLAUDE.md 규칙 5)
    mutations: { retry: 0 },
  },
});

// 앱이 다시 앞으로 오면 오래된 쿼리를 다시 불러온다 (RN에는 브라우저 focus 이벤트가 없음)
focusManager.setEventListener((setFocused) => {
  if (Platform.OS === 'web') return undefined;
  const subscription = AppState.addEventListener('change', (state) =>
    setFocused(state === 'active'),
  );
  return () => subscription.remove();
});
