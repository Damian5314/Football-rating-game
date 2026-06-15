import { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { subscribePredictions } from '../../services/predictionService';
import { scorePrediction } from '../../services/gameConfig';

export default function PredictionsScreen() {
  const { user } = useContext(AuthContext);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribePredictions(user.uid, (list) => {
      const sorted = [...list].sort(
        (a, b) => (b.match?.timestamp || 0) - (a.match?.timestamp || 0)
      );
      setPredictions(sorted);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const renderItem = ({ item }) => {
    const m = item.match || {};
    const date = m.timestamp
      ? new Date(m.timestamp).toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'short',
        })
      : '';
    const scored = item.status === 'scored' && item.actual;
    const points = scored
      ? item.awardedPoints ?? scorePrediction(item, item.actual)
      : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.teams} numberOfLines={1}>
            {m.homeName} vs {m.awayName}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.predText}>
            Voorspeld: {item.homeScore} - {item.awayScore}
          </Text>
          {scored ? (
            <Text style={styles.actualText}>
              Uitslag: {item.actual.homeScore} - {item.actual.awayScore}
            </Text>
          ) : (
            <Text style={styles.pending}>Nog te spelen</Text>
          )}
        </View>
        {points != null && (
          <Text style={[styles.points, points > 0 ? styles.good : styles.zero]}>
            {points > 0 ? `+${points} punten` : '0 punten'}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#15803D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={predictions}
        keyExtractor={(item) => String(item.fixtureId)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.empty}>
              Je hebt nog geen voorspellingen gedaan.{'\n'}Ga naar Home en tik op een wedstrijd!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  empty: { color: 'gray', textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  teams: { fontWeight: 'bold', fontSize: 15, flexShrink: 1 },
  date: { color: 'gray', fontSize: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  predText: { fontSize: 14 },
  actualText: { fontSize: 14, color: '#333' },
  pending: { fontSize: 13, color: '#999', fontStyle: 'italic' },
  points: { marginTop: 8, fontWeight: 'bold', fontSize: 15 },
  good: { color: '#15803D' },
  zero: { color: '#999' },
});
