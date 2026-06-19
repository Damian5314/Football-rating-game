import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendScreen from './ProfileButtons/FriendScreen';
import PredictionsScreen from './ProfileButtons/PredictionScreen';
import { UserContext } from '../context/UserContext';
import { getCosmeticById } from '../services/cosmetics';
import { getLevel } from '../services/gameConfig';
import { headerOptions } from '../components/HeaderRight';
import { colors, fonts, spacing, radius, shadowSoft } from '../theme';

function ProfileScreenContent({ navigation }) {
  const { profile, loadingProfile, equipped, updateProfile } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  if (loadingProfile || !profile) {
    return (
      <View style={styles.centered}>
        <Ionicons name="football-outline" size={70} color={colors.border} />
        <Text style={styles.loadingText}>Profiel laden…</Text>
      </View>
    );
  }

  const frame = getCosmeticById(equipped.avatarFrame);
  const character = getCosmeticById(equipped.character);
  const badge = getCosmeticById(equipped.badge);
  const nameColor = getCosmeticById(equipped.nameColor);
  const level = getLevel(profile.points ?? 0);

  const ringColor = frame ? frame.value : colors.coin;

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed) await updateProfile({ username: trimmed });
    setEditing(false);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Avatar + naam */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarRing, { borderColor: ringColor }]}>
          <View style={styles.avatarInner}>
            {character ? (
              <Text style={styles.avatarEmoji}>{character.value}</Text>
            ) : profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="football" size={64} color={colors.primary} />
            )}
          </View>
          <View style={styles.cornerBadge}>
            <Text style={styles.cornerBadgeText}>{badge ? badge.value : '🔥'}</Text>
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={[styles.username, nameColor && { color: nameColor.value }]}>@{profile.username}</Text>
          <TouchableOpacity onPress={() => { setNameInput(profile.username || ''); setEditing(true); }} hitSlop={8}>
            <Ionicons name="create-outline" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Level-kaart */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>Level {level.level} · {level.name}</Text>
          {level.next ? (
            <Text style={styles.levelToGo}>nog {level.pointsToNext} punten</Text>
          ) : (
            <Text style={styles.levelToGo}>max level 🏆</Text>
          )}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(level.progress * 100)}%` }]} />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statNumber}>{profile.points ?? 0}</Text>
          <Text style={styles.statLabel}>Punten</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <Text style={styles.statNumber}>{profile.stats?.correctPredictions ?? 0}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Friends')} activeOpacity={0.85}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={styles.statNumber}>{profile.stats?.friends ?? 0}</Text>
          <Text style={styles.statLabel}>Vrienden</Text>
        </TouchableOpacity>
      </View>

      {/* Mijn voorspellingen */}
      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Predictions')} activeOpacity={0.85}>
        <View style={styles.linkLeft}>
          <View style={styles.linkIcon}>
            <Ionicons name="list" size={18} color={colors.primaryDark} />
          </View>
          <Text style={styles.linkText}>Mijn voorspellingen</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </TouchableOpacity>

      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Gebruikersnaam wijzigen</Text>
            <TextInput style={styles.modalInput} value={nameInput} onChangeText={setNameInput} autoFocus maxLength={20} />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.modalCancel}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveName}>
                <Text style={styles.modalSave}>Opslaan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const Stack = createNativeStackNavigator();

export default function ProfileScreen() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Profile" component={ProfileScreenContent} options={{ title: 'Profiel' }} />
      <Stack.Screen name="Predictions" component={PredictionsScreen} options={{ title: 'Voorspellingen' }} />
      <Stack.Screen name="Friends" component={FriendScreen} options={{ title: 'Vrienden' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  loadingText: { color: colors.muted, marginTop: 8, fontFamily: fonts.body },

  avatarSection: { alignItems: 'center', marginVertical: spacing.lg },
  avatarRing: {
    width: 132, height: 132, borderRadius: 66, borderWidth: 5,
    justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card,
  },
  avatarInner: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: colors.cardSoft,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 64 },
  cornerBadge: {
    position: 'absolute', bottom: 2, right: 2, width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.bg, ...shadowSoft,
  },
  cornerBadgeText: { fontSize: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.md },
  username: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.primaryDark },

  levelCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, ...shadowSoft },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  levelTitle: { fontFamily: fonts.bodyExtra, fontSize: 15, color: colors.ink },
  levelToGo: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: colors.bg, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: colors.primary },

  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: spacing.lg, alignItems: 'center', gap: 4, ...shadowSoft },
  statIcon: { fontSize: 20 },
  statNumber: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.ink },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },

  linkRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, ...shadowSoft,
  },
  linkLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  linkIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.cardSoft, justifyContent: 'center', alignItems: 'center' },
  linkText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(14,42,30,0.45)', justifyContent: 'center', padding: 30 },
  modalBox: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.ink, marginBottom: spacing.md },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 16, fontFamily: fonts.body, backgroundColor: colors.bg },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, marginTop: spacing.lg },
  modalCancel: { color: colors.muted, fontSize: 15, fontFamily: fonts.bodyBold },
  modalSave: { color: colors.primaryDark, fontSize: 15, fontFamily: fonts.bodyExtra },
});
