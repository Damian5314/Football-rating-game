"use client"

import { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebaseConfig"
import { AuthContext } from "../context/AuthContext"

export default function LeagueScreen({ navigation }) {
  const [leagues, setLeagues] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [newLeagueDescription, setNewLeagueDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      setLoading(true)

      // Fetch user's leagues (both created by user and joined)
      const userLeaguesQuery = query(collection(db, "leagues"), where("members", "array-contains", user.uid))
      const userLeaguesSnapshot = await getDocs(userLeaguesQuery)

      // Fetch public leagues that user is not a member of
      const publicLeaguesQuery = query(collection(db, "leagues"), where("isPublic", "==", true))
      const publicLeaguesSnapshot = await getDocs(publicLeaguesQuery)

      // Process user's leagues
      const userLeaguesData = userLeaguesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isUserLeague: true,
      }))

      // Process public leagues and filter out ones user is already in
      const publicLeaguesData = publicLeaguesSnapshot.docs
        .filter((doc) => !userLeaguesData.some((userLeague) => userLeague.id === doc.id))
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isPublic: true,
        }))

      // Combine leagues
      const combinedLeagues = [...userLeaguesData, ...publicLeaguesData]

      setLeagues(combinedLeagues)
      console.log("Leagues loaded:", combinedLeagues.length)
    } catch (error) {
      console.error("Error fetching leagues:", error)
      Alert.alert("Error", "Failed to load leagues")
    } finally {
      setLoading(false)
    }
  }

  const createLeague = async () => {
    if (!newLeagueName.trim()) {
      Alert.alert("Error", "Please enter a league name")
      return
    }

    try {
      setLoading(true)

      // Generate a unique invite code (6 characters, uppercase)
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Create new league in Firestore
      const leagueData = {
        name: newLeagueName.trim(),
        description: newLeagueDescription.trim(),
        createdBy: user.uid,
        creatorEmail: user.email,
        createdAt: new Date(),
        members: [user.uid],
        memberEmails: [user.email],
        inviteCode: inviteCode,
        isPublic: false,
      }

      const docRef = await addDoc(collection(db, "leagues"), leagueData)
      console.log("League created with ID:", docRef.id)

      // Add the new league to the state
      const newLeague = {
        id: docRef.id,
        ...leagueData,
        isUserLeague: true,
      }

      setLeagues([newLeague, ...leagues])

      // Close modal and reset form
      setModalVisible(false)
      setNewLeagueName("")
      setNewLeagueDescription("")

      // Show success message with invite option
      Alert.alert("League Created", `Your league "${newLeagueName}" has been created successfully!`, [
        { text: "OK" },
        {
          text: "Share Invite Code",
          onPress: () => shareInviteLink(inviteCode, newLeagueName),
        },
      ])
    } catch (error) {
      console.error("Error creating league:", error)
      Alert.alert("Error", "Failed to create league")
    } finally {
      setLoading(false)
    }
  }

  const shareInviteLink = async (inviteCode, leagueName) => {
    try {
      await Share.share({
        message: `Join my league "${leagueName}" in the Voetbal App! Use invite code: ${inviteCode}`,
      })
    } catch (error) {
      console.error("Error sharing invite link:", error)
    }
  }

  const renderLeagueItem = ({ item }) => (
    <TouchableOpacity
      style={styles.leagueItem}
      onPress={() => {
        /* Navigate to league details in the future */
        Alert.alert("League Selected", `You selected ${item.name}`)
      }}
    >
      <View style={styles.leagueInfo}>
        <Text style={styles.leagueName}>{item.name}</Text>
        {item.description ? <Text style={styles.leagueDescription}>{item.description}</Text> : null}

        <View style={styles.badgeContainer}>
          {item.createdBy === user.uid && (
            <View style={[styles.badge, styles.ownerBadge]}>
              <Text style={styles.badgeText}>Owner</Text>
            </View>
          )}

          {item.isUserLeague && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Member</Text>
            </View>
          )}

          {item.isPublic && !item.isUserLeague && (
            <View style={[styles.badge, styles.publicBadge]}>
              <Text style={styles.badgeText}>Public</Text>
            </View>
          )}
        </View>
      </View>

      {item.createdBy === user.uid && (
        <TouchableOpacity style={styles.shareButton} onPress={() => shareInviteLink(item.inviteCode, item.name)}>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leagues</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.joinButton} onPress={() => navigation.navigate("JoinLeague")}>
            <Ionicons name="enter-outline" size={20} color="white" />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && leagues.length === 0 ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : leagues.length > 0 ? (
        <FlatList
          data={leagues}
          keyExtractor={(item) => item.id}
          renderItem={renderLeagueItem}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchLeagues}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={60} color="#ccc" />
          <Text style={styles.emptyStateText}>No leagues found</Text>
          <Text style={styles.emptyStateSubtext}>Create your first league or join an existing one!</Text>
        </View>
      )}

      {/* Create League Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New League</Text>

            <TextInput
              style={styles.input}
              placeholder="League Name"
              value={newLeagueName}
              onChangeText={setNewLeagueName}
              maxLength={30}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newLeagueDescription}
              onChangeText={setNewLeagueDescription}
              multiline
              maxLength={100}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false)
                  setNewLeagueName("")
                  setNewLeagueDescription("")
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton, !newLeagueName.trim() && styles.disabledButton]}
                onPress={createLeague}
                disabled={loading || !newLeagueName.trim()}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createModalButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "600",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  leagueItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  leagueDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "#E1F5FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  ownerBadge: {
    backgroundColor: "#FFF3E0",
  },
  publicBadge: {
    backgroundColor: "#E8F5E9",
  },
  badgeText: {
    color: "#0288D1",
    fontSize: 12,
    fontWeight: "500",
  },
  shareButton: {
    justifyContent: "center",
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    color: "#333",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: "#f2f2f2",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  createModalButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
  },
  createModalButtonText: {
    color: "white",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
})
