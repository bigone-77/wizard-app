// S02 전용 선택지 버튼 (T075 화면 뼈대). 질문 흐름의 하단 칩은 T038에서 따로 만든다

import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import type { GreetingChoice as Choice } from '@/features/profile/experience-level';
import { colors, iconSize } from '@/theme';

type Props = { choice: Choice; disabled: boolean; onPress: () => void };

export function GreetingChoice({ choice, disabled, onPress }: Props) {
  return (
    <Pressable
      testID={`choice-${choice.level}`}
      className="min-h-15 flex-row items-center gap-3 rounded-16 border border-stroke-contents bg-button-outline-1 px-4 py-3 active:bg-button-outline-3 disabled:opacity-50"
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={choice.label}
      accessibilityHint={choice.description}
      accessibilityState={{ disabled }}
    >
      <View className="flex-1 gap-0.5">
        <Text className="text-text-3 typo-base-l-16-2">{choice.label}</Text>
        <Text className="text-text-2 typo-base-s-12-1">{choice.description}</Text>
      </View>
      {/* SF Symbol은 iOS 전용이라 안드로이드는 fallback 글자를 그린다 */}
      <SymbolView
        name="chevron.right"
        size={iconSize.m}
        tintColor={colors.icon['2']}
        fallback={<Text className="text-icon-2 typo-base-l-16-2">›</Text>}
      />
    </Pressable>
  );
}
