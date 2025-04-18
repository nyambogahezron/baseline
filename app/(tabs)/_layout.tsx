import { Tabs } from 'expo-router';
import { Library, ListMusic, Palette, Users } from 'lucide-react-native';
import { useThemeStore, themes } from '@/store/themeStore';

export default function TabLayout() {
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: theme.background,
					borderTopColor: theme.secondary,
					borderTopWidth: 1,
					elevation: 0,
					shadowOpacity: 0,
					height: 60,
					paddingBottom: 8,
				},
				tabBarActiveTintColor: theme.accent,
				tabBarInactiveTintColor: theme.secondary,
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: '600',
				},
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Library',
					tabBarIcon: ({ size, color }) => (
						<Library size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name='artists'
				options={{
					title: 'Artists',
					tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name='playlists'
				options={{
					title: 'Playlists',
					tabBarIcon: ({ size, color }) => (
						<ListMusic size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name='themes'
				options={{
					title: 'Themes',
					tabBarIcon: ({ size, color }) => (
						<Palette size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
