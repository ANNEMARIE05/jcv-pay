import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { AppColors } from '@/constants/colors';

export interface TabOption<T = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsSelectorProps<T = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChangeTab: (id: T) => void;
  scrollable?: boolean;
  style?: ViewStyle;
  variant?: 'pill' | 'segmented';
}

export function TabsSelector<T extends string>({
  tabs,
  activeTab,
  onChangeTab,
  scrollable = false,
  style,
  variant = 'pill',
}: TabsSelectorProps<T>) {
  const content = (
    <View
      style={[
        variant === 'segmented' ? styles.segmentedContainer : styles.pillContainer,
        style,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onChangeTab(tab.id)}
            style={[
              variant === 'segmented' ? styles.segmentedItem : styles.pillItem,
              isActive &&
                (variant === 'segmented'
                  ? styles.segmentedItemActive
                  : styles.pillItemActive),
            ]}
            activeOpacity={0.7}
          >
            {tab.icon && <View style={styles.iconSlot}>{tab.icon}</View>}
            <Text
              style={[
                variant === 'segmented' ? styles.segmentedText : styles.pillText,
                isActive &&
                  (variant === 'segmented'
                    ? styles.segmentedTextActive
                    : styles.pillTextActive),
              ]}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && (
              <View
                style={[
                  styles.badge,
                  isActive ? styles.badgeActive : styles.badgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isActive ? styles.badgeTextActive : styles.badgeTextInactive,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  pillItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AppColors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillItemActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  pillTextActive: {
    color: AppColors.white,
    fontWeight: '700',
  },
  // Segmented style
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 14,
    padding: 4,
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
  },
  segmentedItemActive: {
    backgroundColor: AppColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  segmentedTextActive: {
    color: AppColors.primary,
    fontWeight: '700',
  },
  iconSlot: {
    marginRight: 6,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeInactive: {
    backgroundColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: AppColors.white,
  },
  badgeTextInactive: {
    color: AppColors.textSecondary,
  },
});
