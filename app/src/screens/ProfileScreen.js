import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext.js";
import Ionicons from "@expo/vector-icons/Ionicons";

export function ProfileScreen() {
  const { user, supabase, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Failed", error.message);
    } else {
      Alert.alert("Success", "You have been logged out.");
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.infoText}>You are currently not logged in.</Text>
          <Text style={styles.infoText}>Please go to the Login screen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Ionicons
          name="person-circle-outline"
          size={80}
          color="#1f2937"
          style={styles.icon}
        />
        <Text style={styles.title}>User Profile</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Provider:</Text>
          <Text style={styles.value}>{user?.app_metadata.provider}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fb",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontWeight: "600",
    color: "#444",
  },
  value: {
    color: "#666",
    flexShrink: 1,
    marginLeft: 10,
    textAlign: "right",
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#c82333",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
