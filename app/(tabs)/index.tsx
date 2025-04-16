import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { usePlayerStore } from '@/store/playerStore';
import { Music } from 'lucide-react-native';

export default function LibraryScreen() {
  const { assets, loading, error } = useMediaLibrary();
  const { setCurrentTrack, addToQueue } = usePlayerStore();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your library...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handleTrackPress = async (asset: any) => {
    const track = {
      id: asset.id,
      title: asset.filename,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: asset.duration * 1000,
      uri: asset.uri,
    };

    await setCurrentTrack(track);
    addToQueue(track);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Library</Text>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.trackItem}
            onPress={() => handleTrackPress(item)}>
            <View style={styles.trackIcon}>
              <Music color="#fff" size={24} />
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {item.filename}
              </Text>
              <Text style={styles.trackArtist}>Unknown Artist</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  trackIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
});