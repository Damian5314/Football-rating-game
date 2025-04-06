import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendScreen from './ProfileButtons/FriendScreen';
import PredictionsScreen from './ProfileButtons/PredictionScreen';
import ViewedScreen from './ProfileButtons/ViewedScreen';

function ProfileScreenContent({ navigation }) {
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
      <View style={styles.profileImage}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#ccc" />
        )}
        <Text style={styles.username}>@{username}</Text>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Viewed')}
        >
          <Text style={styles.statNumber}>70</Text>
          <Text style={styles.statLabel}>Matches Viewed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Predictions')}
        >
          <Text style={styles.statNumber}>20</Text>
          <Text style={styles.statLabel}>Correct Predictions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Friends')}
        >
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const Stack = createNativeStackNavigator();

export default function ProfileScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreenContent}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Viewed" component={ViewedScreen} />
      <Stack.Screen name="Predictions" component={PredictionsScreen} />
      <Stack.Screen name="Friends" component={FriendScreen} />
    </Stack.Navigator>
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
