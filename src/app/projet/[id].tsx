import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { ProgressBar } from '@/components/common/ProgressBar';
import { useFinanceStore } from '@/store/financeStore';

const DONATION_TIERS = [
  { id: 't1', label: 'Bâtisseur Bronze', amount: 10000, desc: 'Participe aux matériaux de base' },
  { id: 't2', label: 'Bâtisseur Argent', amount: 25000, desc: 'Financement d un pan de structure' },
  { id: 't3', label: 'Bâtisseur Or', amount: 50000, desc: 'Poutre & gros œuvre' },
  { id: 't4', label: 'Bâtisseur Diamant', amount: 100000, desc: 'Parrainage d un espace dédié' },
];

export default function ProjetDetailScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const { id } = useLocalSearchParams<{ id: string }>();
  const getProjectById = useFinanceStore((s) => s.getProjectById);
  const projet = getProjectById(id || '');

  const [selectedTier, setSelectedTier] = useState<string>('t2');
  const [customAmount, setCustomAmount] = useState<string>('25000');

  if (!projet) {
    return (
      <View style={styles.container}>
        <Header
          title="Détail du projet"
          showBack
          onBack={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/projets');
          }}
        />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Projet introuvable.</Text>
          <Button
            title="Retour aux projets"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)/projets');
            }}
          />
        </View>
      </View>
    );
  }

  const progressPct = Math.min(
    Math.round((projet.montantCollecte / projet.objectif) * 100),
    100
  );

  const handleSelectTier = (tier: typeof DONATION_TIERS[0]) => {
    setSelectedTier(tier.id);
    setCustomAmount(tier.amount.toString());
  };

  const handleProceed = () => {
    const amt = parseInt(customAmount, 10);
    if (!amt || amt <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant valide.');
      return;
    }

    router.push({
      pathname: '/paiement',
      params: {
        titre: `Don - ${projet.titre}`,
        type: 'PROJET',
        montant: amt.toString(),
        projetId: projet.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Détail du projet"
        subtitle={projet.categorie}
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
        {/* Project Header Card */}
        <View style={styles.topCardContainer}>
          <Card style={styles.mainCard} variant="elevated">
            <View style={styles.badgeRow}>
              <View style={styles.catPill}>
                <Text style={styles.catPillText}>{projet.categorie}</Text>
              </View>
              <Badge label="En cours de collecte" variant="accent" size="sm" />
            </View>

            <Text style={styles.title}>{projet.titre}</Text>
            <Text style={styles.organizer}>
              Organisé par : <Text style={styles.organizerBold}>{projet.organisateur}</Text>
            </Text>

            {/* Financial Gauge */}
            <View style={styles.gaugeBox}>
              <View style={styles.gaugeHeader}>
                <Text style={styles.collectedNumber}>
                  {projet.montantCollecte.toLocaleString('fr-FR')} FCFA
                </Text>
                <Text style={styles.pctNumber}>{progressPct}%</Text>
              </View>

              <ProgressBar progress={progressPct} height={10} color={AppColors.accent} />

              <View style={styles.gaugeFooter}>
                <Text style={styles.footerLabel}>
                  Objectif : {projet.objectif.toLocaleString('fr-FR')} FCFA
                </Text>
                <Text style={styles.footerLabel}>Échéance : {projet.dateFin}</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{projet.participantsCount}</Text>
                <Text style={styles.statLabel}>Contributeurs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumberGreen}>
                  {projet.maContribution.toLocaleString('fr-FR')} F
                </Text>
                <Text style={styles.statLabel}>Ma participation</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {((projet.objectif - projet.montantCollecte) / 1000000).toFixed(1)}M F
                </Text>
                <Text style={styles.statLabel}>Reste à réunir</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos de ce projet</Text>
          <Card style={styles.descCard}>
            <Text style={styles.descText}>{projet.description}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={AppColors.primary} />
              <Text style={styles.locationText}>{projet.lieu || 'Paroisse centrale'}</Text>
            </View>
          </Card>
        </View>

        {/* Tier Selector Section (Adapted from Screen 8 "Select Your Seat / Contribution Tier") */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir votre palier de don</Text>
          <Text style={styles.sectionSubtitle}>
            Sélectionnez un palier d engagement ou entrez un montant personnalisé
          </Text>

          <View style={styles.tiersGrid}>
            {DONATION_TIERS.map((tier) => {
              const isSelected = selectedTier === tier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[styles.tierCard, isSelected && styles.tierCardSelected]}
                  onPress={() => handleSelectTier(tier)}
                  activeOpacity={0.8}
                >
                  <View style={styles.tierHeader}>
                    <Text style={[styles.tierTitle, isSelected && styles.tierTitleSelected]}>
                      {tier.label}
                    </Text>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </View>
                  <Text style={[styles.tierAmount, isSelected && styles.tierAmountSelected]}>
                    {tier.amount.toLocaleString('fr-FR')} FCFA
                  </Text>
                  <Text style={[styles.tierDesc, isSelected && styles.tierDescSelected]}>
                    {tier.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Amount input */}
          <View style={styles.customAmountBox}>
            <Text style={styles.customAmountLabel}>Ou montant libre (FCFA)</Text>
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={(val) => {
                  setCustomAmount(val);
                  setSelectedTier('');
                }}
                placeholder="Montant en FCFA"
              />
              <Text style={styles.currencyTag}>FCFA</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
        <View>
          <Text style={styles.totalLabel}>Montant sélectionné</Text>
          <Text style={styles.totalValue}>
            {parseInt(customAmount || '0', 10).toLocaleString('fr-FR')} FCFA
          </Text>
        </View>
        <Button
          title="Continuer vers le paiement"
          onPress={handleProceed}
          size="md"
          variant="primary"
          style={styles.proceedBtn}
        />
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
    marginBottom: 10,
  },
  catPill: {
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  organizer: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  organizerBold: {
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  gaugeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectedNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
  },
  pctNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.accent,
  },
  gaugeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  statNumberGreen: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.success,
  },
  statLabel: {
    fontSize: 10,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: AppColors.border,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  descCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  descText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.primary,
  },
  tiersGrid: {
    gap: 10,
  },
  tierCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  tierCardSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryMuted,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  tierTitleSelected: {
    color: AppColors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: AppColors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  tierAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 2,
  },
  tierAmountSelected: {
    color: AppColors.primary,
  },
  tierDesc: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  tierDescSelected: {
    color: AppColors.primaryDark,
  },
  customAmountBox: {
    marginTop: 14,
  },
  customAmountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 6,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  customInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  currencyTag: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textMuted,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
  },
  proceedBtn: {
    width: '60%',
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
