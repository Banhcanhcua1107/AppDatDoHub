// src/screens/TableSelectionScreen.tsx

// Dòng code đã được sửa đúng
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import { supabase } from '../../services/supabase';
import Icon from 'react-native-vector-icons/Ionicons';

// --- Định nghĩa kiểu dữ liệu ---
interface Table {
  id: string;
  name: string;
  status: 'Trống' | 'Đang phục vụ' | string;
}

export type TableSelectionParams = {
  mode: 'single' | 'multiple';
  action: 'transfer' | 'merge' | 'split';
  sourceRoute: string;
  sourceTable?: { id: string; name: string };
  maxSelection?: number;
};

type Props = NativeStackScreenProps<AppStackParamList, 'TableSelection'>;

// --- Component con: Hiển thị một bàn ---
const TableItem: React.FC<{
  item: Table;
  isSelected: boolean;
  onPress: () => void;
  isSourceTable: boolean;
}> = ({ item, isSelected, onPress, isSourceTable }) => {
  const isOccupied = item.status === 'Đang phục vụ';
  const isDisabled = isSourceTable;
  return (
    <TouchableOpacity
      style={[
        styles.tableItem,
        isOccupied ? styles.occupied : styles.empty,
        isSelected && styles.selected,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {isSourceTable && <Icon name="flag" size={16} color="#F97316" style={styles.sourceIcon} />}
      {isSelected && <Icon name="checkmark-circle" size={24} color="#fff" style={styles.checkIcon} />}
      <Text style={[styles.tableName, isOccupied && styles.lightText]}>{item.name}</Text>
      <Text style={[styles.tableStatus, isOccupied && styles.lightText]}>{isSourceTable ? 'Bàn gốc' : item.status}</Text>
    </TouchableOpacity>
  );
};

// --- Component chính: Màn hình chọn bàn ---
const TableSelectionScreen = ({ route, navigation }: Props) => {
  const { mode, action, sourceTable, maxSelection = 10 } = route.params;

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set());

  // --- Xử lý khi xác nhận lựa chọn ---
  const handleConfirmSelection = useCallback(() => {
    console.log(`Action: ${action}`);
    console.log('Selected Table IDs:', Array.from(selectedTableIds));
    Alert.alert(
        "Đã chọn", 
        `Bạn đã chọn các bàn: ${Array.from(selectedTableIds).join(', ')}.\nLogic xử lý sẽ được thực hiện ở đây.`
    );
    navigation.goBack();
  }, [action, selectedTableIds, navigation]);

  // --- Thiết lập Header động ---
  useLayoutEffect(() => {
    let title = 'Chọn bàn';
    if (action === 'transfer') title = 'Chọn bàn muốn chuyển đến';
    if (action === 'merge') title = 'Chọn bàn để gộp';
    if (action === 'split') title = 'Chọn bàn trống để tách món';

    navigation.setOptions({
      title,
      headerRight: () => (
        <TouchableOpacity onPress={handleConfirmSelection} disabled={selectedTableIds.size === 0}>
          <Text style={[styles.headerButton, selectedTableIds.size === 0 && styles.headerButtonDisabled]}>
            Xong
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedTableIds, action, handleConfirmSelection]);

  // --- Tải danh sách bàn từ Supabase ---
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tables')
        .select('id, name, status')
        .order('name', { ascending: true });

      if (error) {
        Alert.alert('Lỗi', 'Không thể tải danh sách bàn.');
      } else {
        setTables(data as Table[]);
      }
      setLoading(false);
    };
    fetchTables();
  }, []);

  // --- Xử lý logic chọn bàn ---
  const handleSelectTable = (tableId: string) => {
    const newSelection = new Set(selectedTableIds);
    if (mode === 'single') {
      newSelection.clear();
      newSelection.add(tableId);
    } else {
      if (newSelection.has(tableId)) {
        newSelection.delete(tableId);
      } else {
        if (newSelection.size < maxSelection) {
          newSelection.add(tableId);
        } else {
          Alert.alert('Giới hạn', `Bạn chỉ có thể chọn tối đa ${maxSelection} bàn.`);
        }
      }
    }
    setSelectedTableIds(newSelection);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3B82F6" style={styles.centered} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tables}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TableItem
            item={item}
            isSelected={selectedTableIds.has(item.id)}
            onPress={() => handleSelectTable(item.id)}
            isSourceTable={item.id === sourceTable?.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>Không tìm thấy bàn nào.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 8 },
  tableItem: { flex: 1, margin: 8, aspectRatio: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 8, borderWidth: 2, borderColor: 'transparent' },
  empty: { backgroundColor: '#FFFFFF' },
  occupied: { backgroundColor: '#6B7280' },
  selected: { borderColor: '#3B82F6', transform: [{ scale: 1.05 }] },
  disabled: { opacity: 0.5 },
  tableName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  tableStatus: { fontSize: 12, color: '#4B5563', marginTop: 4 },
  lightText: { color: '#FFFFFF' },
  checkIcon: { position: 'absolute', top: 8, right: 8, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  sourceIcon: { position: 'absolute', top: 8, left: 8 },
  headerButton: { color: '#3B82F6', fontSize: 16, fontWeight: 'bold' },
  headerButtonDisabled: { color: '#9CA3AF' },
});

export default TableSelectionScreen;