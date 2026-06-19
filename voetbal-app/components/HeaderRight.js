import { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { colors, fonts } from '../theme';

// Coin-saldo (gouden pill) + uitloggen rechtsboven; gedeeld door alle headers.
export function HeaderRight() {
  const { logout } = useContext(AuthContext);
  const { coins } = useContext(UserContext);
  return (
    <View style={styles.row}>
      <View style={styles.coinPill}>
        <Image source={require('../assets/coin.png')} style={styles.coinIcon} />
        <Text style={styles.coinText}>{coins}</Text>
      </View>
      <TouchableOpacity onPress={logout} style={styles.logoutBtn} hitSlop={8}>
        <Ionicons name="log-out-outline" size={24} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

// Gedeelde header-stijl voor alle stack-navigators.
export const headerOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerShadowVisible: false,
  headerTitleStyle: { fontFamily: fonts.headingBold, color: colors.ink, fontSize: 20 },
  headerTintColor: colors.ink,
  headerRight: () => <HeaderRight />,
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  logoutBtn: { padding: 6, marginLeft: 6 },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coinSoft,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 6,
  },
  coinIcon: { width: 18, height: 18 },
  coinText: { fontFamily: fonts.bodyExtra, color: '#9A6B00', fontSize: 14 },
});
