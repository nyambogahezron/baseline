import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { ListMusic, Plus } from 'lucide-react-native';

export default function PlaylistsScreen() {
  const playlists = [
    { id: '1', name: 'Favorites', trackCount: 12 },
    { id: '2', name: 'Recently Added', trackCount: 25 },
    { id: '3', name: 'Most Played', trackCount: 18 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playlists</Text>
      
      <Pressable style={styles.createButton}>
        <Plus color="#fff" size={24} />
        <Text style={styles.createButtonText}>Create New Playlist</Text>
      </Pressable>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.playlistItem}>
            <View style={styles.playlistIcon}>
              <ListMusic color="#fff" size={24} />
            </View>
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistName}>{item.name}</Text>
              <Text style={styles.trackCount}>
                {item.trackCount} tracks
              </Text>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  playlistIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackCount: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
});