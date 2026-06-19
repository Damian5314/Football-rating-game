import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, shadowSoft } from '../theme';

export default function LeagueScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconTile}>
          <Ionicons name="trophy" size={38} color={colors.coin} />
        </View>
        <Text style={styles.title}>Competities komen eraan</Text>
        <Text style={styles.text}>
          Binnenkort start je mini-competities met vrienden en strijd je om de
          hoogste plek op de ranglijst.
        </Text>
        <View style={styles.pill}>
          <Ionicons name="time-outline" size={14} color={colors.primaryDark} />
          <Text style={styles.pillText}>Binnenkort</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', ...shadowSoft },
  iconTile: {
    width: 80, height: 80, borderRadius: radius.lg, backgroundColor: colors.coinSoft,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
  },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.ink, marginBottom: spacing.sm },
  text: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginBottom: spacing.lg },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cardSoft, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 14 },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primaryDark },
});
