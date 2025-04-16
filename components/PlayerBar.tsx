import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react-native';
import Animated, {
	useAnimatedStyle,
	withSpring,
	withSequence,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { usePlayerStore } from '@/store/playerStore';

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
		showFullScreen,
	} = usePlayerStore();

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
		<Animated.View style={[styles.container, translateY]}>
			<View style={styles.progressTrack}>
				<Animated.View style={[styles.progressBar, progressStyle]} />
			</View>

			<Pressable style={styles.trackInfo} onPress={showFullScreen}>
				<Text style={styles.title} numberOfLines={1}>
					{currentTrack.title}
				</Text>
				<Text style={styles.artist} numberOfLines={1}>
					{currentTrack.artist}
				</Text>
			</Pressable>

			<View style={styles.controls}>
				<Animated.View style={scaleAnimation}>
					<Pressable onPress={previousTrack} style={styles.controlButton}>
						<SkipBack color='#fff' size={24} />
					</Pressable>
				</Animated.View>

				<Animated.View style={scaleAnimation}>
					<Pressable onPress={togglePlayback} style={styles.playButton}>
						{isPlaying ? (
							<Pause color='#fff' size={24} />
						) : (
							<Play color='#fff' size={24} />
						)}
					</Pressable>
				</Animated.View>

				<Animated.View style={scaleAnimation}>
					<Pressable onPress={nextTrack} style={styles.controlButton}>
						<SkipForward color='#fff' size={24} />
					</Pressable>
				</Animated.View>

				<Pressable onPress={handleClose} style={styles.closeButton}>
					<X color='#fff' size={20} />
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
		backgroundColor: '#222',
		padding: 12,
		flexDirection: 'row',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: '#333',
	},
	progressTrack: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 2,
		backgroundColor: '#333',
	},
	progressBar: {
		height: '100%',
		backgroundColor: '#fff',
	},
	trackInfo: {
		flex: 1,
		marginRight: 16,
	},
	title: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	artist: {
		color: '#999',
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
		backgroundColor: '#333',
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeButton: {
		width: 32,
		height: 32,
		backgroundColor: '#444',
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 8,
	},
});
