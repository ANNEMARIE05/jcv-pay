import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useFinanceStore } from '@/store/financeStore';
import { TypeContribution } from '@/types';
import { BrandedLoader } from '@/components/motion/BrandedLoader';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';
import { VERSEMENT_CHANNELS } from '@/constants/versement';

const DEFAULT_ONLINE_METHOD =
  VERSEMENT_CHANNELS.find((channel) => channel.geniusPay)?.id ?? 'WAVE';

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
    caisseProjetId?: string;
    evenementId?: string;
  }>();

  const processPayment = useFinanceStore((s) => s.processPayment);
  const syncPayment = useFinanceStore((s) => s.syncPayment);

  const [isProcessing, setIsProcessing] = useState(false);

  const amount = parseInt(params.montant || '25000', 10);
  const titre = params.titre || 'Contribution Financière';
  const type = (params.type as TypeContribution) || 'DIME';
  const donateurNom = params.donateurNom || 'Ezekiel';
  const phoneForPayment = params.donateurTelephone || '+225 07 48 92 10 33';

  const paymentErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : '';
    if (/geniuspay|GENIUSPAY|pk_|sk_|PUBLIC_KEY|SECRET_KEY/i.test(message)) {
      return 'Le paiement en ligne n’est pas encore disponible. La trésorerie doit finaliser la connexion GeniusPay sur le serveur.';
    }
    return message || 'Le paiement n’a pas pu être effectué.';
  };

  const handleDeclare = async () => {
    setIsProcessing(true);
    try {
      const result = await processPayment({
        titre,
        type,
        montant: amount,
        moyenPaiement: DEFAULT_ONLINE_METHOD,
        donateurNom,
        donateurTelephone: phoneForPayment,
        projetId: params.projetId,
        caisseProjetId: params.caisseProjetId,
        evenementId: params.evenementId,
      });
      if (result.checkoutUrl) {
        await WebBrowser.openBrowserAsync(result.checkoutUrl);
        const syncedTx = await syncPayment(result.transactionId);
        setIsProcessing(false);
        if (syncedTx?.statut === 'ECHEC') {
          Alert.alert(
            'Échec de paiement',
            'Le paiement n’a pas pu être effectué. Aucun montant n’a été débité.',
            [
              { text: 'Réessayer', style: 'cancel' },
              {
                text: 'Voir le reçu',
                onPress: () => router.replace(`/recu/${result.recu.id}`),
              },
            ]
          );
          return;
        }
      }
      setIsProcessing(false);
      router.replace(`/recu/${result.recu.id}?choix=1`);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Échec de paiement', paymentErrorMessage(error));
    }
  };

  return (
    <KeyboardAwareScreen
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      header={
        <Header
          title="Paiement"
          subtitle="Vérifiez le récapitulatif avant de continuer"
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
            title="Effectuer un paiement"
            onPress={handleDeclare}
            size="md"
            variant="primary"
            fullWidth={false}
            style={styles.payBtn}
          />
        </View>
      }
      overlay={
        <Modal visible={isProcessing} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <BrandedLoader
                title="Paiement en cours…"
                subtitle="Préparation de la page de paiement sécurisée"
                hint="Revenez dans JCV Pay une fois le versement terminé pour consulter votre reçu"
              />
            </View>
          </View>
        </Modal>
      }
    >
        <View style={styles.cardContainer}>
          <Card style={styles.summaryCard} variant="elevated">
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{type}</Text>
            </View>

            <Text style={styles.orderTitle}>{titre}</Text>

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
                Vous serez redirigé vers une page sécurisée pour finaliser le versement. Le reçu
                officiel apparaît dans l’application dès confirmation.
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={AppColors.primary} />
          <Text style={styles.securityText}>
            Votre versement est enregistré par la trésorerie de l’assemblée. Conservez le reçu
            affiché à la fin.
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
  scrollContent: {
    paddingBottom: 120,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 22,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 14,
  },
  contributorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 14,
  },
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contributorName: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  contributorPhone: {
    fontSize: 13,
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
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
  },
  totalDivider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginVertical: 4,
  },
  phoneHint: {
    fontSize: 12,
    color: AppColors.textMuted,
    lineHeight: 18,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
    backgroundColor: AppColors.primaryMuted,
    borderRadius: 14,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  bottomTotalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.primary,
  },
  payBtn: {
    flexShrink: 1,
    maxWidth: 168,
    paddingHorizontal: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: AppColors.white,
    borderRadius: 20,
    padding: 20,
  },
});
