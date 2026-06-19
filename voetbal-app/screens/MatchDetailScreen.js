import { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { teamLogo } from '../services/api';
import { savePrediction, getPrediction } from '../services/predictionService';
import { scorePrediction, coinsForPoints, SCORING } from '../services/gameConfig';
import { colors, fonts, spacing, radius, shadowSoft } from '../theme';

function TeamBadge({ id }) {
  return (
    <View style={styles.badge}>
      {id ? <Image source={teamLogo(id)} style={styles.badgeLogo} /> : null}
    </View>
  );
}

function StepButton({ icon, filled, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.stepBtn, filled ? styles.stepBtnFilled : styles.stepBtnOutline]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={22} color={filled ? colors.white : colors.primary} />
    </TouchableOpacity>
  );
}

export default function MatchDetailScreen({ route, navigation }) {
  const { match } = route.params;
  const { user } = useContext(AuthContext);

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const locked = match.statusType !== 'notstarted' || Date.now() >= match.timestamp;

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const existing = await getPrediction(user.uid, match.id);
      if (existing) {
        setPrediction(existing);
        setHomeScore(existing.homeScore);
        setAwayScore(existing.awayScore);
      }
    } catch (e) {
      console.error('Voorspelling laden mislukt:', e);
    } finally {
      setLoading(false);
    }
  }, [user, match.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePrediction(user.uid, match, homeScore, awayScore);
      navigation.goBack();
    } catch (e) {
      console.error('Opslaan mislukt:', e);
    } finally {
      setSaving(false);
    }
  };

  const date = new Date(match.timestamp).toLocaleString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const finished = match.statusType === 'finished';
  const actual =
    finished && match.homeScore != null
      ? { homeScore: match.homeScore, awayScore: match.awayScore }
      : null;
  const earned =
    prediction != null
      ? prediction.awardedPoints != null
        ? prediction.awardedPoints
        : actual
        ? scorePrediction(prediction, actual)
        : null
      : null;

  const statusPill =
    match.statusType === 'inprogress'
      ? { text: 'LIVE', style: styles.spLive, textStyle: styles.spLiveText }
      : match.statusType === 'finished'
      ? { text: 'AFGELOPEN', style: styles.spGray, textStyle: styles.spGrayText }
      : { text: 'NOG NIET BEGONNEN', style: styles.spGray, textStyle: styles.spGrayText };

  const celebrate =
    earned == null ? null : earned === SCORING.EXACT ? '✨ Exact goed! 🎉' : earned > 0 ? '👍 Richting goed!' : '😕 Net mis';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      {/* Wedstrijdkaart */}
      <View style={styles.matchCard}>
        <View style={styles.compPill}>
          <Ionicons name="football-outline" size={13} color={colors.primaryDark} />
          <Text style={styles.compText}>{match.tournamentName}</Text>
        </View>

        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            <TeamBadge id={match.home.id} />
            <Text style={styles.teamName} numberOfLines={1}>{match.home.name}</Text>
          </View>

          <View style={styles.middle}>
            {match.statusType !== 'notstarted' ? (
              <Text style={styles.bigScore}>{match.homeScore} - {match.awayScore}</Text>
            ) : (
              <Text style={styles.bigVs}>VS</Text>
            )}
            <View style={[styles.statusPill, statusPill.style]}>
              <Text style={statusPill.textStyle}>{statusPill.text}</Text>
            </View>
          </View>

          <View style={styles.teamCol}>
            <TeamBadge id={match.away.id} />
            <Text style={styles.teamName} numberOfLines={1}>{match.away.name}</Text>
          </View>
        </View>

        <Text style={styles.date}>{date}</Text>
      </View>

      {/* Voorspellen of uitkomst */}
      {!locked ? (
        <View style={styles.predictCard}>
          <Text style={styles.cardTitle}>
            {prediction ? 'Pas je voorspelling aan' : 'Doe je voorspelling'}
          </Text>

          <View style={styles.steppers}>
            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel} numberOfLines={1}>{match.home.name}</Text>
              <View style={styles.stepperRow}>
                <StepButton icon="remove" onPress={() => setHomeScore((v) => Math.max(0, v - 1))} />
                <Text style={styles.stepValue}>{homeScore}</Text>
                <StepButton icon="add" filled onPress={() => setHomeScore((v) => Math.min(20, v + 1))} />
              </View>
            </View>

            <Text style={styles.colon}>:</Text>

            <View style={styles.stepperCol}>
              <Text style={styles.stepperLabel} numberOfLines={1}>{match.away.name}</Text>
              <View style={styles.stepperRow}>
                <StepButton icon="remove" onPress={() => setAwayScore((v) => Math.max(0, v - 1))} />
                <Text style={styles.stepValue}>{awayScore}</Text>
                <StepButton icon="add" filled onPress={() => setAwayScore((v) => Math.min(20, v + 1))} />
              </View>
            </View>
          </View>

          <View style={styles.hintPill}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={styles.hintText}>
              Exact goed = {SCORING.EXACT} · juiste richting = {SCORING.DIRECTION}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveText}>
              {saving ? 'Opslaan…' : prediction ? 'Voorspelling bijwerken' : 'Voorspelling opslaan'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {prediction ? (
            <View style={styles.resultCard}>
              {celebrate && <Text style={styles.celebrate}>{celebrate}</Text>}
              <View style={styles.resultBoxes}>
                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>Jouw voorspelling</Text>
                  <Text style={styles.resultScore}>{prediction.homeScore} - {prediction.awayScore}</Text>
                </View>
                <View style={[styles.resultBox, styles.resultBoxActual]}>
                  <Text style={styles.resultLabel}>{actual ? 'Uitslag' : 'Stand'}</Text>
                  <Text style={styles.resultScore}>
                    {actual ? `${actual.homeScore} - ${actual.awayScore}` : `${match.homeScore} - ${match.awayScore}`}
                  </Text>
                </View>
              </View>

              {earned != null && (
                <View style={styles.rewardRow}>
                  <View style={[styles.rewardPill, styles.rewardPoints]}>
                    <Ionicons name="trophy" size={15} color={colors.white} />
                    <Text style={styles.rewardPointsText}>+{earned} punten</Text>
                  </View>
                  <View style={[styles.rewardPill, styles.rewardCoins]}>
                    <Image source={require('../assets/coin.png')} style={styles.rewardCoin} />
                    <Text style={styles.rewardCoinsText}>+{coinsForPoints(earned)} coins</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.predictCard}>
              <Text style={styles.cardTitle}>Voorspellen gesloten</Text>
              <Text style={styles.noPred}>Je hebt deze wedstrijd niet voorspeld.</Text>
            </View>
          )}
          <View style={styles.lockedRow}>
            <Ionicons name="lock-closed" size={13} color={colors.muted} />
            <Text style={styles.lockedText}>Voorspellen gesloten</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },

  matchCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, ...shadowSoft },
  compPill: {
    alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.cardSoft, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 12,
    marginBottom: spacing.lg,
  },
  compText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primaryDark },
  teamsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  teamCol: { flex: 1, alignItems: 'center', gap: 8 },
  badge: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: colors.cardSoft,
    borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  badgeLogo: { width: 38, height: 38, resizeMode: 'contain' },
  teamName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, textAlign: 'center' },
  middle: { alignItems: 'center', paddingHorizontal: 6, paddingTop: 6, gap: 8 },
  bigScore: { fontFamily: fonts.headingBold, fontSize: 32, color: colors.ink },
  bigVs: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.muted },
  statusPill: { borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 10 },
  spLive: { backgroundColor: colors.liveSoft },
  spLiveText: { color: colors.live, fontFamily: fonts.bodyExtra, fontSize: 10 },
  spGray: { backgroundColor: colors.bg },
  spGrayText: { color: colors.muted, fontFamily: fonts.bodyBold, fontSize: 10 },
  date: { textAlign: 'center', color: colors.muted, marginTop: spacing.lg, fontFamily: fonts.body, fontSize: 13 },

  predictCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, ...shadowSoft },
  cardTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.ink, textAlign: 'center', marginBottom: spacing.lg },
  steppers: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 8 },
  stepperCol: { alignItems: 'center', flex: 1 },
  stepperLabel: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.muted, marginBottom: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  stepBtnFilled: { backgroundColor: colors.primary },
  stepBtnOutline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary },
  stepValue: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.ink, minWidth: 26, textAlign: 'center' },
  colon: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.ink, marginTop: 30 },
  hintPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center',
    backgroundColor: colors.bg, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12, marginTop: spacing.lg,
  },
  hintText: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.muted },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center', marginTop: spacing.lg, ...shadowSoft },
  saveText: { color: colors.white, fontFamily: fonts.bodyExtra, fontSize: 16 },
  noPred: { textAlign: 'center', color: colors.muted, fontFamily: fonts.body },

  resultCard: {
    backgroundColor: colors.cardSoft, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  celebrate: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.ink, marginBottom: spacing.lg },
  resultBoxes: { flexDirection: 'row', gap: spacing.md },
  resultBox: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  resultBoxActual: { backgroundColor: colors.primary + '22' },
  resultLabel: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.muted, marginBottom: 4 },
  resultScore: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.ink },
  rewardRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  rewardPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.md, paddingVertical: 12 },
  rewardPoints: { backgroundColor: colors.primary },
  rewardPointsText: { color: colors.white, fontFamily: fonts.bodyExtra, fontSize: 14 },
  rewardCoins: { backgroundColor: colors.coinSoft },
  rewardCoin: { width: 16, height: 16 },
  rewardCoinsText: { color: '#9A6B00', fontFamily: fonts.bodyExtra, fontSize: 14 },
  lockedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.lg },
  lockedText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
});
