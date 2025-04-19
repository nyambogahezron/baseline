import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'midnight' | 'forest' | 'neon' | 'minimal' | 'ocean';

interface ThemeState {
	currentTheme: ThemeType;
	setTheme: (theme: ThemeType) => void;
}

const storage = {
	getItem: async (name: string) => {
		const value = await AsyncStorage.getItem(name);
		return value ? JSON.parse(value) : null;
	},
	setItem: async (name: string, value: any) => {
		await AsyncStorage.setItem(name, JSON.stringify(value));
	},
	removeItem: async (name: string) => {
		await AsyncStorage.removeItem(name);
	},
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			currentTheme: 'midnight',
			setTheme: (theme) => set({ currentTheme: theme }),
		}),
		{
			name: 'theme-storage',
			storage,
		}
	)
);

export const themes = {
	midnight: {
		primary: '#6C63FF',
		secondary: '#2D3748',
		background: '#0A0F1C',
		text: '#FFFFFF',
		accent: '#9F7AEA',
		backgroundImage:
			'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986',
	},
	forest: {
		primary: '#48BB78',
		secondary: '#2F855A',
		background: '#1A2F1C',
		text: '#FFFFFF',
		accent: '#9AE6B4',
		backgroundImage:
			'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
	},
	neon: {
		primary: '#FF0080',
		secondary: '#7928CA',
		background: '#0F0F13',
		text: '#FFFFFF',
		accent: '#00F5D4',
		backgroundImage:
			'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
	},
	minimal: {
		primary: '#000000',
		secondary: '#666666',
		background: '#FFFFFF',
		text: '#000000',
		accent: '#333333',
		backgroundImage:
			'https://images.unsplash.com/photo-1507808973436-a4ed7b5e87c9',
	},
	ocean: {
		primary: '#0BC5EA',
		secondary: '#00A3C4',
		background: '#04202F',
		text: '#FFFFFF',
		accent: '#81E6D9',
		backgroundImage:
			'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
	},
};
