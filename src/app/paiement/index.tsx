import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useFinanceStore } from '@/store/financeStore';
import { MoyenPaiement, TypeContribution } from '@/types';
import { BrandedLoader } from '@/components/motion/BrandedLoader';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';
import { VERSEMENT_CHANNELS } from '@/constants/versement';

// Préparer la complétion des sessions d'authentification / redirection de paiement
WebBrowser.maybeCompleteAuthSession();

interface ActiveOnlinePayment {
  checkoutUrl: string;
  transactionId: string;
  recuId: string;
}

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
    error?: string;
  }>();

  const processPayment = useFinanceStore((s) => s.processPayment);
  const syncPayment = useFinanceStore((s) => s.syncPayment);

  const [selectedMethod, setSelectedMethod] = useState<MoyenPaiement>('WAVE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePayment, setActivePayment] = useState<ActiveOnlinePayment | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const amount = parseInt(params.montant || '25000', 10);
  const titre = params.titre || 'Contribution Financière';
  const type = (params.type as TypeContribution) || 'DIME';
  const donateurNom = params.donateurNom || 'Ezekiel';
  const phoneForPayment = params.donateurTelephone || '+225 07 48 92 10 33';

  const selectedChannel = VERSEMENT_CHANNELS.find((c) => c.id === selectedMethod) || VERSEMENT_CHANNELS[0];

  // Nettoyage de l'intervalle de polling
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    // Si l'écran a été ouvert via un lien de retour d'erreur
    if (params.error) {
      Alert.alert(
        'Paiement non abouti',
        'La précédente tentative de paiement en ligne a été annulée ou n’a pas abouti. Vous pouvez sélectionner votre moyen de paiement et réessayer.'
      );
    }

    // Écoute des redirections deep linking (ex: jcvpay://recu/:id)
    const subscription = Linking.addEventListener('url', (event) => {
      const parsed = Linking.parse(event.url);
      if (parsed.path && parsed.path.includes('recu')) {
        stopPolling();
        setActivePayment(null);
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [params.error]);

  const openPaymentUrl = async (url: string, recuId?: string, transactionId?: string) => {
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        const result = await WebBrowser.openAuthSessionAsync(url, 'jcvpay://');
        if (result.type === 'success' && result.url) {
          stopPolling();
          if (result.url.includes('error')) {
            setActivePayment(null);
            Alert.alert(
              'Paiement non abouti',
              'La transaction a été annulée ou rejetée. Vous pouvez réessayer avec un autre moyen de paiement.'
            );
          } else {
            setPaymentSuccess(true);
            setTimeout(() => {
              setActivePayment(null);
              if (recuId) {
                router.replace(`/recu/${recuId}?choix=1`);
              } else {
                router.replace('/(tabs)/recus');
              }
            }, 600);
          }
          return;
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          // L'utilisateur est revenu manuellement : vérification directe du statut
          if (transactionId && recuId) {
            checkPaymentStatus(transactionId, recuId);
          }
        }
      }
    } catch {
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch {
        Linking.openURL(url).catch(() => {
          Alert.alert('Erreur', 'Impossible d’ouvrir la page de paiement sécurisé.');
        });
      }
    }
  };

  const checkPaymentStatus = async (transactionId: string, recuId: string) => {
    if (isCheckingStatus) return;
    setIsCheckingStatus(true);
    try {
      const updated = await syncPayment(transactionId);
      if (updated?.statut === 'VALIDE') {
        stopPolling();
        setPaymentSuccess(true);
        setTimeout(() => {
          setActivePayment(null);
          router.replace(`/recu/${recuId}?choix=1`);
        }, 1200);
      } else if (updated?.statut === 'ECHEC' || updated?.statut === 'REJETE') {
        stopPolling();
        Alert.alert(
          'Paiement non abouti',
          'La transaction a été annulée ou n’a pas pu être validée.',
          [
            {
              text: 'Réessayer',
              onPress: () => setActivePayment(null),
            },
          ]
        );
      }
    } catch {
      // Ignoré lors des vérifications de routine
    } finally {
      setIsCheckingStatus(false);
    }
  };

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
        caisseProjetId: params.caisseProjetId,
        evenementId: params.evenementId,
      });

      setIsProcessing(false);

      if (result.checkoutUrl) {
        // Enregistre le paiement en cours et ouvre la passerelle sécurisée
        const paymentData: ActiveOnlinePayment = {
          checkoutUrl: result.checkoutUrl,
          transactionId: result.transactionId,
          recuId: result.recu.id,
        };
        setActivePayment(paymentData);
        await openPaymentUrl(result.checkoutUrl, result.recu.id, result.transactionId);

        // Lance le polling automatique (toutes les 3,5 secondes)
        stopPolling();
        pollIntervalRef.current = setInterval(() => {
          checkPaymentStatus(result.transactionId, result.recu.id);
        }, 3500);
      } else {
        // Paiement physique ou sans redirection immédiate
        router.replace(`/recu/${result.recu.id}?choix=1`);
      }
    } catch (error) {
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : 'Le paiement n’a pas pu être initié.';
      Alert.alert('Échec de versement', message);
    }
  };

  return (
    <KeyboardAwareScreen
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      header={
        <Header
          title="Validation du don"
          subtitle="Vérifiez le récapitulatif et le moyen de versement"
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
            <Text style={styles.bottomTotalLabel}>Montant à régler</Text>
            <Text style={styles.bottomTotalAmount}>
              {amount.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
          <Button
            title={selectedChannel.isOnline ? 'Effectuer un paiement' : 'Confirmer le versement'}
            onPress={handleDeclare}
            size="md"
            variant="primary"
            fullWidth={false}
            style={styles.payBtn}
          />
        </View>
      }
      overlay={
        <>
          {/* Modal de chargement initial */}
          <Modal visible={isProcessing} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <BrandedLoader
                  title="Préparation du paiement…"
                  subtitle="Initialisation de la transaction sécurisée"
                  hint="Connexion sécurisée en cours"
                />
              </View>
            </View>
          </Modal>

          {/* Modal de suivi de paiement en direct */}
          <Modal
            visible={Boolean(activePayment)}
            transparent
            animationType="slide"
            onRequestClose={() => {
              stopPolling();
              if (activePayment) {
                router.replace(`/recu/${activePayment.recuId}?choix=1`);
              }
              setActivePayment(null);
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.onlineStatusCard}>
                {paymentSuccess ? (
                  <View style={styles.successStateBox}>
                    <View style={styles.successIconCircle}>
                      <Ionicons name="checkmark" size={36} color={AppColors.white} />
                    </View>
                    <Text style={styles.successTitle}>Paiement validé !</Text>
                    <Text style={styles.successSubtitle}>
                      Votre contribution a été enregistrée avec succès. Votre reçu officiel est prêt.
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.onlineStatusHeader}>
                      <View style={styles.livePulseBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>Paiement sécurisé en direct</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          stopPolling();
                          if (activePayment) {
                            router.replace(`/recu/${activePayment.recuId}?choix=1`);
                          }
                          setActivePayment(null);
                        }}
                      >
                        <Ionicons name="close-circle-outline" size={24} color={AppColors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.onlineAmountText}>
                      {amount.toLocaleString('fr-FR')} FCFA
                    </Text>
                    <Text style={styles.onlineMethodName}>
                      {selectedChannel.name} • {titre}
                    </Text>

                    <View style={styles.instructionsBox}>
                      <ActivityIndicator
                        size="small"
                        color={AppColors.primary}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={styles.instructionsText}>
                        En attente de validation. Une fois le paiement confirmé sur votre téléphone ou sur la page de paiement, votre reçu officiel s’activera automatiquement.
                      </Text>
                    </View>

                    <View style={styles.statusActionsContainer}>
                      <Button
                        title={isCheckingStatus ? 'Vérification en cours…' : 'Actualiser le statut'}
                        onPress={() => {
                          if (activePayment) {
                            checkPaymentStatus(activePayment.transactionId, activePayment.recuId);
                          }
                        }}
                        disabled={isCheckingStatus}
                        size="md"
                        variant="primary"
                        icon={<Ionicons name="refresh-outline" size={18} color={AppColors.white} />}
                      />

                      <Button
                        title="Rouvrir la page de paiement"
                        onPress={() => {
                          if (activePayment) {
                            openPaymentUrl(activePayment.checkoutUrl, activePayment.recuId, activePayment.transactionId);
                          }
                        }}
                        size="md"
                        variant="outline"
                        icon={<Ionicons name="open-outline" size={18} color={AppColors.primary} />}
                      />

                      <TouchableOpacity
                        style={styles.laterBtn}
                        onPress={() => {
                          stopPolling();
                          if (activePayment) {
                            router.replace(`/recu/${activePayment.recuId}?choix=1`);
                          }
                          setActivePayment(null);
                        }}
                      >
                        <Text style={styles.laterBtnText}>Voir mon reçu en attente</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </>
      }
    >
      <View style={styles.cardContainer}>
        {/* Récapitulatif */}
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
            {selectedChannel.isOnline ? (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Mode</Text>
                <Text style={styles.geniusBadgeText}>Paiement instantané sécurisé</Text>
              </View>
            ) : null}
          </View>
        </Card>

        {/* Choix du moyen de versement */}
        <View style={styles.channelSection}>
          <Text style={styles.sectionTitle}>Moyen de versement</Text>
          <Text style={styles.sectionSubtitle}>
            Sélectionnez votre méthode préférée (Mobile Money, Carte ou Guichet)
          </Text>

          <View style={styles.channelsGrid}>
            {VERSEMENT_CHANNELS.map((channel) => {
              const isSelected = selectedMethod === channel.id;
              return (
                <TouchableOpacity
                  key={channel.id}
                  style={[
                    styles.channelCard,
                    isSelected && [
                      styles.channelCardSelected,
                      { borderColor: channel.brandColor },
                    ],
                  ]}
                  onPress={() => setSelectedMethod(channel.id)}
                  activeOpacity={0.82}
                >
                  {/* Boîte Logo avec affichage de l'image de la marque */}
                  <View
                    style={[
                      styles.channelLogoContainer,
                      {
                        backgroundColor: isSelected
                          ? '#FFFFFF'
                          : channel.brandLightBg || '#F8FAFC',
                      },
                    ]}
                  >
                    {channel.logoSource ? (
                      <View style={styles.logosWrapper}>
                        <Image
                          source={channel.logoSource}
                          style={
                            channel.secondaryLogoSource
                              ? styles.channelLogoSplit
                              : styles.channelLogoImage
                          }
                          contentFit="contain"
                          transition={200}
                        />
                        {channel.secondaryLogoSource ? (
                          <Image
                            source={channel.secondaryLogoSource}
                            style={styles.channelLogoSplit}
                            contentFit="contain"
                            transition={200}
                          />
                        ) : null}
                      </View>
                    ) : (
                      <Ionicons
                        name={channel.icon}
                        size={22}
                        color={channel.brandColor || AppColors.primary}
                      />
                    )}
                  </View>

                  <View style={styles.channelInfo}>
                    <View style={styles.channelTitleRow}>
                      <Text
                        style={[
                          styles.channelName,
                          isSelected && { color: AppColors.textPrimary, fontWeight: '800' },
                        ]}
                      >
                        {channel.name}
                      </Text>
                      {channel.badge ? (
                        <View
                          style={[
                            styles.badgeTag,
                            { backgroundColor: `${channel.brandColor}18` },
                          ]}
                        >
                          <Text style={[styles.badgeTagText, { color: channel.brandColor }]}>
                            {channel.badge}
                          </Text>
                        </View>
                      ) : channel.isOnline ? (
                        <View style={styles.onlineTag}>
                          <Text style={styles.onlineTagText}>En ligne</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.channelDetail} numberOfLines={1}>
                      {channel.detail}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && { borderColor: channel.brandColor },
                    ]}
                  >
                    {isSelected ? (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: channel.brandColor },
                        ]}
                      />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Guide d'instruction pour le canal choisi */}
          <View style={styles.howBox}>
            <Ionicons name="information-circle-outline" size={18} color={AppColors.primary} />
            <Text style={styles.howText}>{selectedChannel.how}</Text>
          </View>
        </View>

        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={AppColors.primary} />
          <Text style={styles.securityText}>
            Paiements chiffrés et certifiés conformes. Votre reçu officiel avec numéro unique et code de sécurité est délivré immédiatement.
          </Text>
        </View>
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
    paddingBottom: 130,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
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
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.primary,
  },
  geniusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.success,
  },
  channelSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 12,
  },
  channelsGrid: {
    gap: 10,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: AppColors.borderLight,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  channelCardSelected: {
    backgroundColor: '#F0FDF9',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  channelLogoContainer: {
    width: 52,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 3,
  },
  logosWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    height: '100%',
  },
  channelLogoImage: {
    width: 44,
    height: 38,
  },
  channelLogoSplit: {
    width: 21,
    height: 24,
  },
  channelInfo: {
    flex: 1,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  badgeTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  onlineTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  onlineTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  channelDetail: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  howBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  howText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 16,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 14,
    backgroundColor: AppColors.primaryMuted,
    borderRadius: 14,
    marginTop: 4,
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
    minWidth: 180,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
  onlineStatusCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: AppColors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  onlineStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  livePulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  onlineAmountText: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 4,
  },
  onlineMethodName: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    marginBottom: 20,
  },
  instructionsText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 16,
  },
  statusActionsContainer: {
    width: '100%',
    gap: 10,
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  laterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textMuted,
  },
  successStateBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: AppColors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
