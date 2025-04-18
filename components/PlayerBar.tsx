import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, X, Music } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { usePlayerStore } from '@/store/playerStore';
import { useThemeStore, themes } from '@/store/themeStore';

export default function PlayerBar() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayback, 
    nextTrack, 
    previousTrack, 
    cleanup, 
    playbackPosition, 
    duration, 
    showFullScreen 
  } = usePlayerStore();

  const { currentTheme } = useThemeStore();
  const theme = themes[currentTheme];

  const translateY = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(currentTrack ? 0 : 100, {
          damping: 20,
          stiffness: 90,
        }),
      },
    ],
    opacity: withTiming(currentTrack ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }),
  }));

  const progressStyle = useAnimatedStyle(() => {
    const progress = (playbackPosition / duration) * 100;
    return {
      width: withTiming(`${progress}%`, {
        duration: 100,
        easing: Easing.linear,
      }),
      backgroundColor: theme.accent,
    };
  });

  const scaleAnimation = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(
          withTiming(0.95, { duration: 100 }),
          withTiming(1, { duration: 100 })
        ),
      },
    ],
  }));

  if (!currentTrack) return null;

  const handleClose = async () => {
    await cleanup();
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        translateY,
        { 
          backgroundColor: theme.background,
          borderTopColor: theme.secondary,
        }
      ]}>
      <View style={[styles.progressTrack, { backgroundColor: theme.secondary }]}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>
      
      <Pressable
        style={styles.trackInfo}
        onPress={showFullScreen}>
        {currentTrack.artwork ? (
          <Image
            source={{ uri: currentTrack.artwork }}
            style={styles.artwork}
          />
        ) : (
          <View style={[styles.artworkPlaceholder, { backgroundColor: theme.secondary }]}>
            <Music color={theme.text} size={24} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text 
            style={[styles.title, { color: theme.text }]} 
            numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text 
            style={[styles.artist, { color: theme.secondary }]} 
            numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
      </Pressable>

      <View style={styles.controls}>
        <Animated.View style={scaleAnimation}>
          <Pressable onPress={previousTrack} style={styles.controlButton}>
            <SkipBack color={theme.text} size={24} />
          </Pressable>
        </Animated.View>

        <Animated.View style={scaleAnimation}>
          <Pressable 
            onPress={togglePlayback} 
            style={[styles.playButton, { backgroundColor: theme.primary }]}>
            {isPlaying ? (
              <Pause color={theme.text} size={24} />
            ) : (
              <Play color={theme.text} size={24} />
            )}
          </Pressable>
        </Animated.View>

        <Animated.View style={scaleAnimation}>
          <Pressable onPress={nextTrack} style={styles.controlButton}>
            <SkipForward color={theme.text} size={24} />
          </Pressable>
        </Animated.View>

        <Pressable 
          onPress={handleClose} 
          style={[styles.closeButton, { backgroundColor: theme.secondary }]}>
          <X color={theme.text} size={20} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 49,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  progressBar: {
    height: '100%',
  },
  trackInfo: {
    flex: 1,
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  artworkPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});