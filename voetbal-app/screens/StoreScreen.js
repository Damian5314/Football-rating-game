import { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { COSMETIC_TYPES, cosmeticsByType } from '../services/cosmetics';

// Visuele preview per cosmetic-type.
function Preview({ item }) {
  if (item.type === 'avatarFrame') {
    return <View style={[styles.framePreview, { borderColor: item.value }]} />;
  }
  if (item.type === 'nameColor') {
    return <Text style={[styles.namePreview, { color: item.value }]}>Naam</Text>;
  }
  // badge of character → emoji
  return <Text style={styles.emojiPreview}>{item.value}</Text>;
}

function CosmeticCard({ item }) {
  const { coins, ownedCosmetics, equipped, purchaseCosmetic, equip } =
    useContext(UserContext);

  const owned = ownedCosmetics.includes(item.id);
  const isEquipped = equipped[item.type] === item.id;
  const canAfford = coins >= item.price;

  const handleBuy = async () => {
    try {
      await purchaseCosmetic(item);
      Alert.alert('Gekocht!', `${item.name} is van jou.`);
    } catch (e) {
      Alert.alert('Oeps', e.message || 'Kopen mislukt');
    }
  };

  const handleEquip = () => equip(item.type, isEquipped ? null : item.id);

  return (
    <View style={styles.card}>
      <View style={styles.previewBox}>
        <Preview item={item} />
      </View>
      <Text style={styles.cardName} numberOfLines={1}>
        {item.name}
      </Text>

      {owned ? (
        <TouchableOpacity
          style={[styles.btn, isEquipped ? styles.btnEquipped : styles.btnEquip]}
          onPress={handleEquip}
        >
          <Text style={isEquipped ? styles.btnEquippedText : styles.btnEquipText}>
            {isEquipped ? 'Uitgerust ✓' : 'Uitrusten'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.btn, styles.btnBuy, !canAfford && styles.btnDisabled]}
          onPress={handleBuy}
          disabled={!canAfford}
        >
          <Image source={require('../assets/coin.png')} style={styles.btnCoin} />
          <Text style={styles.btnBuyText}>{item.price}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function StoreScreen() {
  const { coins } = useContext(UserContext);

  return (
    <View style={styles.container}>
      {/* Saldo-balk */}
      <View style={styles.coinBar}>
        <Image source={require('../assets/coin.png')} style={styles.coinIcon} />
        <Text style={styles.coinText}>{coins}</Text>
        <Text style={styles.coinHint}>Verdien coins door wedstrijden te voorspellen</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {Object.entries(COSMETIC_TYPES).map(([type, label]) => (
          <View key={type} style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <View style={styles.grid}>
              {cosmeticsByType(type).map((item) => (
                <CosmeticCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  coinBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
    flexWrap: 'wrap',
  },
  coinIcon: { width: 22, height: 22, marginRight: 8 },
  coinText: { fontSize: 20, fontWeight: 'bold', marginRight: 12 },
  coinHint: { color: '#888', fontSize: 12, flexShrink: 1 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    alignItems: 'center',
  },
  previewBox: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  framePreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    backgroundColor: '#e0e0e0',
  },
  emojiPreview: { fontSize: 40 },
  namePreview: { fontSize: 20, fontWeight: 'bold' },
  cardName: { fontSize: 13, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 90,
  },
  btnBuy: { backgroundColor: '#ffe066' },
  btnBuyText: { fontWeight: 'bold' },
  btnCoin: { width: 16, height: 16, marginRight: 6 },
  btnDisabled: { opacity: 0.4 },
  btnEquip: { backgroundColor: '#15803D' },
  btnEquipText: { color: '#fff', fontWeight: 'bold' },
  btnEquipped: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#15803D' },
  btnEquippedText: { color: '#15803D', fontWeight: 'bold' },
});
