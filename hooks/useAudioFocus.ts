import { useEffect } from 'react';
import { Audio } from 'expo-av';
import { AppState } from 'react-native';
import { usePlayerStore } from '@/store/playerStore';

export function useAudioFocus() {
  const { isPlaying, togglePlayback } = usePlayerStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App comes to foreground
        Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    return () => {
      subscription.then((mode) => {
        Audio.setAudioModeAsync({
          ...mode,
          staysActiveInBackground: false,
        });
      });
    };
  }, []);

  return null;
}