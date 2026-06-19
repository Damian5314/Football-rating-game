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
import { colors, fonts, spacing, radius, shadowSoft } from '../theme';

function TeamBadge({ logo }) {
  return (
    <View style={styles.badge}>
      {logo ? <Image source={logo} style={styles.badgeLogo} /> : null}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      setMatches(await getTodayMatches());
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

  useEffect(() => {
    if (!user) return;
    const unsub = subscribePredictions(user.uid, (list) => {
      const map = {};
      list.forEach((p) => (map[p.fixtureId] = p));
      setPredictions(map);
    });
    return unsub;
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const renderStatus = (item) => {
    const pred = predictions[item.id];
    if (item.statusType === 'inprogress') {
      return (
        <View style={[styles.pill, styles.pillLive]}>
          <View style={styles.liveDot} />
          <Text style={styles.pillLiveText}>LIVE</Text>
        </View>
      );
    }
    if (item.statusType === 'finished') {
      return (
        <View style={[styles.pill, styles.pillGray]}>
          <Text style={styles.pillGrayText}>AFGELOPEN</Text>
        </View>
      );
    }
    // notstarted
    if (pred) {
      return (
        <View style={[styles.pill, styles.pillGreen]}>
          <Text style={styles.pillGreenText}>✓ {pred.homeScore}-{pred.awayScore}</Text>
        </View>
      );
    }
    return <Text style={styles.notPredicted}>Nog niet voorspeld</Text>;
  };

  const renderItem = ({ item }) => {
    const time = new Date(item.timestamp).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const showScore = item.statusType !== 'notstarted';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('MatchDetail', { match: item })}
        style={styles.card}
        activeOpacity={0.85}
      >
        <View style={styles.row}>
          <View style={styles.teamLeft}>
            <TeamBadge logo={item.home.logo} />
            <Text style={styles.teamName} numberOfLines={1}>{item.home.name}</Text>
          </View>

          <View style={styles.center}>
            {showScore ? (
              <Text style={styles.score}>{item.homeScore} - {item.awayScore}</Text>
            ) : (
              <Text style={styles.vs}>vs</Text>
            )}
            <Text style={styles.time}>{time}</Text>
          </View>

          <View style={styles.teamRight}>
            <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>{item.away.name}</Text>
            <TeamBadge logo={item.away.logo} />
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.league}>
            <Ionicons name="football-outline" size={13} color={colors.primary} />
            <Text style={styles.leagueText} numberOfLines={1}>{item.tournamentName}</Text>
          </View>
          {renderStatus(item)}
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

  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          matches.length ? (
            <View style={styles.dateHeader}>
              <Text style={styles.vandaag}>Vandaag</Text>
              <Text style={styles.dateText}>{today}</Text>
            </View>
          ) : null
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
  listContent: { padding: spacing.lg, flexGrow: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: spacing.md },
  empty: { color: colors.muted, textAlign: 'center', fontFamily: fonts.body },
  dateHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: spacing.md },
  vandaag: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.ink },
  dateText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadowSoft,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  teamLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  badge: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.cardSoft, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  badgeLogo: { width: 26, height: 26, resizeMode: 'contain' },
  teamName: { flexShrink: 1, fontSize: 14, color: colors.ink, fontFamily: fonts.bodyBold },
  teamNameRight: { textAlign: 'right' },
  center: { alignItems: 'center', paddingHorizontal: 10, minWidth: 64 },
  score: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.ink },
  vs: { fontSize: 14, color: colors.muted, fontFamily: fonts.bodyBold },
  time: { fontSize: 12, color: colors.muted, marginTop: 2, fontFamily: fonts.body },
  meta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.bg,
  },
  league: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 },
  leagueText: { fontSize: 12, fontFamily: fonts.bodyBold, color: colors.muted },
  pill: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10, gap: 5 },
  pillLive: { backgroundColor: colors.liveSoft },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.live },
  pillLiveText: { color: colors.live, fontSize: 11, fontFamily: fonts.bodyExtra },
  pillGray: { backgroundColor: colors.bg },
  pillGrayText: { color: colors.muted, fontSize: 11, fontFamily: fonts.bodyBold },
  pillGreen: { backgroundColor: colors.cardSoft },
  pillGreenText: { color: colors.primaryDark, fontSize: 11, fontFamily: fonts.bodyExtra },
  notPredicted: { color: colors.muted, fontSize: 11, fontFamily: fonts.body, fontStyle: 'italic' },
});
