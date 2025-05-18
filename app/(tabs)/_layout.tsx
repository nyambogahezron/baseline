import { TouchableOpacity, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LibraryScreen from '.';
import Playlists from './playlists';
import ArtistsScreen from './artists';
import ThemesScreen from './themes';
import { themes, useThemeStore } from '@/store/themeStore';
import { Library, ListMusic, Palette, Users } from 'lucide-react-native';
import Animated, {
	FadeInRight,
	FadeOutRight,
	LinearTransition,
} from 'react-native-reanimated';

const Tab = createMaterialTopTabNavigator();
type tabIcons = {
	[index: string]: (props: any) => JSX.Element;
};

function TopTabBar({ state, descriptors, navigation, position }: any) {
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	const icons: tabIcons = {
		Home: ({ size = 20, color = theme.text }) => (
			<Library size={size} color={color} />
		),
		Playlist: ({ size = 20, color = theme.text }) => (
			<ListMusic size={size} color={color} />
		),
		Artist: ({ size = 20, color = theme.text }) => (
			<Users size={size} color={color} />
		),
		Theme: ({ size = 20, color = theme.text }) => (
			<Palette size={size} color={color} />
		),
	};

	return (
		<Animated.View
			layout={LinearTransition.springify().damping(80).stiffness(200)}
			style={{
				flexDirection: 'row',
				backgroundColor: theme.background,
				padding: 10,
			}}
		>
			{state.routes.map((route: any, index: number) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
						? options.title
						: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: 'tabPress',
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: 'tabLongPress',
						target: route.key,
					});
				};

				return (
					<TouchableOpacity
						key={route.key}
						accessibilityRole='button'
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarButtonTestID}
						onPress={onPress}
						onLongPress={onLongPress}
						style={styles.wrapper}
						activeOpacity={1}
						// @ts-ignore
						android_ripple={{
							color: theme.text + '50',
							borderless: true,
						}}
					>
						<Animated.View
							style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
						>
							{icons[route.name]({
								size: 20,
								color: isFocused ? theme.text : theme.text + '50',
							})}
							{isFocused && (
								<Animated.Text
									style={{ color: theme.text }}
									entering={FadeInRight.springify().damping(80).stiffness(200)}
									exiting={FadeOutRight.springify().damping(80).stiffness(200)}
								>
									{label}
								</Animated.Text>
							)}
						</Animated.View>
					</TouchableOpacity>
				);
			})}
		</Animated.View>
	);
}

export default function TopTabs() {
	return (
		<Tab.Navigator tabBar={(props) => <TopTabBar {...props} />}>
			<Tab.Screen
				name='Home'
				component={LibraryScreen}
				options={{
					tabBarLabel: 'Songs',
				}}
			/>
			<Tab.Screen name='Playlist' component={Playlists} />
			<Tab.Screen name='Artist' component={ArtistsScreen} />
			<Tab.Screen name='Theme' component={ThemesScreen} />
		</Tab.Navigator>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		display: 'flex',
		flexDirection: 'row',
		padding: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		borderRadius: 15,
		marginHorizontal: 5,
		marginVertical: 5,
	},
});
