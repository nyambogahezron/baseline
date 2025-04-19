import TrackPlayer, {
	AppKilledPlaybackBehavior,
	Capability,
} from 'react-native-track-player';

export const setupPlayer = async () => {
	try {
		await TrackPlayer.setupPlayer();
		await TrackPlayer.updateOptions({
			android: {
				appKilledPlaybackBehavior:
					AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
			},
			capabilities: [
				Capability.Play,
				Capability.Pause,
				Capability.SkipToNext,
				Capability.SkipToPrevious,
				Capability.Stop,
			],
			compactCapabilities: [
				Capability.Play,
				Capability.Pause,
				Capability.SkipToNext,
				Capability.SkipToPrevious,
			],
			notificationCapabilities: [
				Capability.Play,
				Capability.Pause,
				Capability.SkipToNext,
				Capability.SkipToPrevious,
			],
		});
	} catch (error) {
		console.error('Error setting up player:', error);
	}
};

export const addTrack = async (track: any) => {
	try {
		await TrackPlayer.add({
			id: track.id,
			url: track.url,
			title: track.title,
			artist: track.artist,
			artwork: track.artwork,
		});
	} catch (error) {
		console.error('Error adding track:', error);
	}
};

export const playTrack = async () => {
	try {
		await TrackPlayer.play();
	} catch (error) {
		console.error('Error playing track:', error);
	}
};

export const pauseTrack = async () => {
	try {
		await TrackPlayer.pause();
	} catch (error) {
		console.error('Error pausing track:', error);
	}
};

export const skipToNext = async () => {
	try {
		await TrackPlayer.skipToNext();
	} catch (error) {
		console.error('Error skipping to next track:', error);
	}
};

export const skipToPrevious = async () => {
	try {
		await TrackPlayer.skipToPrevious();
	} catch (error) {
		console.error('Error skipping to previous track:', error);
	}
};

export const stopPlayer = async () => {
	try {
		await TrackPlayer.stop();
	} catch (error) {
		console.error('Error stopping player:', error);
	}
};
