import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMINISTRATEUR' || user?.role === 'TRESORIER';

  // Generous padding to prevent overlap with Android navigation buttons (||| O <) and iOS indicator
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 10
    : Math.max(insets.bottom, 16) + 8;

  const barHeight = 56 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarStyle: {
          backgroundColor: AppColors.white,
          borderTopColor: AppColors.borderLight,
          borderTopWidth: 1,
          height: barHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="contributions"
        options={{
          title: 'Contributions',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="projets"
        options={{
          title: 'Projets',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="recus"
        options={{
          title: 'Mes Reçus',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: isAdmin ? 'Admin & Profil' : 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.profileTabIcon}>
              <Ionicons
                name={
                  isAdmin
                    ? focused
                      ? 'shield-checkmark'
                      : 'shield-checkmark-outline'
                    : focused
                    ? 'person'
                    : 'person-outline'
                }
                size={22}
                color={isAdmin ? AppColors.accent : color}
              />
              {isAdmin && <View style={styles.adminDot} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  profileTabIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: AppColors.accent,
  },
});
