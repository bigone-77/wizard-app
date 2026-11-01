import { StyleSheet, View } from 'react-native';

// S06 홈
export default function HomeScreen() {
  return <View testID="screen-S06" style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
