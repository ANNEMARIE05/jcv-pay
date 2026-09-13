import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useFinanceStore } from '@/store/financeStore';

export default function EvenementDetailScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const { id } = useLocalSearchParams<{ id: string }>();
  const getEventById = useFinanceStore((s) => s.getEventById);
  const registerEvent = useFinanceStore((s) => s.registerEvent);
  const ev = getEventById(id || '');

  const [loading, setLoading] = useState(false);

  if (!ev) {
    return (
      <View style={styles.container}>
        <Header
          title="Événement"
          showBack
          onBack={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/projets');
          }}
        />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Événement introuvable.</Text>
          <Button
            title="Retour aux événements"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)/projets');
            }}
          />
        </View>
      </View>
    );
  }

  const handleRegisterFree = () => {
    setLoading(true);
    setTimeout(() => {
      registerEvent(ev.id);
      setLoading(false);
      Alert.alert(
        'Inscription confirmée !',
        `Vous êtes bien inscrit pour "${ev.titre}". Votre pass d entrée vous attend.`,
        [{ text: 'Super !', onPress: () => router.back() }]
      );
    }, 600);
  };

  const handlePayEvent = () => {
    router.push({
      pathname: '/paiement',
      params: {
        titre: `Inscription - ${ev.titre}`,
        type: 'EVENEMENT',
        montant: ev.tarif.toString(),
        evenementId: ev.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Détail de l événement"
        subtitle="Conférences & Rencontres"
        showBack
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/projets');
        }}
        variant="curved"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCardContainer}>
          <Card style={styles.mainCard} variant="elevated">
            <View style={styles.badgeRow}>
              <Badge
                label={ev.tarif === 0 ? 'Entrée Gratuite' : `${ev.tarif.toLocaleString('fr-FR')} FCFA`}
                variant={ev.tarif === 0 ? 'accent' : 'primary'}
                size="md"
              />
              {ev.estInscrit ? (
                <Badge label="Inscrit" variant="success" size="md" />
              ) : (
                <Badge label="Inscriptions Ouvertes" variant="warning" size="md" />
              )}
            </View>

            <Text style={styles.title}>{ev.titre}</Text>

            {ev.intervenant && (
              <View style={styles.speakerRow}>
                <Ionicons name="mic-outline" size={16} color={AppColors.accent} />
                <Text style={styles.speakerText}>
                  Orateur principal : <Text style={styles.speakerBold}>{ev.intervenant}</Text>
                </Text>
              </View>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color={AppColors.primary} />
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{ev.date}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color={AppColors.primary} />
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Horaire</Text>
                  <Text style={styles.infoValue}>{ev.heure}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color={AppColors.primary} />
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Lieu du rassemblement</Text>
                  <Text style={styles.infoValue}>{ev.lieu}</Text>
                </View>
              </View>
            </View>

            {/* Places Availability */}
            <View style={styles.placesRow}>
              <Ionicons name="people-outline" size={18} color={AppColors.textSecondary} />
              <Text style={styles.placesText}>
                {ev.placesReservees} inscrits sur {ev.placesDisponibles} places disponibles
              </Text>
            </View>
          </Card>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programme & Objectifs</Text>
          <Card style={styles.descCard}>
            <Text style={styles.descText}>{ev.description}</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
        {ev.estInscrit ? (
          <Button
            title="Vous êtes déjà inscrit (Voir mon pass)"
            onPress={() => router.push('/(tabs)/recus')}
            variant="secondary"
            size="lg"
          />
        ) : ev.tarif === 0 ? (
          <Button
            title="Confirmer mon inscription gratuite"
            onPress={handleRegisterFree}
            loading={loading}
            variant="primary"
            size="lg"
          />
        ) : (
          <Button
            title={`Régler l inscription (${ev.tarif.toLocaleString('fr-FR')} FCFA)`}
            onPress={handlePayEvent}
            variant="primary"
            size="lg"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  topCardContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  mainCard: {
    padding: 20,
    borderRadius: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  speakerText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  speakerBold: {
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 1,
  },
  placesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  placesText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  descCard: {
    padding: 16,
    borderRadius: 16,
  },
  descText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
});
