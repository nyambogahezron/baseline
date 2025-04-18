import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { usePlayerStore } from '@/store/playerStore';
import { useThemeStore, themes } from '@/store/themeStore';
import { Music } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LibraryScreen() {
  const { assets, loading, error } = useMediaLibrary();
  const { setCurrentTrack, addToQueue } = usePlayerStore();
  const { currentTheme } = useThemeStore();
  const theme = themes[currentTheme];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading your library...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handleTrackPress = async (asset: any) => {
    const track = {
      id: asset.id,
      title: asset.filename,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: asset.duration * 1000,
      uri: asset.uri,
    };

    await setCurrentTrack(track);
    addToQueue(track);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Your Library</Text>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimatedPressable
            style={[
              styles.trackItem,
              { borderBottomColor: theme.secondary },
            ]}
            onPress={() => handleTrackPress(item)}>
            <View style={[styles.trackIcon, { backgroundColor: theme.primary }]}>
              <Music color={theme.text} size={24} />
            </View>
            <View style={styles.trackInfo}>
              <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={1}>
                {item.filename}
              </Text>
              <Text style={[styles.trackArtist, { color: theme.secondary }]}>
                Unknown Artist
              </Text>
            </View>
          </AnimatedPressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 14,
    marginTop: 4,
  },
});