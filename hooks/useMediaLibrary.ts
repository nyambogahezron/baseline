import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';

export function useMediaLibrary() {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMediaLibrary() {
      try {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (!permission.granted) {
          setError('Permission to access media library was denied');
          setLoading(false);
          return;
        }

        const media = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 1000,
        });

        setAssets(media.assets);
        setLoading(false);
      } catch (err) {
        setError('Error loading media library');
        setLoading(false);
      }
    }

    loadMediaLibrary();
  }, []);

  return { assets, loading, error };
}