import { Audio } from 'expo-av';
import { NativeModules } from 'react-native';

const { MusicNotification } = NativeModules;
let soundObject: Audio.Sound | null = null;
let currentTrack: any = null;

export const setupPlayer = async () => {
	await Audio.setAudioModeAsync({
		staysActiveInBackground: true,
		playsInSilentModeIOS: true,
		interruptionModeIOS: 1, // Audio.InterruptionMode.IOS_DO_NOT_MIX
		interruptionModeAndroid: 1, // Audio.InterruptionMode.ANDROID_DO_NOT_MIX
		shouldDuckAndroid: true,
		playThroughEarpieceAndroid: false,
	});
};

export const addTrack = async (track: any) => {
	if (soundObject) {
		await soundObject.unloadAsync();
		soundObject = null;
	}
	currentTrack = track;
	soundObject = new Audio.Sound();
	await soundObject.loadAsync({ uri: track.url });

	// Show notification with track info
	MusicNotification.showNotification(
		track.title || 'Unknown Title',
		track.artist || 'Unknown Artist'
	);
};

export const playTrack = async () => {
	if (soundObject) {
		await soundObject.playAsync();
		if (currentTrack) {
			MusicNotification.showNotification(
				currentTrack.title || 'Unknown Title',
				currentTrack.artist || 'Unknown Artist'
			);
		}
	}
};

export const pauseTrack = async () => {
	if (soundObject) {
		await soundObject.pauseAsync();
		if (currentTrack) {
			MusicNotification.showNotification(
				currentTrack.title || 'Unknown Title',
				currentTrack.artist || 'Unknown Artist'
			);
		}
	}
};

export const stopPlayer = async () => {
	if (soundObject) {
		await soundObject.stopAsync();
		await soundObject.unloadAsync();
		soundObject = null;
		currentTrack = null;
		MusicNotification.hideNotification();
	}
};
