import { Text, View } from 'react-native';

// S03 입양 전 가이드 (09-screen-list). 지금은 S02에서 이어지는 경로만 있다. 내용은 T016에서 채운다
export default function PreAdoptionScreen() {
  return (
    <View testID="screen-S03" className="flex-1 justify-center bg-bg-1 px-6">
      <Text className="text-text-3 typo-title-s-22-2">입양 전 가이드</Text>
    </View>
  );
}
