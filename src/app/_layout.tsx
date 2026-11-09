import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/use-session';
import { ProfileLoadError } from '@/features/profile/profile-load-error';
import { useProfile } from '@/features/profile/use-profile';
import { queryClient } from '@/lib/query-client';

// 저장된 세션과 프로필을 읽을 때까지 스플래시를 유지한다 (다른 화면이 잠깐 보였다 사라지지 않게)
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}

// 앱 실행 이동 규칙은 이 파일 한 곳에서만 정한다 (CLAUDE.md, 16-architecture 4.3)
// 1단계(T012): 세션이 없으면 S01
// 2단계(T015): 경험 수준이 없으면 S02, 있으면 홈
// 개체 분기와 알림 진입은 T022에서 더한다
function RootNavigator() {
  const session = useSession();
  const userId = session.status === 'ready' ? session.session?.user.id : undefined;
  const profile = useProfile(userId);

  const signedIn = userId !== undefined;
  const ready = session.status === 'ready' && (!signedIn || !profile.isPending);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  if (signedIn && profile.isError) return <ProfileLoadError onRetry={() => profile.refetch()} />;

  const hasLevel = profile.data?.experienceLevel != null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* S02를 먼저 둔다: 경험 수준이 없을 때 막힌 경로로 들어오면 첫 번째 열린 화면으로 간다 */}
      <Stack.Protected guard={signedIn && !hasLevel}>
        <Stack.Screen name="(onboarding)/greeting" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && hasLevel}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      {/* S02에서 고른 뒤 가는 화면. S02가 먼저 이동하고 나서 경험 수준이 캐시에 들어가므로 로그인만 확인한다 */}
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(onboarding)/pre-adoption" />
        <Stack.Screen name="(onboarding)/register-pet" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>
    </Stack>
  );
}
