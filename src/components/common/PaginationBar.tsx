import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';

type Props = {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function PaginationBar({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  label = 'éléments',
}: Props) {
  if (total === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.meta}>
        {from}–{to} sur {total} {label}
      </Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, page <= 1 && styles.btnDisabled]}
          onPress={() => onPageChange(page - 1)}
          disabled={page <= 1}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={page <= 1 ? AppColors.textMuted : AppColors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.pageLabel}>
          {page} / {totalPages}
        </Text>
        <TouchableOpacity
          style={[styles.btn, page >= totalPages && styles.btnDisabled]}
          onPress={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={page >= totalPages ? AppColors.textMuted : AppColors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    flex: 1,
    fontSize: 12,
    color: AppColors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  pageLabel: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
});
