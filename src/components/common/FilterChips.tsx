import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { AppColors } from '@/constants/colors';

export type FilterChip<T extends string = string> = {
  id: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  options: FilterChip<T>[];
  value: T;
  onChange: (id: T) => void;
};

export function FilterChips<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(opt.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            {opt.count !== undefined ? (
              <View style={[styles.count, active && styles.countActive]}>
                <Text style={[styles.countText, active && styles.countTextActive]}>{opt.count}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 6,
  },
  chipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  chipTextActive: {
    color: AppColors.white,
  },
  count: {
    minWidth: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: AppColors.borderLight,
    alignItems: 'center',
  },
  countActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: AppColors.textSecondary,
  },
  countTextActive: {
    color: AppColors.white,
  },
});
