import { View, StyleSheet } from 'react-native';
import ThemeSelector from '@/components/ThemeSelector';
import { useThemeStore, themes } from '@/store/themeStore';

export default function ThemesScreen() {
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<ThemeSelector />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 2,
	},
});
