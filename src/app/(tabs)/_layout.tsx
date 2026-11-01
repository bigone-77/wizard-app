import { Tabs } from 'expo-router';

// 탭 순서: 홈 · 기록 · 박사 · 가이드 (16-architecture 4장, 09 홈 구성)
// 아이콘과 색은 디자인 토큰(T010) 이후에 넣는다
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarIcon: () => null }}>
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
