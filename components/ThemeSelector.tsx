import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStore, ThemeType, themes } from '@/store/themeStore';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming 
} from 'react-native-reanimated';

const themeNames: { [key in ThemeType]: string } = {
  midnight: 'Midnight Galaxy',
  forest: 'Forest Serenity',
  neon: 'Neon Pulse',
  minimal: 'Minimal Light',
  ocean: 'Ocean Waves',
};

export default function ThemeSelector() {
  const { currentTheme, setTheme } = useThemeStore();

  const handleThemeChange = (theme: ThemeType) => {
    setTheme(theme);
  };

  return (
    <View style={styles.container}>
      {(Object.keys(themes) as ThemeType[]).map((theme) => (
        <Pressable
          key={theme}
          onPress={() => handleThemeChange(theme)}
          style={[
            styles.themeButton,
            {
              backgroundColor: themes[theme].primary,
              borderColor: currentTheme === theme ? themes[theme].accent : 'transparent',
            },
          ]}>
          <Text style={[
            styles.themeText,
            { color: currentTheme === theme ? themes[theme].accent : themes[theme].text }
          ]}>
            {themeNames[theme]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    justifyContent: 'center',
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});