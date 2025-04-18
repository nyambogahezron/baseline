import { View, Text, StyleSheet, Dimensions, Pressable, Image } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Music, ChevronDown } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { usePlayerStore } from '@/store/playerStore';
import { useThemeStore, themes } from '@/store/themeStore';
import { useCallback, useEffect } from 'react';
import Visualizer from './Visualizer';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

export default function FullScreenPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlayback,
    nextTrack,
    previousTrack,
    playbackPosition,
    duration,
    seekTo,
    isFullScreenVisible,
    hideFullScreen,
  } = usePlayerStore();

  const { currentTheme } = useThemeStore();
  const theme = themes[currentTheme];

  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isFullScreenVisible) {
      translateY.value = withSpring(MAX_TRANSLATE_Y, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [isFullScreenVisible]);

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 20000,
          easing: Easing.linear,
        }),
        -1
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
          withTiming(1, {
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          })
        ),
        -1,
        true
      );
    } else {
      rotation.value = withTiming(rotation.value, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      scale.value = withSpring(1);
    }
  }, [isPlaying]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(
        Math.min(event.translationY + context.value.y, 0),
        MAX_TRANSLATE_Y
      );
    })
    .onEnd(() => {
      const shouldSnap = Math.abs(translateY.value) > SCREEN_HEIGHT * 0.3;
      if (shouldSnap) {
        translateY.value = withSpring(MAX_TRANSLATE_Y, {
          damping: 20,
          stiffness: 90,
        });
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
        runOnJS(hideFullScreen)();
      }
    });

  const seekGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newPosition = (event.x / SCREEN_WIDTH) * duration;
      runOnJS(seekTo)(Math.max(0, Math.min(newPosition, duration)));
    });

  const rStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, 0],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, 0],
      [0, 25],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateY: translateY.value },
        { scale },
      ],
      borderRadius,
    };
  });

  const artworkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => {
    const progress = (playbackPosition / duration) * 100;
    return {
      width: `${progress}%`,
      backgroundColor: theme.accent,
    };
  });

  if (!currentTrack) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View 
        style={[
          styles.container, 
          rStyle,
          { backgroundColor: theme.background }
        ]}>
        <View style={styles.header}>
          <Pressable onPress={hideFullScreen}>
            <ChevronDown color={theme.text} size={24} />
          </Pressable>
        </View>
        
        <View style={styles.content}>
          <Animated.View style={[styles.artwork, artworkStyle]}>
            {currentTrack.artwork ? (
              <Image
                source={{ uri: currentTrack.artwork }}
                style={styles.artworkImage}
              />
            ) : (
              <Music color={theme.text} size={80} />
            )}
          </Animated.View>

          <View style={styles.trackInfo}>
            <Text style={[styles.title, { color: theme.text }]}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.artist, { color: theme.secondary }]}>
              {currentTrack.artist}
            </Text>
          </View>

          <Visualizer />

          <GestureDetector gesture={seekGesture}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: theme.secondary }]}>
                <Animated.View style={[styles.progressBar, progressStyle]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressText, { color: theme.secondary }]}>
                  {formatTime(playbackPosition)}
                </Text>
                <Text style={[styles.progressText, { color: theme.secondary }]}>
                  {formatTime(duration)}
                </Text>
              </View>
            </View>
          </GestureDetector>

          <View style={styles.controls}>
            <Pressable onPress={previousTrack} style={styles.controlButton}>
              <SkipBack color={theme.text} size={32} />
            </Pressable>
            <Pressable 
              onPress={togglePlayback} 
              style={[styles.playButton, { backgroundColor: theme.primary }]}>
              {isPlaying ? (
                <Pause color={theme.text} size={32} />
              ) : (
                <Play color={theme.text} size={32} />
              )}
            </Pressable>
            <Pressable onPress={nextTrack} style={styles.controlButton}>
              <SkipForward color={theme.text} size={32} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SCREEN_HEIGHT,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    zIndex: 999,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  artwork: {
    width: 280,
    height: 280,
    backgroundColor: '#333',
    borderRadius: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});