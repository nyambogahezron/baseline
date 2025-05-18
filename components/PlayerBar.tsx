import {
	View,
	Text,
	StyleSheet,
	Pressable,
	Image,
	Dimensions,
} from 'react-native';
import {
	Play,
	Pause,
	SkipBack,
	SkipForward,
	X,
	Music,
} from 'lucide-react-native';
import Animated, {
	useAnimatedStyle,
	withSpring,
	withSequence,
	withTiming,
	Easing,
	useSharedValue,
	runOnJS,
	withRepeat,
	withDelay,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { usePlayerStore } from '@/store/playerStore';
import { useThemeStore, themes } from '@/store/themeStore';
import React from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

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

	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	const contentTranslateX = useSharedValue(0);
	const barTranslateY = useSharedValue(0);
	const titleOffset = useSharedValue(0);
	const titleWidth = useSharedValue(0);
	const containerWidth = useSharedValue(0);

	const ctx = {
		startX: 0,
		startY: 0,
	};

	const panGesture = Gesture.Pan()
		.onStart(() => {
			ctx.startX = contentTranslateX.value;
			ctx.startY = barTranslateY.value;
		})
		.onUpdate((event) => {
			barTranslateY.value = ctx.startY + event.translationY;
		})
		.onEnd((event) => {
			if (
				Math.abs(event.velocityY) > SWIPE_VELOCITY_THRESHOLD ||
				Math.abs(barTranslateY.value) > SWIPE_THRESHOLD
			) {
				if (barTranslateY.value < 0) {
					runOnJS(showFullScreen)();
				}
				barTranslateY.value = withSpring(0, {
					damping: 20,
					stiffness: 200,
				});
			} else {
				barTranslateY.value = withSpring(0, {
					damping: 20,
					stiffness: 200,
				});
			}
		});

	const contentStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: contentTranslateX.value }],
	}));

	const barStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: barTranslateY.value },
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

	React.useEffect(() => {
		if (currentTrack?.title && titleWidth.value > containerWidth.value) {
			titleOffset.value = 0;
			titleOffset.value = withRepeat(
				withSequence(
					withDelay(1000, withTiming(-titleWidth.value, { duration: 5000 })),
					withTiming(containerWidth.value, { duration: 0 }),
					withTiming(-titleWidth.value, { duration: 5000 }),
					withTiming(containerWidth.value, { duration: 0 })
				),
				-1,
				false
			);
		} else {
			titleOffset.value = 0;
		}
	}, [currentTrack?.title, titleWidth.value, containerWidth.value]);

	const titleStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: titleOffset.value }],
	}));

	if (!currentTrack) return null;

	const handleClose = async () => {
		await cleanup();
	};

	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View
				style={[
					styles.container,

					barStyle,
					{
						backgroundColor: theme.background,
						borderTopColor: theme.secondary,
					},
				]}
			>
				<View
					style={[styles.progressTrack, { backgroundColor: theme.secondary }]}
				>
					<Animated.View style={[styles.progressBar, progressStyle]} />
				</View>

				<Animated.View style={[styles.content, contentStyle]}>
					<Pressable style={styles.trackInfo} onPress={showFullScreen}>
						{currentTrack.artwork ? (
							<Image
								source={{ uri: currentTrack.artwork }}
								style={styles.artwork}
							/>
						) : (
							<View
								style={[
									styles.artworkPlaceholder,
									{ backgroundColor: theme.secondary },
								]}
							>
								<Music color={theme.text} size={24} />
							</View>
						)}
						<View
							style={styles.textContainer}
							onLayout={(event) => {
								containerWidth.value = event.nativeEvent.layout.width;
							}}
						>
							<Animated.Text
								style={[styles.title, { color: theme.text }, titleStyle]}
								numberOfLines={1}
								onLayout={(event) => {
									titleWidth.value = event.nativeEvent.layout.width;
								}}
							>
								{currentTrack.title}
							</Animated.Text>
							<Text
								style={[styles.artist, { color: theme.secondary }]}
								numberOfLines={1}
							>
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
								style={[styles.playButton, { backgroundColor: theme.primary }]}
							>
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
							style={[styles.closeButton, { backgroundColor: theme.secondary }]}
						>
							<X color={theme.text} size={20} />
						</Pressable>
					</View>
				</Animated.View>
			</Animated.View>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 12,
		flexDirection: 'row',
		alignItems: 'center',
		borderTopWidth: 1,
		width: SCREEN_WIDTH,
	},
	progressTrack: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 2,
		width: SCREEN_WIDTH,
	},
	progressBar: {
		height: '100%',
	},
	content: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	trackInfo: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 16,
		overflow: 'hidden',
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
		overflow: 'hidden',
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
