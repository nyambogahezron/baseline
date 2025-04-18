import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	Image,
	Modal,
	Alert,
} from 'react-native';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { usePlayerStore } from '@/store/playerStore';
import { useThemeStore, themes } from '@/store/themeStore';
import { Music, Play, MoreVertical, Trash2, X } from 'lucide-react-native';
import Animated, {
	useAnimatedStyle,
	withSpring,
	withTiming,
	withDelay,
	Easing,
} from 'react-native-reanimated';
import * as MediaLibrary from 'expo-media-library';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TrackItemProps {
	item: any;
	index: number;
	onPress: (item: any) => void;
	theme: any;
	onDelete: (item: any) => void;
}

const TrackItem = ({
	item,
	index,
	onPress,
	theme,
	onDelete,
}: TrackItemProps) => {
	const { currentTrack } = usePlayerStore();
	const isCurrentTrack = currentTrack?.id === item.id;
	const [showMenu, setShowMenu] = React.useState(false);

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

	const handleDelete = async () => {
		Alert.alert('Delete Song', 'Are you sure you want to delete this song?', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						await MediaLibrary.deleteAssetsAsync([item.id]);
						onDelete(item);
					} catch (error) {
						Alert.alert('Error', 'Failed to delete the song');
					}
				},
			},
		]);
	};

	return (
		<>
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
					) : isCurrentTrack ? (
						<Play color={theme.text} size={24} />
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
					<Text style={[styles.trackArtist, { color: theme.secondary }]}>
						{item.artist}
					</Text>
				</View>
				<Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
					<MoreVertical color={theme.text} size={20} />
				</Pressable>
			</AnimatedPressable>

			<Modal
				visible={showMenu}
				transparent
				animationType='slide'
				onRequestClose={() => setShowMenu(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setShowMenu(false)}
				>
					<View
						style={[styles.bottomSheet, { backgroundColor: theme.background }]}
					>
						<View style={styles.bottomSheetHeader}>
							<Text style={[styles.bottomSheetTitle, { color: theme.text }]}>
								Track Info
							</Text>
							<Pressable onPress={() => setShowMenu(false)}>
								<X color={theme.text} size={24} />
							</Pressable>
						</View>

						<View style={styles.trackInfoContainer}>
							{item.artwork && (
								<Image
									source={{ uri: item.artwork }}
									style={styles.largeArtwork}
								/>
							)}
							<Text style={[styles.infoTitle, { color: theme.text }]}>
								{item.filename}
							</Text>
							<Text style={[styles.infoArtist, { color: theme.secondary }]}>
								{item.artist}
							</Text>
							{item.album && (
								<Text style={[styles.infoAlbum, { color: theme.secondary }]}>
									Album: {item.album}
								</Text>
							)}
							{item.duration && (
								<Text style={[styles.infoDuration, { color: theme.secondary }]}>
									Duration: {Math.floor(item.duration / 1000)}s
								</Text>
							)}
						</View>

						<Pressable
							style={[
								styles.deleteButton,
								{ backgroundColor: theme.secondary },
							]}
							onPress={handleDelete}
						>
							<Trash2 color='#ff4444' size={20} />
							<Text style={styles.deleteButtonText}>Delete Song</Text>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		</>
	);
};

export default function LibraryScreen() {
	const { assets, loading, error, refresh, handleTrackPress } =
		useMediaLibrary();
	const { setCurrentTrack, addToQueue } = usePlayerStore();
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	if (loading) {
		return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<Text style={[styles.loadingText, { color: theme.text }]}>
					Loading your library...
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

	const onTrackPress = async (asset: any) => {
		const track = await handleTrackPress(asset);
		await setCurrentTrack(track);
		addToQueue(track);
	};

	const handleDelete = (item: any) => {
		refresh();
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<Text style={[styles.title, { color: theme.text }]}>Your Library</Text>
			<FlatList
				data={assets}
				keyExtractor={(item) => item.id}
				renderItem={({ item, index }) => (
					<TrackItem
						item={item}
						index={index}
						onPress={onTrackPress}
						theme={theme}
						onDelete={handleDelete}
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
	trackArtist: {
		fontSize: 14,
		marginTop: 4,
	},
	menuButton: {
		padding: 8,
		marginLeft: 8,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	bottomSheet: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
	},
	bottomSheetHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	bottomSheetTitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	trackInfoContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	largeArtwork: {
		width: 120,
		height: 120,
		borderRadius: 10,
		marginBottom: 16,
	},
	infoTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 8,
		textAlign: 'center',
	},
	infoArtist: {
		fontSize: 16,
		marginBottom: 4,
	},
	infoAlbum: {
		fontSize: 14,
		marginBottom: 4,
	},
	infoDuration: {
		fontSize: 14,
	},
	deleteButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
		borderRadius: 10,
		marginTop: 20,
	},
	deleteButtonText: {
		color: '#ff4444',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
});
