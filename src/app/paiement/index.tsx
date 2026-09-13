import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useFinanceStore } from '@/store/financeStore';
import { MoyenPaiement, TypeContribution } from '@/types';

interface PaymentMethodOption {
  id: MoyenPaiement;
  name: string;
  badge: string;
  icon: any;
  color: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'WAVE',
    name: 'Wave Mobile Money',
    badge: 'Sans frais',
    icon: 'water-outline',
    color: '#1DA1F2',
  },
  {
    id: 'ORANGE_MONEY',
    name: 'Orange Money',
    badge: 'Instantané',
    icon: 'phone-portrait-outline',
    color: '#FF7900',
  },
  {
    id: 'MTN_MOMO',
    name: 'MTN MoMo',
    badge: 'Instantané',
    icon: 'flash-outline',
    color: '#FFCC00',
  },
  {
    id: 'MOOV_MONEY',
    name: 'Moov Money Flooz',
    badge: 'Disponible',
    icon: 'wallet-outline',
    color: '#006699',
  },
  {
    id: 'CARTE_BANCAIRE',
    name: 'Carte Bancaire (Visa / Mastercard)',
    badge: 'Sécurisé 3D-Secure',
    icon: 'card-outline',
    color: '#1E293B',
  },
  {
    id: 'VIREMENT',
    name: 'Virement bancaire église',
    badge: 'RIB fourni',
    icon: 'business-outline',
    color: '#0C4A48',
  },
];

export default function PaiementScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const params = useLocalSearchParams<{
    titre?: string;
    type?: TypeContribution;
    montant?: string;
    donateurNom?: string;
    donateurTelephone?: string;
    projetId?: string;
    evenementId?: string;
  }>();

  const processPayment = useFinanceStore((s) => s.processPayment);

  const [selectedMethod, setSelectedMethod] = useState<MoyenPaiement>('WAVE');
  const [phoneForPayment, setPhoneForPayment] = useState(
    params.donateurTelephone || '+225 07 48 92 10 33'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = parseInt(params.montant || '25000', 10);
  const titre = params.titre || 'Contribution Financière';
  const type = (params.type as TypeContribution) || 'DIME';
  const donateurNom = params.donateurNom || 'Shahinur Rahman';

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      const generatedReceipt = await processPayment({
        titre,
        type,
        montant: amount,
        moyenPaiement: selectedMethod,
        donateurNom,
        donateurTelephone: phoneForPayment,
        projetId: params.projetId,
        evenementId: params.evenementId,
      });

      setIsProcessing(false);

      // Navigate immediately to the generated official receipt
      router.replace(`/recu/${generatedReceipt.id}`);
    } catch {
      setIsProcessing(false);
      Alert.alert('Erreur', 'Le paiement n a pas pu aboutir. Veuillez réessayer.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Deep Teal Curved Header (Screen 10) */}
      <Header
        title="Récapitulatif & Paiement"
        subtitle="Booking & Payment Details"
        showBack
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
        variant="curved"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Details Card (Screen 10 Booking Details) */}
        <View style={styles.cardContainer}>
          <Card style={styles.summaryCard} variant="elevated">
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{type}</Text>
            </View>

            <Text style={styles.orderTitle}>{titre}</Text>

            {/* Contributor Row */}
            <View style={styles.contributorBox}>
              <View style={styles.contributorRow}>
                <Ionicons name="person-circle-outline" size={20} color={AppColors.primary} />
                <Text style={styles.contributorName}>{donateurNom}</Text>
              </View>
              <View style={styles.contributorRow}>
                <Ionicons name="call-outline" size={16} color={AppColors.textSecondary} />
                <Text style={styles.contributorPhone}>{phoneForPayment}</Text>
              </View>
            </View>

            {/* Financial Breakdown */}
            <View style={styles.breakdownTable}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Montant de la contribution</Text>
                <Text style={styles.breakdownValue}>
                  {amount.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Frais de transaction</Text>
                <Text style={styles.breakdownValueGreen}>0 FCFA (Offerts)</Text>
              </View>

              <View style={styles.totalDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL NET À PAYER</Text>
                <Text style={styles.totalValue}>
                  {amount.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Payment Methods (Screen 11 Payment Details) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moyen de paiement</Text>
          <Text style={styles.sectionSubtitle}>
            Choisissez votre méthode de règlement sécurisée
          </Text>

          <View style={styles.methodsList}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                  onPress={() => setSelectedMethod(method.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.methodIconBadge,
                      { backgroundColor: isSelected ? AppColors.primaryMuted : '#F1F5F9' },
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={22}
                      color={isSelected ? AppColors.primary : method.color}
                    />
                  </View>

                  <View style={styles.methodInfo}>
                    <Text
                      style={[
                        styles.methodName,
                        isSelected && styles.methodNameSelected,
                      ]}
                    >
                      {method.name}
                    </Text>
                    <Text style={styles.methodBadge}>{method.badge}</Text>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Mobile Money Prompt Input */}
        {(selectedMethod === 'WAVE' ||
          selectedMethod === 'ORANGE_MONEY' ||
          selectedMethod === 'MTN_MOMO' ||
          selectedMethod === 'MOOV_MONEY') && (
          <View style={styles.phoneSection}>
            <Card style={styles.phoneCard}>
              <Text style={styles.phoneCardTitle}>
                Numéro débité pour le compte {selectedMethod.replace('_', ' ')}
              </Text>
              <Input
                placeholder="+225 07 48 92 10 33"
                value={phoneForPayment}
                onChangeText={setPhoneForPayment}
                keyboardType="phone-pad"
                leftIcon={<Ionicons name="phone-portrait-outline" size={20} color={AppColors.textSecondary} />}
                containerStyle={{ marginBottom: 0 }}
              />
              <Text style={styles.phoneHint}>
                Une notification de validation sera envoyée sur ce numéro pour valider le code secret.
              </Text>
            </Card>
          </View>
        )}

        {/* Security assurance */}
        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark" size={18} color={AppColors.primary} />
          <Text style={styles.securityText}>
            Paiement 100% sécurisé et chiffré. Justificatif officiel généré immédiatement.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalAmount}>
            {amount.toLocaleString('fr-FR')} FCFA
          </Text>
        </View>
        <Button
          title="Confirmer & Payer"
          onPress={handlePay}
          size="lg"
          variant="primary"
          style={styles.payBtn}
        />
      </View>

      {/* Processing Modal Overlay */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.modalTitle}>Traitement du paiement...</Text>
            <Text style={styles.modalSubtitle}>
              Connexion à l opérateur {selectedMethod.replace('_', ' ')} en cours.
            </Text>
            <Text style={styles.modalHint}>Veuillez patienter quelques instants</Text>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 120,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 24,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  orderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 14,
  },
  contributorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 16,
  },
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contributorName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  contributorPhone: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  breakdownTable: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  breakdownValueGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.success,
  },
  totalDivider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.primary,
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
    marginBottom: 14,
  },
  methodsList: {
    gap: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  methodCardSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryMuted,
  },
  methodIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  methodNameSelected: {
    color: AppColors.primary,
  },
  methodBadge: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
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
  phoneSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  phoneCard: {
    padding: 16,
    borderRadius: 16,
  },
  phoneCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  phoneHint: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 6,
    lineHeight: 15,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 18,
  },
  securityText: {
    fontSize: 11,
    color: AppColors.textSecondary,
    flex: 1,
    lineHeight: 16,
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
  bottomTotalLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  bottomTotalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 1,
  },
  payBtn: {
    width: '56%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...Shadows.ticket,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginTop: 18,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalHint: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 12,
  },
});
