import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { ListMusic, Plus } from 'lucide-react-native';
import { useThemeStore, themes } from '@/store/themeStore';
import Animated, {
	useAnimatedStyle,
	withSpring,
	withSequence,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Playlists() {
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	const playlists = [
		{ id: '1', name: 'Favorites', trackCount: 12 },
		{ id: '2', name: 'Recently Added', trackCount: 25 },
		{ id: '3', name: 'Most Played', trackCount: 18 },
	];

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<Text style={[styles.title, { color: theme.text }]}>Playlists</Text>

			<AnimatedPressable
				style={[styles.createButton, { backgroundColor: theme.primary }]}
			>
				<Plus color={theme.text} size={24} />
				<Text style={[styles.createButtonText, { color: theme.text }]}>
					Create New Playlist
				</Text>
			</AnimatedPressable>

			<FlatList
				data={playlists}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<AnimatedPressable
						style={[
							styles.playlistItem,
							{ borderBottomColor: theme.secondary },
						]}
					>
						<View
							style={[styles.playlistIcon, { backgroundColor: theme.primary }]}
						>
							<ListMusic color={theme.text} size={24} />
						</View>
						<View style={styles.playlistInfo}>
							<Text style={[styles.playlistName, { color: theme.text }]}>
								{item.name}
							</Text>
							<Text style={[styles.trackCount, { color: theme.secondary }]}>
								{item.trackCount} tracks
							</Text>
						</View>
					</AnimatedPressable>
				)}
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
	createButton: {
		flexDirection: 'row',
		alignItems: 'center',
		margin: 20,
		padding: 16,
		borderRadius: 12,
		gap: 12,
	},
	createButtonText: {
		fontSize: 16,
		fontWeight: '600',
	},
	playlistItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
	},
	playlistIcon: {
		width: 48,
		height: 48,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	playlistInfo: {
		flex: 1,
	},
	playlistName: {
		fontSize: 16,
		fontWeight: '600',
	},
	trackCount: {
		fontSize: 14,
		marginTop: 4,
	},
});
