import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import LeagueScreen from './screens/LeagueScreen';
import StoreScreen from './screens/StoreScreen';
import ProfileScreen from './screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  const [coins, setCoins] = useState(220);
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'football';
            else if (route.name === 'Leagues') iconName = 'trophy';
            else if (route.name === 'Store') iconName = 'cart';
            else if (route.name === 'Profile') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerRight: () => (
            <Ionicons
              name="notifications-outline"
              size={24}
              style={{ marginRight: 16 }}
              onPress={() => console.log('Notificaties geopend')}
            />
          ),
          headerTitleAlign: 'left',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Leagues" component={LeagueScreen} />
        <Tab.Screen name="Store">
          {() => <StoreScreen coins={coins} setCoins={setCoins} />}
        </Tab.Screen>
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
