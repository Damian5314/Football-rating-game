import { View, Text, Image, StyleSheet } from 'react-native';

// Basis-detailscherm (Fase 0). In Fase 2 wordt dit het voorspel-scherm.
export default function MatchDetailScreen({ route }) {
  const { match } = route.params;

  const date = new Date(match.timestamp).toLocaleString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
  const showScore = match.statusType !== 'notstarted';

  return (
    <View style={styles.container}>
      <Text style={styles.league}>{match.tournamentName}</Text>

      <View style={styles.teams}>
        <View style={styles.team}>
          {match.home.logo && <Image source={match.home.logo} style={styles.logo} />}
          <Text style={styles.teamName}>{match.home.name}</Text>
        </View>

        <View style={styles.middle}>
          {showScore ? (
            <Text style={styles.score}>
              {match.homeScore} - {match.awayScore}
            </Text>
          ) : (
            <Text style={styles.vs}>vs</Text>
          )}
          <Text style={styles.status}>{match.statusText}</Text>
        </View>

        <View style={styles.team}>
          {match.away.logo && <Image source={match.away.logo} style={styles.logo} />}
          <Text style={styles.teamName}>{match.away.name}</Text>
        </View>
      </View>

      <Text style={styles.date}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  league: { textAlign: 'center', fontWeight: '600', color: '#444', marginBottom: 24 },
  teams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center', gap: 8 },
  logo: { width: 56, height: 56, resizeMode: 'contain' },
  teamName: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  middle: { alignItems: 'center', paddingHorizontal: 8 },
  score: { fontSize: 28, fontWeight: 'bold' },
  vs: { fontSize: 20, color: '#aaa' },
  status: { fontSize: 12, color: 'gray', marginTop: 4 },
  date: { textAlign: 'center', color: 'gray', marginTop: 24 },
});
