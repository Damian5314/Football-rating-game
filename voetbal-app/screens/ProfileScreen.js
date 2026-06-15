import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendScreen from './ProfileButtons/FriendScreen';
import PredictionsScreen from './ProfileButtons/PredictionScreen';
import { UserContext } from '../context/UserContext';
import { getCosmeticById } from '../services/cosmetics';
import { headerOptions } from '../components/HeaderRight';

function ProfileScreenContent({ navigation }) {
  const { profile, loadingProfile, equipped, updateProfile } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  if (loadingProfile || !profile) {
    return (
      <View style={styles.centered}>
        <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        <Text style={{ color: '#999', marginTop: 8 }}>Profiel laden…</Text>
      </View>
    );
  }

  // Uitgeruste cosmetics omzetten naar hun waarde.
  const frame = getCosmeticById(equipped.avatarFrame);
  const character = getCosmeticById(equipped.character);
  const badge = getCosmeticById(equipped.badge);
  const nameColor = getCosmeticById(equipped.nameColor);

  const frameStyle = frame
    ? { borderColor: frame.value, borderWidth: 4 }
    : { borderColor: '#eee', borderWidth: 2 };

  const openEdit = () => {
    setNameInput(profile.username || '');
    setEditing(true);
  };
  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed) await updateProfile({ username: trimmed });
    setEditing(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileImage}>
        <View style={[styles.avatarWrap, frameStyle]}>
          {character ? (
            <Text style={styles.avatarEmoji}>{character.value}</Text>
          ) : profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={70} color="#bbb" />
          )}
        </View>

        <View style={styles.nameRow}>
          <Text style={[styles.username, nameColor && { color: nameColor.value }]}>
            @{profile.username}
          </Text>
          {badge && <Text style={styles.badge}>{badge.value}</Text>}
          <TouchableOpacity onPress={openEdit} style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.points ?? 0}</Text>
          <Text style={styles.statLabel}>Punten</Text>
        </View>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Predictions')}>
          <Text style={styles.statNumber}>{profile.stats?.correctPredictions ?? 0}</Text>
          <Text style={styles.statLabel}>Correcte voorspellingen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Friends')}>
          <Text style={styles.statNumber}>{profile.stats?.friends ?? 0}</Text>
          <Text style={styles.statLabel}>Vrienden</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Gebruikersnaam wijzigen</Text>
            <TextInput
              style={styles.modalInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              maxLength={20}
            />
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
  container: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 40, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  profileImage: { alignItems: 'center', marginVertical: 20 },
  avatarWrap: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 80 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  username: { fontSize: 20, fontWeight: '600', color: '#333' },
  badge: { fontSize: 20 },
  editBtn: { padding: 4 },
  statsContainer: { gap: 16, paddingBottom: 20 },
  statCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  statNumber: { fontSize: 26, fontWeight: 'bold', color: '#15803D' },
  statLabel: { marginTop: 4, color: 'gray' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 30 },
  modalBox: { backgroundColor: '#fff', borderRadius: 14, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, marginTop: 16 },
  modalCancel: { color: '#888', fontSize: 15 },
  modalSave: { color: '#15803D', fontSize: 15, fontWeight: 'bold' },
});
