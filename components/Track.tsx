import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { themes, useThemeStore } from '@/store/themeStore';
import { Music } from 'lucide-react-native';
import Animated from 'react-native-reanimated';

interface props {
	handleTrackPress: any;
	item: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Track({ handleTrackPress, item }: props) {
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];
	return (
		<AnimatedPressable
			style={[styles.trackItem, { borderBottomColor: theme.secondary }]}
			onPress={() => handleTrackPress(item)}
		>
			<View style={[styles.trackIcon, { backgroundColor: theme.primary }]}>
				<Music color={theme.text} size={24} />
			</View>
			<View style={styles.trackInfo}>
				<Text
					style={[styles.trackTitle, { color: theme.text }]}
					numberOfLines={1}
				>
					{item.filename}
				</Text>
				<Text style={[styles.trackArtist, { color: theme.secondary }]}>
					Unknown Artist
				</Text>
			</View>
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create({
	trackItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
	},
	trackIcon: {
		width: 48,
		height: 48,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
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
});
