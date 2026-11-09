// 로그인 직후 프로필을 끝내 못 읽었을 때. 이동 규칙을 정할 수 없어서 다시 읽게 한다 (막다른 화면 금지)

import { Pressable, Text, View } from 'react-native';

export function ProfileLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      testID="profile-load-error"
      className="flex-1 items-center justify-center gap-4 bg-bg-1 px-6"
    >
      <Text className="text-center text-text-3 typo-base-l-16-1">
        인터넷 연결을 확인하고 다시 시도해 주세요
      </Text>
      <Pressable
        testID="profile-retry"
        className="h-touch items-center justify-center rounded-8 bg-button-primary-1 px-6"
        onPress={onRetry}
        accessibilityRole="button"
      >
        <Text className="text-text-inverse typo-base-l-16-2">다시 시도</Text>
      </Pressable>
    </View>
  );
}
