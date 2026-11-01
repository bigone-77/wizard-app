import { StyleSheet, View } from 'react-native';

// S12 가이드
export default function GuideScreen() {
  return <View testID="screen-S12" style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
