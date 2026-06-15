import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { UserProvider, UserContext } from './context/UserContext';
import HomeScreen from './screens/HomeScreen';
import MatchDetailScreen from './screens/MatchDetailScreen';
import LeagueScreen from './screens/LeagueScreen';
import StoreScreen from './screens/StoreScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import { colors } from './theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// Coin-saldo rechtsboven in de header.
function CoinPill() {
  const { coins } = useContext(UserContext);
  return (
    <View style={styles.coinPill}>
      <Image source={require('./assets/coin.png')} style={styles.coinPillIcon} />
      <Text style={styles.coinPillText}>{coins}</Text>
    </View>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Matches"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="MatchDetail"
        component={MatchDetailScreen}
        options={{ title: 'Voorspelling' }}
      />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  const { logout } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'football' : 'football-outline';
            else if (route.name === 'Leagues') iconName = focused ? 'trophy' : 'trophy-outline';
            else if (route.name === 'Store') iconName = focused ? 'cart' : 'cart-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { fontWeight: '800', color: colors.text },
          headerTitleAlign: 'left',
          headerRight: () => (
            <View style={styles.headerRight}>
              <CoinPill />
              <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Leagues" component={LeagueScreen} />
        <Tab.Screen name="Store" component={StoreScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function Root() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? (
    <UserProvider>
      <MainTabs />
    </UserProvider>
  ) : (
    <LoginScreen />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  headerRight: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
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
  coinPillIcon: { width: 16, height: 16 },
  coinPillText: { fontWeight: '800', color: colors.primaryDark },
});
