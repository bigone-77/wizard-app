import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/use-session';
import { queryClient } from '@/lib/query-client';

// 저장된 세션을 읽을 때까지 스플래시를 유지한다 (로그인 화면이 잠깐 보였다 사라지지 않게)
SplashScreen.preventAutoHideAsync();

// 앱 실행 이동 규칙은 이 파일 한 곳에서만 정한다 (CLAUDE.md, 16-architecture 4.3)
// 1단계(T012): 세션이 없으면 S01, 있으면 홈. 프로필·개체 분기는 T022에서 더한다
export default function RootLayout() {
  const session = useSession();

  useEffect(() => {
    if (session.status === 'ready') SplashScreen.hideAsync();
  }, [session.status]);

  if (session.status === 'loading') return null;
  const signedIn = session.session !== null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)/login" />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}
