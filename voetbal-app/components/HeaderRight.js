import { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { colors } from '../theme';

// Coin-saldo + uitloggen rechtsboven; gedeeld door alle stack-headers.
export function HeaderRight() {
  const { logout } = useContext(AuthContext);
  const { coins } = useContext(UserContext);
  return (
    <View style={styles.row}>
      <View style={styles.coinPill}>
        <Image source={require('../assets/coin.png')} style={styles.coinIcon} />
        <Text style={styles.coinText}>{coins}</Text>
      </View>
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={24} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

// Gedeelde header-stijl voor alle stack-navigators.
export const headerOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerTitleStyle: { fontWeight: '800', color: colors.text },
  headerTintColor: colors.text,
  headerRight: () => <HeaderRight />,
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  logoutBtn: { padding: 6, marginLeft: 4 },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
  },
  coinIcon: { width: 16, height: 16 },
  coinText: { fontWeight: '800', color: colors.primaryDark },
});
