import { Pressable, Text, View } from 'react-native';

import { getEnv } from '@/lib/env';
import { supabase } from '@/lib/supabase';

// S06 홈
export default function HomeScreen() {
  // 개발용 로그아웃: 이메일 로그인과 같은 스위치라 alpha에서는 자동으로 사라진다. 정식 로그아웃은 S13(T061)
  const { enableEmailLogin } = getEnv();

  return (
    <View testID="screen-S06" className="flex-1 bg-bg-1">
      {enableEmailLogin ? (
        <Pressable
          testID="dev-sign-out"
          className="absolute bottom-4 right-4 h-touch justify-center px-3"
          onPress={() => supabase.auth.signOut()}
          accessibilityRole="button"
        >
          <Text className="text-text-1 typo-base-s-12-1">로그아웃 (개발용)</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
