import { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UserContext } from '../context/UserContext';
import { COSMETIC_TYPES, cosmeticsByType } from '../services/cosmetics';
import { colors, fonts, spacing, radius, shadowSoft } from '../theme';

function Preview({ item }) {
  if (item.type === 'avatarFrame') {
    return <View style={[styles.framePreview, { borderColor: item.value }]} />;
  }
  if (item.type === 'nameColor') {
    return <Text style={[styles.namePreview, { color: item.value }]}>Naam</Text>;
  }
  return <Text style={styles.emojiPreview}>{item.value}</Text>;
}

function CosmeticCard({ item }) {
  const { coins, ownedCosmetics, equipped, purchaseCosmetic, equip } = useContext(UserContext);
  const owned = ownedCosmetics.includes(item.id);
  const isEquipped = equipped[item.type] === item.id;
  const canAfford = coins >= item.price;

  const handleBuy = async () => {
    try {
      await purchaseCosmetic(item);
      Alert.alert('Gekocht! 🎉', `${item.name} is van jou.`);
    } catch (e) {
      Alert.alert('Oeps', e.message || 'Kopen mislukt');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.previewBox}>
        <Preview item={item} />
      </View>
      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>

      {owned ? (
        <TouchableOpacity
          style={[styles.actionPill, isEquipped ? styles.equippedPill : styles.equipPill]}
          onPress={() => equip(item.type, isEquipped ? null : item.id)}
          activeOpacity={0.85}
        >
          <Text style={isEquipped ? styles.equippedText : styles.equipText}>
            {isEquipped ? '✓ Uitgerust' : 'Uitrusten'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionPill, styles.pricePill, !canAfford && { opacity: 0.45 }]}
          onPress={handleBuy}
          disabled={!canAfford}
          activeOpacity={0.85}
        >
          <Image source={require('../assets/coin.png')} style={styles.priceCoin} />
          <Text style={styles.priceText}>{item.price}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function StoreScreen() {
  const { coins } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* Gouden saldo-banner */}
        <View style={styles.banner}>
          <Image source={require('../assets/coin.png')} style={styles.bannerCoin} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerCoins}>{coins} coins</Text>
            <Text style={styles.bannerHint}>Verdien coins door wedstrijden te voorspellen</Text>
          </View>
        </View>

        {Object.entries(COSMETIC_TYPES).map(([type, label]) => (
          <View key={type} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>{label}</Text>
            </View>
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
  container: { flex: 1, backgroundColor: colors.bg },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.coinSoft, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: '#F2D99A',
  },
  bannerCoin: { width: 40, height: 40 },
  bannerCoins: { fontFamily: fonts.headingBold, fontSize: 22, color: '#9A6B00' },
  bannerHint: { fontFamily: fonts.body, fontSize: 12, color: '#B08327', marginTop: 2 },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '47.5%', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    alignItems: 'center', ...shadowSoft,
  },
  previewBox: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  framePreview: { width: 56, height: 56, borderRadius: 28, borderWidth: 4, backgroundColor: colors.cardSoft },
  emojiPreview: { fontSize: 42 },
  namePreview: { fontSize: 20, fontFamily: fonts.headingBold },
  cardName: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink, marginBottom: spacing.md, textAlign: 'center' },
  actionPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 16, minWidth: 96,
  },
  pricePill: { backgroundColor: colors.coinSoft },
  priceCoin: { width: 16, height: 16 },
  priceText: { fontFamily: fonts.bodyExtra, color: '#9A6B00', fontSize: 14 },
  equipPill: { backgroundColor: colors.primary },
  equipText: { color: colors.white, fontFamily: fonts.bodyExtra, fontSize: 13 },
  equippedPill: { backgroundColor: colors.cardSoft, borderWidth: 1, borderColor: colors.primary },
  equippedText: { color: colors.primaryDark, fontFamily: fonts.bodyExtra, fontSize: 13 },
});
