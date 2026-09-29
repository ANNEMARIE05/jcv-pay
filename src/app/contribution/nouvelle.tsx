import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';
import { useAuthStore } from '@/store/authStore';
import { TypeContribution } from '@/types';

const CONTRIBUTION_TYPES: { id: TypeContribution; label: string; icon: any }[] = [
  { id: 'DIME', label: 'Dîme (10%)', icon: 'cash-outline' },
  { id: 'OFFRANDE', label: 'Offrande', icon: 'heart-outline' },
  { id: 'COTISATION', label: 'Cotisation', icon: 'calendar-outline' },
  { id: 'PROJET', label: 'Projet Temple', icon: 'business-outline' },
  { id: 'EPARGNE', label: 'Épargne & Entraide', icon: 'wallet-outline' },
  { id: 'LIBRE', label: 'Don Libre', icon: 'gift-outline' },
];

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function NouvelleContributionScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const params = useLocalSearchParams<{
    type?: TypeContribution;
    titre?: string;
    preselectedAmount?: string;
  }>();

  const user = useAuthStore((s) => s.user);

  const [selectedType, setSelectedType] = useState<TypeContribution>(
    params.type || 'DIME'
  );
  const [amount, setAmount] = useState<string>(params.preselectedAmount || '25000');
  const [titre, setTitre] = useState<string>(params.titre || '');
  const [donateurNom, setDonateurNom] = useState<string>(
    user ? `${user.prenom} ${user.nom}`.trim() : ''
  );
  const [telephone, setTelephone] = useState<string>(user?.telephone || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donateForOther, setDonateForOther] = useState(false);
  const [intention, setIntention] = useState('');

  const currentUserName = user ? `${user.prenom} ${user.nom}`.trim() : 'Ezekiel';
  const currentUserPhone = user?.telephone || '+225 07 48 92 10 33';

  const handleProceed = () => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }

    let finalNom = currentUserName;
    let finalPhone = currentUserPhone;

    if (isAnonymous) {
      finalNom = 'Donateur Anonyme';
    } else if (donateForOther) {
      if (!donateurNom.trim()) {
        Alert.alert('Nom requis', 'Veuillez saisir le nom de la personne pour qui vous donnez.');
        return;
      }
      finalNom = donateurNom.trim();
      finalPhone = telephone.trim() || currentUserPhone;
    }

    const typeConfig = CONTRIBUTION_TYPES.find((t) => t.id === selectedType);
    const finalTitre =
      titre.trim() ||
      (typeConfig ? typeConfig.label : 'Contribution') +
        ` - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;

    router.push({
      pathname: '/paiement',
      params: {
        titre: finalTitre,
        type: selectedType,
        montant: numAmount.toString(),
        donateurNom: finalNom,
        donateurTelephone: finalPhone,
      },
    });
  };

  return (
    <KeyboardAwareScreen
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
      header={
        <Header
          title="Nouvelle contribution"
          subtitle="Don & Engagement financier"
          showBack
          onBack={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/contributions');
          }}
          variant="curved"
        />
      }
      footer={
        <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
          <View>
            <Text style={styles.bottomLabel}>Montant à valider</Text>
            <Text style={styles.bottomValue}>
              {parseInt(amount || '0', 10).toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <Button
            title="Voir comment verser"
            onPress={handleProceed}
            size="lg"
            variant="primary"
            style={styles.bottomBtn}
          />
        </View>
      }
    >
          {/* Section 1: Type de contribution */}
          <View style={styles.cardWrapper}>
            <Card style={styles.card} variant="elevated">
              <Text style={styles.sectionLabel}>Type de contribution</Text>
              <View style={styles.typeGrid}>
                {CONTRIBUTION_TYPES.map((t) => {
                  const isSelected = selectedType === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.typeBtn, isSelected && styles.typeBtnSelected]}
                      onPress={() => setSelectedType(t.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={t.icon}
                        size={20}
                        color={isSelected ? AppColors.primary : AppColors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeText,
                          isSelected && styles.typeTextSelected,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Section 2: Choix du montant */}
              <Text style={[styles.sectionLabel, { marginTop: 18 }]}>
                Montant du don (FCFA)
              </Text>
              <View style={styles.presetsRow}>
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = amount === amt.toString();
                  return (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.presetBtn,
                        isSelected && styles.presetBtnSelected,
                      ]}
                      onPress={() => setAmount(amt.toString())}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          isSelected && styles.presetTextSelected,
                        ]}
                      >
                        {(amt / 1000).toString()}k F
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="Ou montant libre personnalisé"
                placeholder="Ex: 75 000"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                leftIcon={<Ionicons name="cash-outline" size={20} color={AppColors.textSecondary} />}
                containerStyle={{ marginTop: 12, marginBottom: 0 }}
              />
            </Card>
          </View>

          {/* Section 3: Donateur details (Automatique si connecté) */}
          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <View style={styles.contributorHeaderRow}>
                <Text style={styles.sectionLabel}>Identité du contributeur</Text>
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark-circle" size={14} color={AppColors.success} />
                  <Text style={styles.verifiedTagText}>Automatique</Text>
                </View>
              </View>

              {!donateForOther && !isAnonymous && (
                <View style={styles.autoIdentityCard}>
                  <View style={styles.autoAvatar}>
                    <Ionicons name="person" size={22} color={AppColors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.autoName}>{currentUserName}</Text>
                    <Text style={styles.autoDetails}>
                      Matricule : {user?.matricule || 'JCV-MBR-1042'}
                    </Text>
                    <Text style={styles.autoPhone}>{currentUserPhone}</Text>
                  </View>
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={14} color={AppColors.primary} />
                  </View>
                </View>
              )}

              {/* Toggle 1: Don anonyme */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  setIsAnonymous(!isAnonymous);
                  if (!isAnonymous) setDonateForOther(false);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
                  {isAnonymous && <Ionicons name="checkmark" size={14} color={AppColors.white} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Don strictement anonyme</Text>
                  <Text style={styles.optionSubtitle}>
                    Votre nom ne sera pas affiché sur les bilans publics de l église.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Toggle 2: Donner pour un tiers */}
              {!isAnonymous && (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setDonateForOther(!donateForOther)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, donateForOther && styles.checkboxChecked]}>
                    {donateForOther && <Ionicons name="checkmark" size={14} color={AppColors.white} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>Donner au nom d un proche ou d une famille</Text>
                    <Text style={styles.optionSubtitle}>
                      Personnaliser le nom qui figurera sur le reçu officiel.
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Champs conditionnels si donner pour un tiers */}
              {donateForOther && !isAnonymous && (
                <View style={styles.customBeneficiaryBox} pointerEvents="auto">
                  <Input
                    label="Nom & Prénom du bénéficiaire / proche"
                    placeholder="Ex: Famille Kouamé"
                    value={donateurNom}
                    onChangeText={setDonateurNom}
                    leftIcon={<Ionicons name="people-outline" size={20} color={AppColors.textSecondary} />}
                  />
                  <Input
                    label="Numéro de Téléphone (facultatif)"
                    placeholder="+225 07 00 00 00 00"
                    value={telephone}
                    onChangeText={setTelephone}
                    keyboardType="phone-pad"
                    leftIcon={<Ionicons name="call-outline" size={20} color={AppColors.textSecondary} />}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
              )}

              {/* Intention de prière */}
              <Input
                label="Intention ou motif particulier (facultatif)"
                placeholder="Ex: Action de grâce pour la paix et la santé"
                value={intention}
                onChangeText={setIntention}
                leftIcon={<Ionicons name="chatbox-outline" size={20} color={AppColors.textSecondary} />}
                containerStyle={{ marginTop: 14, marginBottom: 0 }}
              />
            </Card>
          </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  cardWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: '#FAFCFC',
  },
  typeBtnSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryMuted,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
    flex: 1,
  },
  typeTextSelected: {
    color: AppColors.primary,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCFC',
  },
  presetBtnSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryMuted,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  presetTextSelected: {
    color: AppColors.primary,
  },
  contributorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.success,
  },
  autoIdentityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    marginBottom: 14,
  },
  autoAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoName: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  autoDetails: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 1,
  },
  autoPhone: {
    fontSize: 11,
    color: AppColors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  optionSubtitle: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 1,
    lineHeight: 15,
  },
  customBeneficiaryBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: AppColors.white,
  },
  checkboxChecked: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  anonymousText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  bottomValue: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
  },
  bottomBtn: {
    width: '50%',
  },
});
