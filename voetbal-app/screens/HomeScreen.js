import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { getTodayMatches } from '../services/api';

const allowedLeagueIds = [2, 39, 78, 140]; // Champions League, Premier League, Bundesliga, La Liga

export default function HomeScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getTodayMatches();
        const filtered = data.filter(item => allowedLeagueIds.includes(item.league.id));
        setMatches(filtered);
      } catch (err) {
        console.error('API error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const renderItem = ({ item }) => {
    const { home, away } = item.teams;
    const time = item.fixture.date.split('T')[1].slice(0, 5);
    const league = item.league.name;
  
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('MatchDetail', { match: item })}
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: '#ccc',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={{ uri: home.logo }} style={{ width: 24, height: 24 }} />
            <Text>{home.name}</Text>
          </View>
          <Text>vs</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text>{away.name}</Text>
            <Image source={{ uri: away.logo }} style={{ width: 24, height: 24 }} />
          </View>
        </View>
  
        <Text style={{ color: 'gray' }}>{time}</Text>
        <Text style={{ fontWeight: 'bold' }}>{league}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.fixture.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
