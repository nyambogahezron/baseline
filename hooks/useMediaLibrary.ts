import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { usePlayerStore } from '@/store/playerStore';

export function useMediaLibrary() {
	const [assets, setAssets] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { cleanup } = usePlayerStore();
	// console.log('assets', assets);

	const loadMedia = async () => {
		try {
			const { status } = await MediaLibrary.requestPermissionsAsync();
			if (status !== 'granted') {
				setError('Permission to access media library was denied');
				return;
			}

			// First get the total count of audio files
			const { totalCount } = await MediaLibrary.getAssetsAsync({
				mediaType: MediaLibrary.MediaType.audio,
				first: 1,
			});

			// Then fetch all assets in batches
			const batchSize = 100;
			let allAssets: MediaLibrary.Asset[] = [];
			let hasNextPage = true;
			let endCursor: string | undefined;

			while (hasNextPage) {
				const result = await MediaLibrary.getAssetsAsync({
					mediaType: MediaLibrary.MediaType.audio,
					sortBy: MediaLibrary.SortBy.creationTime,
					first: batchSize,
					after: endCursor,
				});

				allAssets = [...allAssets, ...result.assets];
				hasNextPage = result.hasNextPage;
				endCursor = result.endCursor;

				if (!hasNextPage || allAssets.length >= totalCount) {
					break;
				}
			}

			const assetsWithMetadata = await Promise.all(
				allAssets.map(async (asset) => {
					try {
						// Get metadata from the file
						const metadata = await MediaLibrary.getAssetInfoAsync(asset.id, {
							shouldDownloadFromNetwork: true,
						});

						// Get artwork if available
						let artwork = null;
						if (metadata.localUri) {
							const artworkPath = `${FileSystem.cacheDirectory}artwork_${asset.id}.jpg`;
							try {
								await FileSystem.copyAsync({
									from: metadata.localUri,
									to: artworkPath,
								});
								artwork = artworkPath;
							} catch (e) {
								console.warn('Could not extract artwork:', e);
							}
						}

						// Extract metadata from the asset
						const title = asset.filename.replace(/\.[^/.]+$/, ''); // Remove file extension
						const artist = (metadata as any).artist || 'Unknown Artist';
						const album = (metadata as any).album || 'Unknown Album';

						return {
							...asset,
							title,
							artist,
							album,
							artwork,
							duration: metadata.duration || 0,
						};
					} catch (e) {
						console.warn('Error getting metadata for asset:', e);
						return {
							...asset,
							title: asset.filename.replace(/\.[^/.]+$/, ''),
							artist: 'Unknown Artist',
							album: 'Unknown Album',
							duration: 0,
						};
					}
				})
			);

			setAssets(assetsWithMetadata);
		} catch (e) {
			setError('Failed to load media library');
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadMedia();
	}, []);

	const refresh = async () => {
		setLoading(true);
		await loadMedia();
	};

	const handleTrackPress = async (asset: any) => {
		// Clean up current track before playing new one
		await cleanup();

		const track = {
			id: asset.id,
			title: asset.title,
			artist: asset.artist,
			album: asset.album,
			duration: asset.duration * 1000,
			uri: asset.uri,
			artwork: asset.artwork,
		};

		return track;
	};

	return { assets, loading, error, refresh, handleTrackPress };
}
