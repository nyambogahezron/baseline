import { create } from 'zustand';
import { Audio } from 'expo-av';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  artwork?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  sound: Audio.Sound | null;
  playbackPosition: number;
  duration: number;
  volume: number;
  isFullScreenVisible: boolean;
  setCurrentTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  cleanup: () => Promise<void>;
  showFullScreen: () => void;
  hideFullScreen: () => void;
}

// Configure audio session for background playback
async function configureAudio() {
  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  } catch (error) {
    console.error('Error configuring audio:', error);
  }
}

// Initialize audio configuration
configureAudio();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  sound: null,
  playbackPosition: 0,
  duration: 0,
  volume: 1,
  isFullScreenVisible: false,

  setCurrentTrack: async (track) => {
    const { sound: currentSound } = get();
    if (currentSound) {
      await currentSound.unloadAsync();
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { 
          shouldPlay: true,
          volume: get().volume,
          progressUpdateIntervalMillis: 1000,
          positionMillis: 0,
          rate: 1.0,
          shouldCorrectPitch: true,
        },
        (status) => {
          if (status.isLoaded) {
            set({
              playbackPosition: status.positionMillis,
              duration: status.durationMillis || 0,
              isPlaying: status.isPlaying,
            });
          }
        },
      );

      // Handle interruptions
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            get().nextTrack();
          }
        }
      });

      set({ currentTrack: track, sound, isPlaying: true });
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  },

  togglePlayback: async () => {
    const { sound, isPlaying } = get();
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      set({ isPlaying: !isPlaying });
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  },

  nextTrack: async () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0) return;

    const currentIndex = currentTrack
      ? queue.findIndex((track) => track.id === currentTrack.id)
      : -1;
    const nextTrack = queue[currentIndex + 1] || queue[0];
    await get().setCurrentTrack(nextTrack);
  },

  previousTrack: async () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0) return;

    const currentIndex = currentTrack
      ? queue.findIndex((track) => track.id === currentTrack.id)
      : -1;
    const previousTrack =
      queue[currentIndex - 1] || queue[queue.length - 1];
    await get().setCurrentTrack(previousTrack);
  },

  seekTo: async (position) => {
    const { sound } = get();
    if (!sound) return;

    try {
      await sound.setPositionAsync(position);
      set({ playbackPosition: position });
    } catch (error) {
      console.error('Error seeking:', error);
    }
  },

  setVolume: async (volume) => {
    const { sound } = get();
    try {
      if (sound) {
        await sound.setVolumeAsync(volume);
      }
      set({ volume });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  },

  addToQueue: (track) => {
    set((state) => ({ queue: [...state.queue, track] }));
  },

  clearQueue: () => {
    set({ queue: [] });
  },

  cleanup: async () => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error cleaning up sound:', error);
      }
    }
    set({
      sound: null,
      currentTrack: null,
      isPlaying: false,
      playbackPosition: 0,
      duration: 0,
    });
  },

  showFullScreen: () => {
    set({ isFullScreenVisible: true });
  },

  hideFullScreen: () => {
    set({ isFullScreenVisible: false });
  },
}));