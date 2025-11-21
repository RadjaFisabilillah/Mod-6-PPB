import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert, // Import Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons"; // Import icon
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext.js"; // Import useAuth

export function ControlScreen() {
  const { isAuthenticated, session } = useAuth(); // Get auth state
  const token = session?.access_token; // Get token for protected routes

  const [thresholdValue, setThresholdValue] = useState(30);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await Api.getThresholds();
      setHistory(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Hanya ambil data jika terautentikasi
      if (isAuthenticated) {
        fetchHistory();
      } else {
        setHistory([]);
        // Error akan ditampilkan di blok render jika !isAuthenticated
      }
    }, [fetchHistory, isAuthenticated])
  );

  const latestThreshold = useMemo(() => history?.[0]?.value ?? null, [history]);

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      // Check auth before submitting
      setError("Login is required to save a new threshold.");
      return;
    }

    const valueNumber = Number(thresholdValue);
    if (Number.isNaN(valueNumber)) {
      setError("Please enter a numeric threshold.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Pass token to protected API route
      await Api.createThreshold({ value: valueNumber, note }, token);
      setNote("");
      await fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [thresholdValue, note, fetchHistory, isAuthenticated, token]);

  // --- FITUR BARU: HAPUS SATU DATA ---
  const handleDeleteThreshold = useCallback(
    (id) => {
      if (!isAuthenticated) {
        // Check auth before action
        setError("Login is required to delete an entry.");
        return;
      }

      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this single threshold entry?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              try {
                // Pass token to protected API route
                await Api.deleteThreshold(id, token);
                await fetchHistory(); // Refresh data setelah menghapus
              } catch (err) {
                setError(`Failed to delete: ${err.message}`);
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    },
    [fetchHistory, isAuthenticated, token]
  );

  // --- FITUR BARU: HAPUS SEMUA DATA ---
  const handleClearThresholds = useCallback(() => {
    if (!isAuthenticated) {
      // Check auth before action
      setError("Login is required to clear history.");
      return;
    }

    Alert.alert(
      "Confirm Clear History",
      "Are you sure you want to permanently delete ALL threshold history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Pass token to protected API route
              await Api.clearThresholds(token);
              await fetchHistory(); // Refresh data setelah menghapus semua
            } catch (err) {
              setError(`Failed to clear history: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [fetchHistory, isAuthenticated, token]);

  // Block UI if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={[styles.container, styles.unauthorizedContainer]}>
          <Ionicons name="lock-closed-outline" size={60} color="#c82333" />
          <Text style={styles.unauthorizedText}>Akses Ditolak</Text>
          <Text style={styles.unauthorizedTextDetail}>
            Silakan masuk untuk mengakses fitur kontrol.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Configure Threshold</Text>
            {latestThreshold !== null && (
              <Text style={styles.metaText}>
                Current threshold: {Number(latestThreshold).toFixed(2)}°C
              </Text>
            )}
            <Text style={styles.label}>Threshold (°C)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(thresholdValue)}
              onChangeText={setThresholdValue}
            />
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              placeholder="Describe why you are changing the threshold"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Threshold</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Threshold History</Text>
            <TouchableOpacity
              onPress={handleClearThresholds}
              style={styles.clearButton}
            >
              <Ionicons name="trash-outline" size={18} color="#c82333" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            {loading && <ActivityIndicator />}
          </View>
          <DataTable
            columns={[
              {
                key: "created_at",
                title: "Saved At",
                render: (value) =>
                  value ? new Date(value).toLocaleString() : "--",
              },
              {
                key: "value",
                title: "Threshold (°C)",
                render: (value) =>
                  typeof value === "number"
                    ? `${Number(value).toFixed(2)}`
                    : "--",
              },
              {
                key: "note",
                title: "Note",
                render: (value) => value || "-",
              },
            ]}
            data={history}
            keyExtractor={(item) => item.id}
            onDeleteItem={handleDeleteThreshold} // Pasang handler delete
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fb",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  label: {
    marginTop: 16,
    fontWeight: "600",
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  metaText: {
    color: "#666",
  },
  errorText: {
    marginTop: 12,
    color: "#c82333",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  clearButtonText: {
    color: "#c82333",
    marginLeft: 4,
    fontWeight: "600",
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fb",
  },
  unauthorizedText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#c82333",
    marginTop: 10,
  },
  unauthorizedTextDetail: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
});
