// DEBUG_TRANSACTIONS.ts
// Test file to debug transactions query

import { supabase } from './services/supabase';

export const testTransactionsQuery = async () => {
  try {
    console.log('🔍 Testing transactions query...');

    // First, get table structure
    const { data: tableInfo, error: infoError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (infoError) {
      console.error('❌ Error fetching table info:', infoError);
      return;
    }

    console.log('📊 Orders table structure:', Object.keys(tableInfo?.[0] || {}));

    // Then try the actual query
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    console.log('✅ Orders data:', orders);
    return orders;
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};
