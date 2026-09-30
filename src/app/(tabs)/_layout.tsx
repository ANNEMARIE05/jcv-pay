import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { canManageMoney, canManagePeople, isStaff } from '@/constants/roles';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = canManagePeople(user?.role);
  const isTreasurer = canManageMoney(user?.role);
  const staff = isStaff(user?.role);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Generous padding to prevent overlap with Android navigation buttons (||| O <) and iOS indicator
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 10
    : Math.max(insets.bottom, 16) + 8;

  const barHeight = 56 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
        animation: 'fade',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isAdmin ? 'Gestion' : isTreasurer ? 'Caisse' : 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                isAdmin
                  ? focused
                    ? 'people'
                    : 'people-outline'
                  : isTreasurer
                    ? focused
                      ? 'cash'
                      : 'cash-outline'
                    : focused
                      ? 'home'
                      : 'home-outline'
              }
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
        name="payeurs"
        options={{
          title: 'Fidèles',
          href: staff ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
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
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
