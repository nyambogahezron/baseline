import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PlayerBar from '@/components/PlayerBar';
import FullScreenPlayer from '@/components/FullScreenPlayer';
import * as SplashScreen from 'expo-splash-screen';
import { setupPlayer } from '@/services/playerNotification';
import { themes, useThemeStore } from '@/store/themeStore';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	const [appIsReady, setAppIsReady] = React.useState(false);
	const { currentTheme } = useThemeStore();
	const theme = themes[currentTheme];

	React.useEffect(() => {
		async function prepare() {
			try {
				// Initialize TrackPlayer
				await setupPlayer();

				// Wait for other resources to load
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (e) {
				console.warn(e);
			} finally {
				setAppIsReady(true);
			}
		}

		prepare();
	}, []);

	const onLayoutRootView = React.useCallback(() => {
		if (appIsReady) {
			SplashScreen.hide();
		}
	}, [appIsReady]);

	if (!appIsReady) {
		return null;
	}

	return (
		<GestureHandlerRootView
			style={{ flex: 1, backgroundColor: '#000' }}
			onLayout={onLayoutRootView}
		>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
				<Stack.Screen name='+not-found' options={{ presentation: 'modal' }} />
			</Stack>
			<PlayerBar />
			<FullScreenPlayer />
			<StatusBar style='light' backgroundColor={theme.background} />
		</GestureHandlerRootView>
	);
}
