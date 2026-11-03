import { Tabs } from 'expo-router';

import { colors, typography } from '@/theme';

// 탭 순서: 홈 · 기록 · 박사 · 가이드 (16-architecture 4장, 09 홈 구성)
// 탭 바는 className을 받지 않아서 토큰 값을 직접 넘긴다. icon.1(gray.400)은 대비가 낮아 쓰지 않는다
// 아이콘은 아직 없다
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarIcon: () => null,
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.gray['500'],
        tabBarLabelStyle: typography['base-s-12-2'],
      }}
    >
      <Tabs.Screen name="index" options={{ title: '홈', tabBarButtonTestID: 'tab-home' }} />
      <Tabs.Screen
        name="records/index"
        options={{ title: '기록', tabBarButtonTestID: 'tab-records' }}
      />
      <Tabs.Screen
        name="doctor/index"
        options={{ title: '박사', tabBarButtonTestID: 'tab-doctor' }}
      />
      <Tabs.Screen name="guide/index" options={{ title: '가이드', tabBarButtonTestID: 'tab-guide' }} />
    </Tabs>
  );
}
