// S02 박사 인사 (09-screen-list). 배치는 T075 화면 뼈대, 문구는 05 ①
// 고르면 경험 수준을 저장하고 S03 또는 S04로 간다. 이동이 먼저, 캐시 갱신이 나중 (_layout.tsx 이동 규칙 참고)

import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GreetingChoice } from '@/features/onboarding/greeting-choice';
import {
  GREETING_CHOICES,
  type GreetingChoice as Choice,
} from '@/features/profile/experience-level';
import { setSavedExperienceLevel, useSaveExperienceLevel } from '@/features/profile/use-profile';
import { colors, iconSize } from '@/theme';

const SAVE_FAILED = '저장하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요';

export default function GreetingScreen() {
  // 위아래 여백은 기기의 상태 바·홈 표시줄 높이라서 토큰이 아니라 안전 영역 값을 쓴다
  const insets = useSafeAreaInsets();
  const save = useSaveExperienceLevel();
  // 상태(isPending)는 다음 렌더에야 바뀌어서, 빠르게 두 번 누르면 둘 다 통과한다. ref로 바로 막는다
  const inFlight = useRef(false);

  const choose = async (choice: Choice) => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const { userId } = await save.mutateAsync(choice.level);
      router.replace(choice.next);
      setSavedExperienceLevel(userId, choice.level);
    } catch {
      // 안내는 save.isError로 보여준다. 다시 누르면 새로 저장한다
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <View
      testID="screen-S02"
      className="flex-1 bg-bg-1 px-5"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 gap-4 pt-10">
        <View className="size-15 items-center justify-center rounded-1000 bg-primary-50">
          {/* SF Symbol은 iOS 전용이라 안드로이드는 fallback 글자를 그린다 */}
          <SymbolView
            name="face.smiling"
            size={iconSize.xl}
            tintColor={colors.icon.primary}
            fallback={<Text className="text-icon-primary typo-title-s-22-2">☺</Text>}
          />
        </View>
        <View className="gap-2">
          <Text className="text-text-primary typo-base-m-14-2">도마뱀 박사</Text>
          <Text accessibilityRole="header" className="text-text-3 typo-title-m-26-2">
            {'반가워! 나는 너랑 도마뱀을 도와줄 박사야.\n혹시 지금 어떤 상황이야?'}
          </Text>
        </View>
      </View>
      <View className="gap-3">
        {GREETING_CHOICES.map((choice) => (
          <GreetingChoice
            key={choice.level}
            choice={choice}
            disabled={save.isPending}
            onPress={() => void choose(choice)}
          />
        ))}
        {save.isError ? (
          <Text className="text-danger-text typo-base-m-14-1">{SAVE_FAILED}</Text>
        ) : null}
      </View>
    </View>
  );
}
