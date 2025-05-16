"use client"

import { useState, useContext } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore"
import { db } from "../firebaseConfig"
import { AuthContext } from "../context/AuthContext"

export default function JoinLeagueScreen({ navigation, route }) {
  const [inviteCode, setInviteCode] = useState(route.params?.inviteCode || "")
  const [loading, setLoading] = useState(false)
  const { user } = useContext(AuthContext)

  const joinLeague = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code")
      return
    }

    try {
      setLoading(true)

      // Find the league with the given invite code
      const leaguesRef = collection(db, "leagues")
      const q = query(leaguesRef, where("inviteCode", "==", inviteCode.toUpperCase()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        Alert.alert("Error", "Invalid invite code. Please check and try again.")
        return
      }

      const leagueDoc = querySnapshot.docs[0]
      const leagueData = leagueDoc.data()

      // Check if user is already a member
      if (leagueData.members.includes(user.uid)) {
        Alert.alert("Info", "You are already a member of this league.")
        navigation.goBack()
        return
      }

      // Add user to the league members
      await updateDoc(doc(db, "leagues", leagueDoc.id), {
        members: arrayUnion(user.uid),
      })

      Alert.alert("Success", `You have joined the league "${leagueData.name}"!`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      console.error("Error joining league:", error)
      Alert.alert("Error", "Failed to join league")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="people" size={60} color="#007AFF" style={styles.icon} />
        <Text style={styles.title}>Join a League</Text>
        <Text style={styles.subtitle}>Enter the invite code to join a friend's league</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter invite code"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.joinButton} onPress={joinLeague} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.joinButtonText}>Join League</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 24,
  },
  joinButton: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
