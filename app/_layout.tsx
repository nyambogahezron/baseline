import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import PlayerBar from '@/components/PlayerBar';
import FullScreenPlayer from '@/components/FullScreenPlayer';

export default function RootLayout() {
	useFrameworkReady();

	return (
		<GestureHandlerRootView style={styles.container}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
				<Stack.Screen name='+not-found' options={{ presentation: 'modal' }} />
			</Stack>
			<PlayerBar />
			<FullScreenPlayer />
			<StatusBar style='light' />
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
});
