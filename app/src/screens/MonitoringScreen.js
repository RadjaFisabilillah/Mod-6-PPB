import { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert, // Import Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons"; // Import icon
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";

export function MonitoringScreen() {
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

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await Api.getSensorReadings();
      setReadings(data ?? []);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReadings();
    }, [fetchReadings])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReadings();
    } finally {
      setRefreshing(false);
    }
  }, [fetchReadings]);

  // --- FITUR BARU: HAPUS SATU DATA ---
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
                await fetchReadings(); // Refresh data setelah menghapus
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
    [fetchReadings]
  );

  // --- FITUR BARU: HAPUS SEMUA DATA ---
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
              await fetchReadings(); // Refresh data setelah menghapus semua
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Triggered Readings History</Text>
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
          onDeleteItem={handleDeleteReading} // Pasang handler delete
        />
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
});
