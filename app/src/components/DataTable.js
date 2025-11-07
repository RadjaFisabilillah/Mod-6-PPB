import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons"; // Import icon

// DataTable sekarang menerima prop onDeleteItem
export function DataTable({ columns, data, keyExtractor, onDeleteItem }) {
  if (!columns?.length) {
    return null;
  }

  // Tambahkan kolom Aksi jika onDeleteItem ada
  const finalColumns = onDeleteItem
    ? [
        ...columns,
        {
          key: "action",
          title: "Action",
          isAction: true, // Marker untuk kolom aksi
        },
      ]
    : columns;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {finalColumns.map((column) => (
          <Text
            key={column.key}
            style={[
              styles.cell,
              styles.headerCell,
              column.isAction ? styles.actionCellWidth : {},
            ]}
          >
            {column.title}
          </Text>
        ))}
      </View>
      {data?.length ? (
        data.map((item, index) => (
          <View
            key={keyExtractor ? keyExtractor(item, index) : index}
            style={styles.dataRow}
          >
            {columns.map((column) => (
              <Text key={column.key} style={styles.cell}>
                {column.render
                  ? column.render(item[column.key], item)
                  : item[column.key]}
              </Text>
            ))}
            {onDeleteItem && (
              <View
                style={[
                  styles.cell,
                  styles.actionCellWidth,
                  styles.actionCellContent,
                ]}
              >
                <TouchableOpacity onPress={() => onDeleteItem(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#c82333" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No data available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f4f4f4",
  },
  dataRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  actionCellWidth: {
    flex: 0,
    width: 60, // Lebar khusus untuk tombol aksi
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  actionCellContent: {
    padding: 0, // Hapus padding default
  },
  headerCell: {
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: 13,
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
    color: "#9b9b9b",
  },
});
