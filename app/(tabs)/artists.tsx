import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	Image,
} from 'react-native';
import React from 'react';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useThemeStore, themes } from '@/store/themeStore';
import { Music } from 'lucide-react-native';
import Animated, {
	useAnimatedStyle,
	withSpring,
	withTiming,
	withDelay,
	Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ArtistItemProps {
	artist: {
		name: string;
		trackCount: number;
		artwork?: string;
	};
	index: number;
	theme: any;
}

const ArtistItem = ({ artist, index, theme }: ArtistItemProps) => {
	const router = useRouter();
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
				styles.artistItem,
				{ borderBottomColor: theme.secondary },
				animatedStyle,
			]}
			onPress={() => router.push(`/artists/${encodeURIComponent(artist.name)}`)}
		>
			<View style={[styles.artistIcon, { backgroundColor: theme.primary }]}>
				{artist.artwork ? (
					<Image source={{ uri: artist.artwork }} style={styles.artwork} />
				) : (
					<Music color={theme.text} size={24} />
				)}
			</View>
			<View style={styles.artistInfo}>
				<Text style={[styles.artistName, { color: theme.text }]}>
					{artist.name}
				</Text>
				<Text style={[styles.trackCount, { color: theme.secondary }]}>
					{artist.trackCount} {artist.trackCount === 1 ? 'track' : 'tracks'}
				</Text>
			</View>
		</AnimatedPressable>
	);
};

export default function ArtistsScreen() {
	const { assets, loading, error } = useMediaLibrary();
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	// Group tracks by artist
	const artists = React.useMemo(() => {
		const artistMap = new Map<
			string,
			{ name: string; trackCount: number; artwork?: string }
		>();

		assets?.forEach((asset) => {
			const artistName = asset.artist || 'Unknown Artist';
			const existing = artistMap.get(artistName);

			if (existing) {
				existing.trackCount++;
				if (!existing.artwork && asset.artwork) {
					existing.artwork = asset.artwork;
				}
			} else {
				artistMap.set(artistName, {
					name: artistName,
					trackCount: 1,
					artwork: asset.artwork,
				});
			}
		});

		return Array.from(artistMap.values()).sort((a, b) =>
			a.name.localeCompare(b.name)
		);
	}, [assets]);

	if (loading) {
		return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<Text style={[styles.loadingText, { color: theme.text }]}>
					Loading artists...
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
			<Text style={[styles.title, { color: theme.text }]}>Artists</Text>
			<FlatList
				data={artists}
				keyExtractor={(item) => item.name}
				renderItem={({ item, index }) => (
					<ArtistItem artist={item} index={index} theme={theme} />
				)}
				contentContainerStyle={styles.listContent}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 2,
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
	listContent: {
		paddingHorizontal: 20,
	},
	artistItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
		transform: [{ translateY: 50 }, { scale: 0.8 }],
		opacity: 0,
	},
	artistIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		overflow: 'hidden',
	},
	artwork: {
		width: '100%',
		height: '100%',
	},
	artistInfo: {
		flex: 1,
	},
	artistName: {
		fontSize: 16,
		fontWeight: '600',
	},
	trackCount: {
		fontSize: 14,
		marginTop: 4,
	},
});
