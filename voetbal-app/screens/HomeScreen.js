import { useEffect, useState, useCallback, useContext } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { getTodayMatches } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { subscribePredictions } from '../services/predictionService';
import { colors, spacing, radius, shadow } from '../theme';

const statusBadge = (statusType) => {
  if (statusType === 'inprogress') return { label: 'LIVE', color: colors.live };
  if (statusType === 'finished') return { label: 'AFGELOPEN', color: colors.muted };
  return null;
};

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({}); // fixtureId -> prediction
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

  // Live overzicht van eigen voorspellingen (om een badge te tonen).
  useEffect(() => {
    if (!user) return;
    const unsub = subscribePredictions(user.uid, (list) => {
      const map = {};
      list.forEach((p) => {
        map[p.fixtureId] = p;
      });
      setPredictions(map);
    });
    return unsub;
  }, [user]);

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
    const pred = predictions[item.id];

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
          <View style={styles.metaRight}>
            {pred && (
              <Text style={styles.predBadge}>
                ✓ {pred.homeScore}-{pred.awayScore}
              </Text>
            )}
            {badge && (
              <Text style={[styles.statusBadge, { color: badge.color }]}>
                {badge.label}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
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
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: spacing.md, flexGrow: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  team: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamRight: { justifyContent: 'flex-end' },
  teamName: { flexShrink: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  logo: { width: 28, height: 28, resizeMode: 'contain' },
  center: { alignItems: 'center', paddingHorizontal: 10, minWidth: 64 },
  score: { fontSize: 20, fontWeight: '800', color: colors.text },
  vs: { fontSize: 14, color: colors.muted },
  time: { fontSize: 12, color: colors.muted, marginTop: 2 },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bg,
  },
  league: { fontSize: 12, fontWeight: '700', color: colors.muted },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  predBadge: { fontSize: 11, fontWeight: '800', color: colors.primary },
  statusBadge: { fontSize: 11, fontWeight: '800' },
  empty: { color: colors.muted, textAlign: 'center' },
});
