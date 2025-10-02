// src/screens/TableSelectionScreen.tsx

import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../constants/routes';
import { supabase } from '../../services/supabase';
import Icon from 'react-native-vector-icons/Ionicons';

interface Table { id: string; name: string; status: 'Trống' | 'Đang phục vụ' | string; }
export type TableSelectionParams = { mode: 'single' | 'multiple'; action: 'transfer' | 'merge' | 'split' | 'group'; sourceRoute: string; sourceTable?: { id: string; name: string; orderId?: string }; maxSelection?: number; };
type Props = NativeStackScreenProps<AppStackParamList, 'TableSelection'>;

const TableItem: React.FC<{ item: Table; isSelected: boolean; onPress: () => void; isSourceTable: boolean; }> = ({ item, isSelected, onPress, isSourceTable }) => {
  const isOccupied = item.status === 'Đang phục vụ';
  const isDisabled = isSourceTable;
  return (
    <TouchableOpacity style={[ styles.tableItem, isOccupied ? styles.occupied : styles.empty, isSelected && styles.selected, isDisabled && styles.disabled, ]} onPress={onPress} disabled={isDisabled} >
      {isSourceTable && <Icon name="flag" size={16} color="#F97316" style={styles.sourceIcon} />}
      {isSelected && <Icon name="checkmark-circle" size={24} color="#fff" style={styles.checkIcon} />}
      <Text style={[styles.tableName, isOccupied && styles.lightText]}>{item.name}</Text>
      <Text style={[styles.tableStatus, isOccupied && styles.lightText]}>{isSourceTable ? 'Bàn gốc' : item.status}</Text>
    </TouchableOpacity>
  );
};


const handleGroupTables = async (orderId: string, targetTables: Table[]) => {
    if (!orderId || targetTables.length === 0) throw new Error("Thiếu thông tin order hoặc bàn đích.");
    const targetTableIds = targetTables.map(t => t.id);
    const linksToInsert = targetTableIds.map(tableId => ({ order_id: orderId, table_id: tableId }));
    const { error: insertLinksError } = await supabase.from('order_tables').insert(linksToInsert);
    if (insertLinksError) throw insertLinksError;
    const { error: updateStatusError } = await supabase.from('tables').update({ status: 'Đang phục vụ' }).in('id', targetTableIds);
    if (updateStatusError) throw updateStatusError;
    return true;
}

const handleTransferTable = async (sourceTableId: string, targetTable: Table) => {
    if (!sourceTableId || !targetTable) throw new Error("Thiếu thông tin bàn nguồn hoặc bàn đích.");

    // 1. Tìm liên kết order_tables của bàn nguồn để lấy order_id
    const { data: sourceLink, error: linkError } = await supabase
        .from('order_tables')
        .select('order_id')
        .eq('table_id', sourceTableId)
        .limit(1).single();

    if (linkError || !sourceLink) throw new Error("Không tìm thấy order của bàn gốc.");
    const orderId = sourceLink.order_id;

    // 2. Cập nhật liên kết trong order_tables: đổi table_id từ bàn nguồn sang bàn đích
    const { error: updateLinkError } = await supabase
        .from('order_tables')
        .update({ table_id: targetTable.id })
        .match({ order_id: orderId, table_id: sourceTableId });

    if (updateLinkError) throw updateLinkError;

    // 3. Cập nhật trạng thái của 2 bàn
    await supabase.from('tables').update({ status: 'Trống' }).eq('id', sourceTableId);
    await supabase.from('tables').update({ status: 'Đang phục vụ' }).eq('id', targetTable.id);

    return true;
}
const handleMergeOrder = async (sourceOrderId: string, targetTables: Table[]) => {
    if (!sourceOrderId || targetTables.length === 0) throw new Error("Thiếu thông tin.");
    
    const targetTableIds = targetTables.map(t => t.id);

    // 1. Tìm order_id của các bàn đích
    const { data: targetLinks, error: linksError } = await supabase
        .from('order_tables')
        .select('orders!inner(id)')
        .in('table_id', targetTableIds)
        .eq('orders.status', 'pending');

    if (linksError || !targetLinks) throw new Error("Không tìm thấy order của các bàn được chọn.");
    
    const targetOrderIds = targetLinks.map(link => link.orders?.[0]?.id).filter(id => !!id);
    if(targetOrderIds.length !== targetTableIds.length) throw new Error("Một vài bàn được chọn không có order hợp lệ.");

    // 2. Chuyển tất cả order_items từ các order đích sang order nguồn
    await supabase.from('order_items').update({ order_id: sourceOrderId }).in('order_id', targetOrderIds);

    // 3. Xóa các order đích (giờ đã trống)
    await supabase.from('orders').delete().in('id', targetOrderIds);

    // 4. Cập nhật trạng thái bàn đích thành 'Trống'
    await supabase.from('tables').update({ status: 'Trống' }).in('id', targetTableIds);

    return true;
}

