import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useFinanceStore } from '@/store/financeStore';
import { MoyenPaiement, TypeContribution } from '@/types';
import { BrandedLoader } from '@/components/motion/BrandedLoader';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';
import { VERSEMENT_CHANNELS } from '@/constants/versement';

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
  const syncPayment = useFinanceStore((s) => s.syncPayment);

  const [selectedMethod, setSelectedMethod] = useState<MoyenPaiement>('WAVE');
  const [isProcessing, setIsProcessing] = useState(false);
  const selectedChannel = VERSEMENT_CHANNELS.find((method) => method.id === selectedMethod);

  const amount = parseInt(params.montant || '25000', 10);
  const titre = params.titre || 'Contribution Financière';
  const type = (params.type as TypeContribution) || 'DIME';
  const donateurNom = params.donateurNom || 'Ezekiel';
  const phoneForPayment = params.donateurTelephone || '+225 07 48 92 10 33';

  const handleDeclare = async () => {
    setIsProcessing(true);
    try {
      const result = await processPayment({
        titre,
        type,
        montant: amount,
        moyenPaiement: selectedMethod,
        donateurNom,
        donateurTelephone: phoneForPayment,
        projetId: params.projetId,
        evenementId: params.evenementId,
      });
      if (result.checkoutUrl) {
        await WebBrowser.openBrowserAsync(result.checkoutUrl);
        await syncPayment(result.transactionId);
      }
      setIsProcessing(false);
      router.replace(`/recu/${result.recu.id}?choix=1`);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Paiement impossible', error instanceof Error ? error.message : 'Réessayez.');
    }
  };

  return (
    <KeyboardAwareScreen
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      header={
        <Header
          title="Comment verser"
          subtitle="Wave, Orange, MTN, Moov ou carte"
          showBack
          onBack={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)');
          }}
          variant="curved"
        />
      }
      footer={
        <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
          <View>
            <Text style={styles.bottomTotalLabel}>À verser</Text>
            <Text style={styles.bottomTotalAmount}>
              {amount.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <Button
            title={selectedChannel?.geniusPay ? 'Payer avec GeniusPay' : 'J ai noté, déclarer'}
            onPress={handleDeclare}
            size="lg"
            variant="primary"
            style={styles.payBtn}
          />
        </View>
      }
      overlay={
        <Modal visible={isProcessing} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <BrandedLoader
                title="Enregistrement..."
                subtitle="Votre déclaration est transmise à la trésorerie"
                hint="Le reçu officiel arrive après confirmation du versement"
              />
            </View>
          </View>
        </Modal>
      }
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

            <View style={styles.breakdownTable}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Montant à verser</Text>
                <Text style={styles.breakdownValue}>
                  {amount.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
              <View style={styles.totalDivider} />
              <Text style={styles.phoneHint}>
                {selectedChannel?.geniusPay
                  ? 'Wave, Orange, MTN, Moov et carte sont encaissés par GeniusPay. Le reçu se met à jour dès confirmation.'
                  : 'Ce canal est déclaré dans l’application. La trésorerie confirme ensuite le reçu officiel.'}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment verser</Text>
          <Text style={styles.sectionSubtitle}>
            Les moyens électroniques ouvrent GeniusPay. Virement et espèces restent une déclaration.
          </Text>

          <View style={styles.methodsList}>
            {VERSEMENT_CHANNELS.map((method) => {
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
                      color={isSelected ? AppColors.primary : AppColors.textSecondary}
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
                    <Text style={styles.methodBadge}>{method.detail}</Text>
                    {isSelected ? (
                      <Text style={styles.methodHow}>{method.how}</Text>
                    ) : null}
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

        <View style={styles.securityRow}>
          <Ionicons name="information-circle" size={18} color={AppColors.primary} />
          <Text style={styles.securityText}>
            {selectedChannel?.geniusPay
              ? 'Le paiement est traité par GeniusPay. Revenez dans JCV Pay après la page de checkout.'
              : 'Après votre versement, un trésorier le confirme. Le reçu officiel apparaît alors.'}
          </Text>
        </View>
    </KeyboardAwareScreen>
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
  methodHow: {
    fontSize: 11,
    color: AppColors.primary,
    marginTop: 6,
    lineHeight: 15,
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
    backgroundColor: AppColors.white,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
