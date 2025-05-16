"use client"

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LeagueScreen from "./LeagueScreen"
import JoinLeagueScreen from "./JoinLeagueScreen"

const Stack = createNativeStackNavigator()

export default function LeagueStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LeaguesList" component={LeagueScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JoinLeague" component={JoinLeagueScreen} options={{ title: "Join League" }} />
    </Stack.Navigator>
  )
}
