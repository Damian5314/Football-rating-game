import { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { UserContext } from '../../context/UserContext';
import { subscribePredictions } from '../../services/predictionService';
import { scorePrediction } from '../../services/gameConfig';
import { teamLogo } from '../../services/api';
import { colors, fonts, spacing, radius, shadowSoft } from '../../theme';

function MiniBadge({ id }) {
  return (
    <View style={styles.miniBadge}>
      {id ? <Image source={teamLogo(id)} style={styles.miniLogo} /> : null}
    </View>
  );
}

export default function PredictionsScreen() {
  const { user } = useContext(AuthContext);
  const { profile } = useContext(UserContext);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribePredictions(user.uid, (list) => {
      setPredictions([...list].sort((a, b) => (b.match?.timestamp || 0) - (a.match?.timestamp || 0)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const renderItem = ({ item }) => {
    const m = item.match || {};
    const scored = item.status === 'scored' && item.actual;
    const points = scored ? item.awardedPoints ?? scorePrediction(item, item.actual) : null;

    let badge = null;
    if (scored) {
      badge =
        points > 0
          ? { text: `+${points}`, style: styles.bGreen, textStyle: styles.bGreenText }
          : { text: '+0', style: styles.bGray, textStyle: styles.bGrayText };
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.matchup}>
            <MiniBadge id={m.homeId} />
            <Text style={styles.team} numberOfLines={1}>{m.homeName}</Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={styles.team} numberOfLines={1}>{m.awayName}</Text>
            <MiniBadge id={m.awayId} />
          </View>
          {badge && (
            <View style={[styles.badge, badge.style]}>
              <Text style={badge.textStyle}>{badge.text}</Text>
            </View>
          )}
        </View>

        <View style={styles.boxes}>
          <View style={styles.box}>
            <Text style={styles.boxLabel}>Jouw</Text>
            <Text style={styles.boxScore}>{item.homeScore}-{item.awayScore}</Text>
          </View>
          <View style={[styles.box, scored && styles.boxActual]}>
            <Text style={styles.boxLabel}>{scored ? 'Uitslag' : 'Status'}</Text>
            <Text style={[styles.boxScore, !scored && styles.boxPending]}>
              {scored ? `${item.actual.homeScore}-${item.actual.awayScore}` : 'Nog te spelen'}
            </Text>
          </View>
        </View>
      </View>
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
        data={predictions}
        keyExtractor={(item) => String(item.fixtureId)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <View style={styles.pointsHeader}>
            <View style={styles.pointsStar}>
              <Text style={{ fontSize: 18 }}>⭐</Text>
            </View>
            <View>
              <Text style={styles.pointsNum}>{profile?.points ?? 0} punten</Text>
              <Text style={styles.pointsSub}>{profile?.stats?.correctPredictions ?? 0} correcte voorspellingen</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Je hebt nog geen voorspellingen gedaan.{'\n'}Ga naar Home en tik op een wedstrijd!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: colors.muted, textAlign: 'center', lineHeight: 22, fontFamily: fonts.body },

  pointsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.ink, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg,
  },
  pointsStar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  pointsNum: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.white },
  pointsSub: { fontFamily: fonts.body, fontSize: 12, color: '#A9C2B5', marginTop: 2 },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadowSoft },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  matchup: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
  miniBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.cardSoft, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  miniLogo: { width: 16, height: 16, resizeMode: 'contain' },
  team: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink, flexShrink: 1 },
  vs: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  badge: { borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 10 },
  bGreen: { backgroundColor: colors.primary },
  bGreenText: { color: colors.white, fontFamily: fonts.bodyExtra, fontSize: 12 },
  bGray: { backgroundColor: colors.bg },
  bGrayText: { color: colors.muted, fontFamily: fonts.bodyExtra, fontSize: 12 },
  boxes: { flexDirection: 'row', gap: spacing.md },
  box: { flex: 1, backgroundColor: colors.cardSoft, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  boxActual: { backgroundColor: colors.primary + '1A' },
  boxLabel: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.muted, marginBottom: 2 },
  boxScore: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.ink },
  boxPending: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.muted },
});
