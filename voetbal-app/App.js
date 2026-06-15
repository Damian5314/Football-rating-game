import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import HomeScreen from './screens/HomeScreen';
import MatchDetailScreen from './screens/MatchDetailScreen';
import LeagueScreen from './screens/LeagueScreen';
import StoreScreen from './screens/StoreScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import { headerOptions } from './components/HeaderRight';
import { colors } from './theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LeagueStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={headerOptions}>
      <HomeStack.Screen name="Matches" component={HomeScreen} options={{ title: 'Wedstrijden' }} />
      <HomeStack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Voorspelling' }} />
    </HomeStack.Navigator>
  );
}

function LeagueStackNavigator() {
  return (
    <LeagueStack.Navigator screenOptions={headerOptions}>
      <LeagueStack.Screen name="Leagues" component={LeagueScreen} options={{ title: 'Competities' }} />
    </LeagueStack.Navigator>
  );
}

function StoreStackNavigator() {
  return (
    <StoreStack.Navigator screenOptions={headerOptions}>
      <StoreStack.Screen name="Store" component={StoreScreen} options={{ title: 'Winkel' }} />
    </StoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // elke tab heeft zijn eigen stack-header
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
        })}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="Leagues" component={LeagueStackNavigator} options={{ tabBarLabel: 'Competities' }} />
        <Tab.Screen name="Store" component={StoreStackNavigator} options={{ tabBarLabel: 'Winkel' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profiel' }} />
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
});
