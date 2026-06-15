import { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { teamLogo } from '../services/api';
import { savePrediction, getPrediction } from '../services/predictionService';
import { scorePrediction, SCORING } from '../services/gameConfig';
import { colors } from '../theme';

function Stepper({ label, value, setValue, disabled }) {
  const change = (delta) =>
    setValue((v) => Math.max(0, Math.min(20, v + delta)));
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepBtn, disabled && styles.stepBtnDisabled]}
          onPress={() => change(-1)}
          disabled={disabled}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}</Text>
        <TouchableOpacity
          style={[styles.stepBtn, disabled && styles.stepBtnDisabled]}
          onPress={() => change(1)}
          disabled={disabled}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
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

  // Voorspellen kan alleen vóór de aftrap.
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
      setPrediction({ homeScore, awayScore, status: 'pending' });
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

  // Uitkomst tonen voor een afgeronde wedstrijd.
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

  return (
    <View style={styles.container}>
      <Text style={styles.league}>{match.tournamentName}</Text>

      <View style={styles.teams}>
        <View style={styles.team}>
          {match.home.id && (
            <Image source={teamLogo(match.home.id)} style={styles.logo} />
          )}
          <Text style={styles.teamName}>{match.home.name}</Text>
        </View>
        <View style={styles.middle}>
          {match.statusType !== 'notstarted' ? (
            <Text style={styles.score}>
              {match.homeScore} - {match.awayScore}
            </Text>
          ) : (
            <Text style={styles.vs}>vs</Text>
          )}
          <Text style={styles.status}>{match.statusText || 'Nog te spelen'}</Text>
        </View>
        <View style={styles.team}>
          {match.away.id && (
            <Image source={teamLogo(match.away.id)} style={styles.logo} />
          )}
          <Text style={styles.teamName}>{match.away.name}</Text>
        </View>
      </View>

      <Text style={styles.date}>{date}</Text>

      <View style={styles.divider} />

      {!locked ? (
        <>
          <Text style={styles.sectionTitle}>
            {prediction ? 'Pas je voorspelling aan' : 'Doe je voorspelling'}
          </Text>
          <View style={styles.steppers}>
            <Stepper label={match.home.name} value={homeScore} setValue={setHomeScore} />
            <Text style={styles.colon}>:</Text>
            <Stepper label={match.away.name} value={awayScore} setValue={setAwayScore} />
          </View>
          <Text style={styles.hint}>
            Exact goed = {SCORING.EXACT} punten · juiste richting = {SCORING.DIRECTION} punten
          </Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving ? 'Opslaan…' : prediction ? 'Voorspelling bijwerken' : 'Voorspelling opslaan'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View>
          <Text style={styles.sectionTitle}>Voorspellen gesloten</Text>
          {prediction ? (
            <>
              <Text style={styles.resultLine}>
                Jouw voorspelling: {prediction.homeScore} - {prediction.awayScore}
              </Text>
              {actual && (
                <Text style={styles.resultLine}>
                  Uitslag: {actual.homeScore} - {actual.awayScore}
                </Text>
              )}
              {earned != null && (
                <Text style={[styles.points, earned > 0 ? styles.pointsGood : styles.pointsZero]}>
                  {earned > 0 ? `+${earned} punten` : '0 punten'}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.resultLine}>Je hebt deze wedstrijd niet voorspeld.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  league: { textAlign: 'center', fontWeight: '600', color: '#444', marginBottom: 20 },
  teams: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center', gap: 8 },
  logo: { width: 56, height: 56, resizeMode: 'contain' },
  teamName: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  middle: { alignItems: 'center', paddingHorizontal: 8, paddingTop: 14 },
  score: { fontSize: 26, fontWeight: 'bold' },
  vs: { fontSize: 18, color: '#aaa' },
  status: { fontSize: 12, color: 'gray', marginTop: 4, textAlign: 'center' },
  date: { textAlign: 'center', color: 'gray', marginTop: 16 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  steppers: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  colon: { fontSize: 28, fontWeight: 'bold', marginHorizontal: 4, marginTop: 18 },
  stepper: { alignItems: 'center', maxWidth: 120 },
  stepperLabel: { fontSize: 12, color: '#666', marginBottom: 6, textAlign: 'center' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#15803D',
    justifyContent: 'center', alignItems: 'center',
  },
  stepBtnDisabled: { backgroundColor: '#ccc' },
  stepBtnText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  stepValue: { fontSize: 24, fontWeight: 'bold', minWidth: 28, textAlign: 'center' },
  hint: { textAlign: 'center', color: '#888', fontSize: 12, marginTop: 16 },
  saveBtn: {
    backgroundColor: '#15803D', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultLine: { fontSize: 15, textAlign: 'center', marginVertical: 4 },
  points: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  pointsGood: { color: '#15803D' },
  pointsZero: { color: '#999' },
});
