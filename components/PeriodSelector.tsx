// components/PeriodSelector.tsx (Tạo component này trong thư mục components)

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const periods = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'yesterday', label: 'Hôm qua' },
    { key: 'this_week', label: 'Tuần này' },
    { key: 'this_month', label: 'Tháng này' },
];

interface PeriodSelectorProps {
    onPeriodChange: (period: string) => void;
}

export default function PeriodSelector({ onPeriodChange }: PeriodSelectorProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('today');

    const handleSelect = (period: string) => {
        setSelectedPeriod(period);
        onPeriodChange(period);
    };

    return (
        <View style={styles.container}>
            {periods.map(p => (
                <TouchableOpacity
                    key={p.key}
                    style={[styles.chip, selectedPeriod === p.key && styles.activeChip]}
                    onPress={() => handleSelect(p.key)}
                >
                    <Text style={[styles.chipText, selectedPeriod === p.key && styles.activeChipText]}>{p.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    activeChip: {
        backgroundColor: '#3B82F6',
    },
    chipText: {
        color: '#475569',
        fontWeight: '500',
    },
    activeChipText: {
        color: '#fff',
        fontWeight: '600',
    },
});