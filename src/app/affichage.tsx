import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { DISPLAY_PREF_ITEMS, useDisplayPrefsStore } from '@/store/displayPrefsStore';

export default function AffichageScreen() {
  const prefs = useDisplayPrefsStore();

  return (
    <View style={styles.container}>
      <Header
        title="Éléments affichés"
        subtitle="Montrez seulement ce dont vous avez besoin"
        showBack
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/profil');
        }}
        variant="curved"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Ces choix s appliquent à l accueil et au tableau d administration. Ils ne suppriment pas les données.
        </Text>
        <Card style={styles.card}>
          {DISPLAY_PREF_ITEMS.map((item, idx) => {
            const on = prefs[item.key];
            const last = idx === DISPLAY_PREF_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.row, !last && styles.rowBorder]}
                onPress={() => prefs.toggle(item.key)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.area}>{item.area}</Text>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.hint}>{item.hint}</Text>
                </View>
                <View style={[styles.toggle, on && styles.toggleOn]}>
                  <Text style={styles.toggleText}>{on ? 'ON' : 'OFF'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  content: { padding: 20, paddingBottom: 40 },
  intro: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
  },
  card: { padding: 8, borderRadius: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  area: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.primary,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  toggle: {
    backgroundColor: '#94A3B8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleOn: { backgroundColor: AppColors.primary },
  toggleText: { fontSize: 11, fontWeight: '800', color: AppColors.white },
});
