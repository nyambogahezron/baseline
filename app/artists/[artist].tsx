import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	Image,
} from 'react-native';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { usePlayerStore } from '@/store/playerStore';
import { useThemeStore, themes } from '@/store/themeStore';
import { Music, Shuffle, Play } from 'lucide-react-native';
import Animated, {
	useAnimatedStyle,
	withSpring,
	withTiming,
	withDelay,
	Easing,
} from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TrackItemProps {
	item: any;
	index: number;
	onPress: (item: any) => void;
	theme: any;
}

const TrackItem = ({ item, index, onPress, theme }: TrackItemProps) => {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: withDelay(
						index * 50,
						withSpring(0, {
							damping: 12,
							stiffness: 100,
						})
					),
				},
				{
					scale: withDelay(
						index * 50,
						withSpring(1, {
							damping: 12,
							stiffness: 100,
						})
					),
				},
			],
			opacity: withDelay(
				index * 50,
				withTiming(1, {
					duration: 300,
					easing: Easing.bezier(0.4, 0, 0.2, 1),
				})
			),
		};
	});

	return (
		<AnimatedPressable
			style={[
				styles.trackItem,
				{ borderBottomColor: theme.secondary },
				animatedStyle,
			]}
			onPress={() => onPress(item)}
		>
			<View style={[styles.trackIcon, { backgroundColor: theme.primary }]}>
				{item.artwork ? (
					<Image source={{ uri: item.artwork }} style={styles.artwork} />
				) : (
					<Music color={theme.text} size={24} />
				)}
			</View>
			<View style={styles.trackInfo}>
				<Text
					style={[styles.trackTitle, { color: theme.text }]}
					numberOfLines={1}
				>
					{item.filename}
				</Text>
				<Text style={[styles.trackAlbum, { color: theme.secondary }]}>
					{item.album}
				</Text>
			</View>
		</AnimatedPressable>
	);
};

export default function ArtistScreen() {
	const { name } = useLocalSearchParams();
	const { assets, loading, error } = useMediaLibrary();
	const { setCurrentTrack, addToQueue, clearQueue } = usePlayerStore();
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	const artistTracks = React.useMemo(() => {
		return assets?.filter((asset) => asset.artist === name) || [];
	}, [assets, name]);

	const handleTrackPress = async (track: any) => {
		const trackData = {
			id: track.id,
			title: track.filename,
			artist: track.artist,
			album: track.album,
			duration: track.duration * 1000,
			uri: track.uri,
			artwork: track.artwork,
		};
		await setCurrentTrack(trackData);
	};

	const handleShufflePlay = async () => {
		clearQueue();
		const shuffledTracks = [...artistTracks].sort(() => Math.random() - 0.5);

		for (const track of shuffledTracks) {
			const trackData = {
				id: track.id,
				title: track.filename,
				artist: track.artist,
				album: track.album,
				duration: track.duration * 1000,
				uri: track.uri,
				artwork: track.artwork,
			};
			addToQueue(trackData);
		}

		if (shuffledTracks.length > 0) {
			await setCurrentTrack({
				id: shuffledTracks[0].id,
				title: shuffledTracks[0].filename,
				artist: shuffledTracks[0].artist,
				album: shuffledTracks[0].album,
				duration: shuffledTracks[0].duration * 1000,
				uri: shuffledTracks[0].uri,
				artwork: shuffledTracks[0].artwork,
			});
		}
	};

	const handlePlayAll = async () => {
		clearQueue();
		for (const track of artistTracks) {
			const trackData = {
				id: track.id,
				title: track.filename,
				artist: track.artist,
				album: track.album,
				duration: track.duration * 1000,
				uri: track.uri,
				artwork: track.artwork,
			};
			addToQueue(trackData);
		}

		if (artistTracks.length > 0) {
			await setCurrentTrack({
				id: artistTracks[0].id,
				title: artistTracks[0].filename,
				artist: artistTracks[0].artist,
				album: artistTracks[0].album,
				duration: artistTracks[0].duration * 1000,
				uri: artistTracks[0].uri,
				artwork: artistTracks[0].artwork,
			});
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<Text style={[styles.loadingText, { color: theme.text }]}>
					Loading tracks...
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

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={styles.header}>
				<Text style={[styles.artistName, { color: theme.text }]}>{name}</Text>
				<Text style={[styles.trackCount, { color: theme.secondary }]}>
					{artistTracks.length} {artistTracks.length === 1 ? 'track' : 'tracks'}
				</Text>
			</View>

			<View style={styles.controls}>
				<Pressable
					style={[styles.controlButton, { backgroundColor: theme.primary }]}
					onPress={handleShufflePlay}
				>
					<Shuffle color={theme.text} size={24} />
					<Text style={[styles.controlText, { color: theme.text }]}>
						Shuffle
					</Text>
				</Pressable>

				<Pressable
					style={[styles.controlButton, { backgroundColor: theme.primary }]}
					onPress={handlePlayAll}
				>
					<Play color={theme.text} size={24} />
					<Text style={[styles.controlText, { color: theme.text }]}>
						Play All
					</Text>
				</Pressable>
			</View>

			<FlatList
				data={artistTracks}
				keyExtractor={(item) => item.id}
				renderItem={({ item, index }) => (
					<TrackItem
						item={item}
						index={index}
						onPress={handleTrackPress}
						theme={theme}
					/>
				)}
				contentContainerStyle={styles.listContent}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
	},
	header: {
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	artistName: {
		fontSize: 34,
		fontWeight: 'bold',
	},
	trackCount: {
		fontSize: 16,
		marginTop: 4,
	},
	controls: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		marginBottom: 20,
		gap: 12,
	},
	controlButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 12,
		borderRadius: 8,
		gap: 8,
	},
	controlText: {
		fontSize: 16,
		fontWeight: '600',
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
	listContent: {
		paddingHorizontal: 20,
	},
	trackItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
		transform: [{ translateY: 50 }, { scale: 0.8 }],
		opacity: 0,
	},
	trackIcon: {
		width: 48,
		height: 48,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		overflow: 'hidden',
	},
	artwork: {
		width: '100%',
		height: '100%',
	},
	trackInfo: {
		flex: 1,
	},
	trackTitle: {
		fontSize: 16,
		fontWeight: '600',
	},
	trackAlbum: {
		fontSize: 14,
		marginTop: 4,
	},
});
