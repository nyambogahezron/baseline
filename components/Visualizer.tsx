import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { usePlayerStore } from '@/store/playerStore';
import { useThemeStore, themes } from '@/store/themeStore';

export default function Visualizer() {
  const { isPlaying } = usePlayerStore();
  const { currentTheme } = useThemeStore();
  const theme = themes[currentTheme];

  const bars = Array(20).fill(0);

  return (
    <View style={styles.container}>
      {bars.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: theme.accent,
              height: isPlaying ? Math.random() * 50 + 10 : 5,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 2,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});