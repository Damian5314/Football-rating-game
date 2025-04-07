import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import HomeScreen from './screens/HomeScreen';
import LeagueScreen from './screens/LeagueScreen';
import StoreScreen from './screens/StoreScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function MainApp() {
  const { user } = useContext(AuthContext);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const fetchCoins = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCoins(docSnap.data().coins);
        }
      }
    };

    fetchCoins();
  }, [user]);

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

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <AuthProvider>
      {user ? <MainApp /> : <LoginScreen />}
    </AuthProvider>
  );
} 