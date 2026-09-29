import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { scrollInputIntoView } from '@/utils/scrollInputIntoView';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder = 'Rechercher…' }: Props) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={20} color={AppColors.textSecondary} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={AppColors.textMuted}
        value={value}
        onChangeText={onChange}
        onFocus={scrollInputIntoView}
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={AppColors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: AppColors.textPrimary,
  },
});
