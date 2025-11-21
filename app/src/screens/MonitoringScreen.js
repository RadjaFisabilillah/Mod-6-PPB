import { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
// --- Tambahkan useNavigation dari React Navigation ---
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";

// Konstanta Pagination
const PAGE_SIZE = 10;

export function MonitoringScreen() {
  // --- Inisialisasi hook navigation ---
  const navigation = useNavigation();

  const {
    temperature,
    timestamp,
    connectionState,
    error: mqttError,
  } = useMqttSensor();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReadings = useCallback(async (page = 1) => {
    setLoading(true);
    setApiError(null);
    try {
      const result = await Api.getSensorReadings(page, PAGE_SIZE);

      setReadings(result.data ?? []);

      const totalCount = result.total || 0;
      setTotalPages(Math.ceil(totalCount / PAGE_SIZE) || 1);
      setCurrentPage(page);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReadings(currentPage);
    }, [fetchReadings, currentPage])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReadings(currentPage);
    } finally {
      setRefreshing(false);
    }
  }, [fetchReadings, currentPage]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      fetchReadings(nextPage);
    }
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      fetchReadings(prevPage);
    }
  };

  const handleDeleteReading = useCallback(
    (id) => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this single reading?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              try {
                await Api.deleteSensorReading(id);
                await fetchReadings(currentPage);
              } catch (err) {
                setApiError(`Failed to delete: ${err.message}`);
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    },
    [fetchReadings, currentPage]
  );

  const handleClearReadings = useCallback(() => {
    Alert.alert(
      "Confirm Clear History",
      "Are you sure you want to permanently delete ALL triggered sensor readings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await Api.clearSensorReadings();
              await fetchReadings(1);
            } catch (err) {
              setApiError(`Failed to clear history: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [fetchReadings]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.title}>Realtime Temperature</Text>
          <View style={styles.valueRow}>
            <Text style={styles.temperatureText}>
              {typeof temperature === "number"
                ? `${temperature.toFixed(2)}°C`
                : "--"}
            </Text>
          </View>
          <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
          {timestamp && (
            <Text style={styles.metaText}>
              Last update: {new Date(timestamp).toLocaleString()}
            </Text>
          )}
          {mqttError && (
            <Text style={styles.errorText}>MQTT error: {mqttError}</Text>
          )}
        </View>

        {/* --- TOMBOL UJI GESTURE BARU --- */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Detail")}
          style={styles.testButton}
        >
          <Text style={styles.testButtonText}>
            Go to Detail Page (Test Swipe Back Gesture)
          </Text>
        </TouchableOpacity>
        {/* ----------------------------------- */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Triggered Readings History (Page {currentPage} of {totalPages})
          </Text>
          <TouchableOpacity
            onPress={handleClearReadings}
            style={styles.clearButton}
          >
            <Ionicons name="trash-outline" size={18} color="#c82333" />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator />}
        </View>
        {apiError && (
          <Text style={styles.errorText}>
            Failed to load history: {apiError}
          </Text>
        )}
        <DataTable
          columns={[
            {
              key: "recorded_at",
              title: "Timestamp",
              render: (value) =>
                value ? new Date(value).toLocaleString() : "--",
            },
            {
              key: "temperature",
              title: "Temperature (°C)",
              render: (value) =>
                typeof value === "number"
                  ? `${Number(value).toFixed(2)}`
                  : "--",
            },
            {
              key: "threshold_value",
              title: "Threshold (°C)",
              render: (value) =>
                typeof value === "number"
                  ? `${Number(value).toFixed(2)}`
                  : "--",
            },
          ]}
          data={readings}
          keyExtractor={(item) => item.id}
          onDeleteItem={handleDeleteReading}
        />

        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={handlePreviousPage}
            disabled={currentPage === 1 || loading}
            style={[
              styles.paginationButton,
              (currentPage === 1 || loading) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Sebelumnya</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage === totalPages || loading}
            style={[
              styles.paginationButton,
              (currentPage === totalPages || loading) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Berikutnya</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
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
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ff7a59",
  },
  metaText: {
    marginTop: 8,
    color: "#555",
  },
  errorText: {
    marginTop: 8,
    color: "#c82333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    marginBottom: 20,
  },
  paginationButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // --- NEW STYLES FOR GESTURE TEST BUTTON ---
  testButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  testButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