const TableSelectionScreen = ({ route, navigation }: Props) => {
  const { mode, action, sourceTable } = route.params;
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set());

  const handleConfirmSelection = useCallback(async () => {
    const selectedIds = Array.from(selectedTableIds);
    if (selectedIds.length === 0 || !sourceTable) return;
    
    const selectedTables = tables.filter(t => selectedIds.includes(t.id));
    const selectedTablesInfo = selectedTables.map(t => t.name).join(', ');

    switch(action) {
        case 'group':
            if (!sourceTable.orderId) { Alert.alert("Lỗi", "Không tìm thấy order của bàn gốc."); return; }
            Alert.alert( "Xác nhận Gộp Bàn", `Bạn có chắc muốn gộp các bàn [${selectedTablesInfo}] vào chung một order với nhóm bàn ${sourceTable.name}?`,
                [{ text: "Hủy" }, { text: "Xác nhận", onPress: async () => {
                    setLoading(true);
                    try {
                        await handleGroupTables(sourceTable.orderId!, selectedTables);
                        Alert.alert("Thành công", `Đã gộp bàn thành công.`);
                        navigation.goBack(); 
                    } catch (error: any) { Alert.alert("Lỗi", "Không thể gộp bàn: " + error.message); } 
                    finally { setLoading(false); }
                }}]
            );
            break;

        case 'transfer':
            const targetTable = selectedTables[0];
            Alert.alert( "Xác nhận Chuyển bàn", `Bạn có chắc muốn chuyển toàn bộ order từ ${sourceTable.name} sang ${targetTable.name}?`,
                [{ text: "Hủy" }, { text: "Xác nhận", onPress: async () => {
                    setLoading(true);
                    try {
                        await handleTransferTable(sourceTable.id, targetTable);
                        Alert.alert("Thành công", `Đã chuyển order sang bàn ${targetTable.name}.`);
                        navigation.goBack(); 
                    } catch (error: any) { Alert.alert("Lỗi", "Không thể chuyển bàn: " + error.message); } 
                    finally { setLoading(false); }
                }}]
            );
            break;

        case 'merge':
             if (!sourceTable.orderId) { Alert.alert("Lỗi", "Không tìm thấy order của bàn gốc."); return; }
             Alert.alert( "Xác nhận Ghép order", `Toàn bộ order của bàn [${selectedTablesInfo}] sẽ được gộp vào bàn ${sourceTable.name}. Các bàn được gộp sẽ bị xóa order. Bạn có chắc chắn?`,
                [{ text: "Hủy" }, { text: "Xác nhận", onPress: async () => {
                    setLoading(true);
                    try {
                        await handleMergeOrder(sourceTable.orderId!, selectedTables);
                        Alert.alert("Thành công", `Đã ghép order vào bàn ${sourceTable.name}.`);
                        navigation.goBack(); 
                    } catch (error: any) { Alert.alert("Lỗi", "Không thể ghép order: " + error.message); } 
                    finally { setLoading(false); }
                }}]
            );
            break;
    }
  }, [action, selectedTableIds, navigation, sourceTable, tables]);

  useLayoutEffect(() => {
    let title = 'Chọn bàn';
    if (action === 'transfer') title = 'Chọn bàn muốn chuyển đến';
    if (action === 'merge') title = 'Chọn bàn để gộp';
    if (action === 'group') title = 'Chọn bàn trống để gộp chung';
    if (action === 'split') title = 'Chọn bàn trống để tách món';
    navigation.setOptions({
      title,
      headerRight: () => ( 
        <TouchableOpacity onPress={handleConfirmSelection} disabled={selectedTableIds.size === 0}>
           <Text style={[styles.headerButton, selectedTableIds.size === 0 && styles.headerButtonDisabled]}>Xong</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedTableIds, action, handleConfirmSelection]);

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tables').select('id, name, status').order('name', { ascending: true });
      if (error) { Alert.alert('Lỗi', 'Không thể tải danh sách bàn.'); } else { setTables(data as Table[]); }
      setLoading(false);
    };
    fetchTables();
  }, []);

  const handleSelectTable = (tableId: string) => {
    const newSelection = new Set(selectedTableIds);
    const targetTable = tables.find(t => t.id === tableId);
    if (!targetTable) return;
    if(action === 'transfer' && targetTable.status !== 'Trống') { Alert.alert("Không hợp lệ", "Chuyển bàn chỉ có thể chọn bàn còn trống."); return; }
    if(action === 'merge' && targetTable.status !== 'Đang phục vụ') { Alert.alert("Không hợp lệ", "Gộp order phải chọn bàn đang phục vụ."); return; }
    if(action === 'group' && targetTable.status !== 'Trống') { Alert.alert("Không hợp lệ", "Gộp bàn chỉ có thể chọn bàn còn trống."); return; }
    if (mode === 'single') { newSelection.clear(); newSelection.add(tableId); } 
    else { if (newSelection.has(tableId)) { newSelection.delete(tableId); } else { newSelection.add(tableId); } }
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
        ListEmptyComponent={<View style={styles.centered}><Text>Không tìm thấy bàn nào.</Text></View>}
      />
    </SafeAreaView>
  );
}; // <--- [SỬA LỖI] THÊM DẤU NGOẶC NHỌN NÀY VÀO

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