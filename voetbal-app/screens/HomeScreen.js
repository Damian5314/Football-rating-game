import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { getTodayMatches } from '../services/api';

const statusBadge = (statusType) => {
  if (statusType === 'inprogress') return { label: 'LIVE', color: '#e53935' };
  if (statusType === 'finished') return { label: 'AFGELOPEN', color: '#888' };
  return null;
};

export default function HomeScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const data = await getTodayMatches();
      setMatches(data);
    } catch (err) {
      console.error('API error:', err);
      setError('Kon wedstrijden niet laden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const renderItem = ({ item }) => {
    const time = new Date(item.timestamp).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const badge = statusBadge(item.statusType);
    const showScore = item.statusType !== 'notstarted';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('MatchDetail', { match: item })}
        style={styles.card}
      >
        <View style={styles.row}>
          <View style={styles.team}>
            {item.home.logo && (
              <Image source={item.home.logo} style={styles.logo} />
            )}
            <Text style={styles.teamName} numberOfLines={1}>
              {item.home.name}
            </Text>
          </View>

          <View style={styles.center}>
            {showScore ? (
              <Text style={styles.score}>
                {item.homeScore} - {item.awayScore}
              </Text>
            ) : (
              <Text style={styles.vs}>vs</Text>
            )}
            <Text style={styles.time}>{time}</Text>
          </View>

          <View style={[styles.team, styles.teamRight]}>
            <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>
              {item.away.name}
            </Text>
            {item.away.logo && (
              <Image source={item.away.logo} style={styles.logo} />
            )}
          </View>
        </View>

        <View style={styles.meta}>
          <Text style={styles.league}>{item.tournamentName}</Text>
          {badge && (
            <Text style={[styles.statusBadge, { color: badge.color }]}>
              {badge.label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.empty}>
              {error || 'Geen wedstrijden vandaag in de gevolgde competities.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  team: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamRight: { justifyContent: 'flex-end' },
  teamName: { flexShrink: 1, fontSize: 15 },
  logo: { width: 26, height: 26, resizeMode: 'contain' },
  center: { alignItems: 'center', paddingHorizontal: 10, minWidth: 64 },
  score: { fontSize: 18, fontWeight: 'bold' },
  vs: { fontSize: 14, color: '#aaa' },
  time: { fontSize: 12, color: 'gray', marginTop: 2 },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  league: { fontSize: 12, fontWeight: '600', color: '#444' },
  statusBadge: { fontSize: 11, fontWeight: 'bold' },
  empty: { color: 'gray', textAlign: 'center' },
});
