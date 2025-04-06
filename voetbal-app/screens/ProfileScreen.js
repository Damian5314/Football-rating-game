import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

export default function ProfileScreen() {
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchRandomAvatar = async () => {
      try {
        const res = await fetch('https://randomuser.me/api/');
        const data = await res.json();

        const photoUrl = data.results[0].picture.large;
        const name = data.results[0].login.username;

        setAvatar(photoUrl);
        setUsername(name);
      } catch (error) {
        console.error('Fout bij ophalen avatar/username:', error);
      }
    };

    fetchRandomAvatar();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profielfoto + gebruikersnaam */}
      <View style={styles.profileImage}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#ccc" />
        )}
        <Text style={styles.username}>@{username}</Text>
      </View>

      {/* Statistische kaarten */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>70</Text>
          <Text style={styles.statLabel}>Matches Viewed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>20</Text>
          <Text style={styles.statLabel}>Correct Predictions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  profileImage: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  username: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    gap: 20,
    paddingBottom: 20,
  },
  statCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
    color: 'gray',
  },
});
