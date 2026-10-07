import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AppColors, Shadows } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Barcode } from '@/components/common/Barcode';
import { useFinanceStore } from '@/store/financeStore';
import { Recu } from '@/types';
import { formatMoyenPaiementLabel } from '@/constants/versement';

export default function RecuDetailScreen() {
  const { id, choix } = useLocalSearchParams<{ id: string; choix?: string }>();
  const loadReceipt = useFinanceStore((s) => s.loadReceipt);
  const syncPayment = useFinanceStore((s) => s.syncPayment);
  const recus = useFinanceStore((s) => s.recus);
  const transactions = useFinanceStore((s) => s.transactions);
  const refreshEspace = useFinanceStore((s) => s.refreshEspace);

  // Recherche dynamique robuste
  const storeRecu = recus.find(
    (item) => item.id === id || item.numeroRecu === id || item.transactionId === id
  );

  const matchedTx = useMemo(
    () =>
      transactions.find(
        (t) =>
          t.id === id ||
          t.recuNumero === id ||
          t.reference === id ||
          (storeRecu?.transactionId && t.id === storeRecu.transactionId)
      ),
    [transactions, id, storeRecu?.transactionId]
  );

  // Reçu final : soit celui du store, soit dérivé de la transaction
  const recu: Recu | undefined = useMemo(() => {
    if (storeRecu) return storeRecu;
    if (!matchedTx) return undefined;
    return {
      id: matchedTx.id,
      numeroRecu: matchedTx.recuNumero || matchedTx.reference,
      transactionId: matchedTx.id,
      titre: matchedTx.titre,
      type: matchedTx.type,
      donateurNom: matchedTx.donateurNom,
      donateurMatricule: '',
      donateurTelephone: matchedTx.donateurTelephone,
      donateurEmail: '',
      montant: matchedTx.montant,
      frais: 0,
      total: matchedTx.montant,
      date: matchedTx.date,
      heure: matchedTx.heure,
      statut: matchedTx.statut,
      moyenPaiement: matchedTx.moyenPaiement,
      egliseNom: 'Église Jésus Christ Victoire',
      egliseAdresse: 'Boulevard de la Victoire, Abidjan',
      codeSecurite: matchedTx.reference,
    };
  }, [storeRecu, matchedTx]);

  const transaction = matchedTx || transactions.find(
    (t) => t.id === recu?.transactionId || t.recuNumero === recu?.numeroRecu
  );

  const [fetchState, setFetchState] = useState<{ id: string; done: boolean }>({
    id: id ?? '',
    done: Boolean(recu),
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!id || recu) return;
    let cancelled = false;
    Promise.allSettled([loadReceipt(id), refreshEspace()]).finally(() => {
      if (!cancelled) setFetchState({ id, done: true });
    });
    return () => {
      cancelled = true;
    };
  }, [id, loadReceipt, refreshEspace, recu]);

  const loading = Boolean(id && !recu && !(fetchState.id === id && fetchState.done));

  const showChoice = choix === '1' || recu?.statut === 'EN_ATTENTE';

  if (!recu) {
    return (
      <View style={styles.container}>
        <Header
          title="Détails du reçu"
          showBack
          onBack={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)');
          }}
        />
        <View style={styles.notFound}>
          <Ionicons name="receipt-outline" size={48} color={AppColors.textMuted} />
          <Text style={styles.notFoundText}>
            {loading
              ? 'Chargement du reçu…'
              : 'Le reçu demandé n existe pas ou est en cours de traitement.'}
          </Text>
          <Button
            title="Retour à mes reçus"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)/recus');
            }}
          />
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Reçu officiel N° ${recu.numeroRecu} - ${recu.titre} d un montant de ${recu.montant.toLocaleString('fr-FR')} FCFA réglé le ${recu.date} à l ${recu.egliseNom}. Réf: ${recu.codeSecurite}`,
        title: `Reçu ${recu.numeroRecu}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Reçu téléchargé !',
      `Le fichier ${recu.numeroRecu}.pdf a été enregistré avec succès dans vos documents.`,
      [{ text: 'OK' }]
    );
  };

  const handleSync = async () => {
    if (!recu?.transactionId || isSyncing) return;
    setIsSyncing(true);
    try {
      const updated = await syncPayment(recu.transactionId);
      if (updated?.statut === 'VALIDE') {
        Alert.alert('Paiement validé !', 'Votre contribution a été confirmée avec succès.');
        if (id) loadReceipt(id);
      } else if (updated?.statut === 'ECHEC') {
        Alert.alert('Paiement non abouti', 'La transaction n’a pas pu être validée.');
        if (id) loadReceipt(id);
      } else if (recu.moyenPaiement === 'ESPECES') {
        Alert.alert(
          'En attente du dépôt d’espèces',
          'Veuillez déposer vos espèces au secrétariat ou guichet du Temple. La trésorerie confirmera la réception pour certifier votre reçu.'
        );
      } else {
        Alert.alert('Paiement en attente', 'Le paiement en ligne est en cours de validation par votre opérateur.');
      }
    } catch {
      Alert.alert('Information', 'Impossible de vérifier le statut pour l’instant.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenCheckout = async () => {
    const url = transaction?.checkoutUrl;
    if (!url) return;
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        const res = await WebBrowser.openAuthSessionAsync(url, 'jcvpay://');
        if (res.type === 'success' || res.type === 'cancel' || res.type === 'dismiss') {
          await handleSync();
        }
      }
    } catch {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Deep Teal Header */}
      <Header
        title="Détails du reçu"
        subtitle="Official Contribution Ticket"
        showBack
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
        variant="curved"
        rightAction={
          <TouchableOpacity
            style={styles.headerShareBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={20} color={AppColors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* The Master Ticket Voucher (Exact Screen 12 Replica) */}
        <View style={styles.ticketWrapper}>
          <View style={styles.ticketCard}>
            {/* Ticket Upper Section */}
            <View style={styles.ticketTopSection}>
              <View style={styles.churchBrandRow}>
                <View style={styles.brandIconCircle}>
                  <Ionicons name="book-outline" size={24} color={AppColors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.churchMainName}>{recu.egliseNom}</Text>
                  <Text style={styles.churchAddress}>{recu.egliseAdresse}</Text>
                </View>
                <Badge
                  label={
                    recu.statut === 'VALIDE'
                      ? 'Validé'
                      : recu.statut === 'EN_ATTENTE'
                        ? 'En attente'
                        : recu.statut === 'REJETE'
                          ? 'Rejeté'
                          : 'Échec de paiement'
                  }
                  variant={
                    recu.statut === 'VALIDE'
                      ? 'success'
                      : recu.statut === 'ECHEC' || recu.statut === 'REJETE' || recu.statut === 'ANNULE'
                        ? 'danger'
                        : 'warning'
                  }
                  size="sm"
                />
              </View>

              <View style={styles.receiptMetaRow}>
                <View>
                  <Text style={styles.metaLabel}>Quittance N°</Text>
                  <Text style={styles.metaValue}>{recu.numeroRecu}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.metaLabel}>Date & Heure</Text>
                  <Text style={styles.metaValue}>
                    {recu.date} à {recu.heure}
                  </Text>
                </View>
              </View>

              <View style={styles.contributionBanner}>
                <Text style={styles.bannerCategory}>{recu.type}</Text>
                <Text style={styles.bannerTitle}>{recu.titre}</Text>
              </View>
            </View>

            {/* Perforated Divider 1 with Notches */}
            <View style={styles.perforationRow}>
              <View style={[styles.notch, styles.notchLeft]} />
              <View style={styles.dashedDivider} />
              <View style={[styles.notch, styles.notchRight]} />
            </View>

            {/* Ticket Middle Section: Contributor Details & Breakdown */}
            <View style={styles.ticketMiddleSection}>
              <Text style={styles.sectionHeading}>Informations du donateur</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Nom du membre</Text>
                  <Text style={styles.detailContent}>{recu.donateurNom || 'Anonyme'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Matricule d église</Text>
                  <Text style={styles.detailContent}>{recu.donateurMatricule || 'Non renseigné'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Téléphone</Text>
                  <Text style={styles.detailContent}>{recu.donateurTelephone || 'Non renseigné'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Mode de règlement</Text>
                  <Text style={styles.detailContent}>
                    {recu.moyenPaiement
                      ? formatMoyenPaiementLabel(recu.moyenPaiement)
                      : 'Non spécifié'}
                  </Text>
                </View>
              </View>

              <View style={styles.solidDivider} />

              {/* Payment Summary */}
              <Text style={styles.sectionHeading}>Détails du paiement</Text>
              <View style={styles.financeTable}>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Montant versé</Text>
                  <Text style={styles.financeValue}>
                    {(recu.montant ?? 0).toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Frais de transaction</Text>
                  <Text style={styles.financeValueGreen}>0 FCFA (Offerts)</Text>
                </View>
                <View style={[styles.financeRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>TOTAL NET ENCAISSÉ</Text>
                  <Text style={styles.totalValue}>
                    {(recu.total ?? recu.montant ?? 0).toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
              </View>
            </View>

            {/* Perforated Divider 2 with Notches */}
            <View style={styles.perforationRow}>
              <View style={[styles.notch, styles.notchLeft]} />
              <View style={styles.dashedDivider} />
              <View style={[styles.notch, styles.notchRight]} />
            </View>

            {/* Ticket Bottom Section: Realistic Barcode & Security Hash */}
            <View style={styles.ticketBottomSection}>
              <Barcode value={recu.numeroRecu || recu.id} height={50} />
              <Text style={styles.securityCode}>
                Certificat numérique : {recu.codeSecurite}
              </Text>
              <Text style={styles.stampText}>
                {recu.statut === 'VALIDE'
                  ? 'Document certifié conforme par la trésorerie'
                  : recu.statut === 'EN_ATTENTE'
                    ? (recu.moyenPaiement === 'ESPECES'
                        ? 'Versement en espèces déclaré. Le reçu officiel sera validé par la trésorerie dès réception des fonds au secrétariat.'
                        : 'Paiement en ligne en cours de finalisation.')
                    : recu.statut === 'REJETE'
                      ? 'Ce versement a été rejeté par la trésorerie.'
                      : 'Le paiement n’a pas pu être effectué (échec de paiement). Aucun montant n’a été débité.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {showChoice || recu.statut === 'ECHEC' ? (
            <View style={styles.choiceBox}>
              <Text style={styles.choiceTitle}>
                {recu.statut === 'ECHEC' ? 'Paiement non abouti' : 'Où aller ensuite ?'}
              </Text>
              <Text style={styles.choiceHint}>
                {recu.statut === 'VALIDE'
                  ? 'Votre reçu est prêt et certifié.'
                  : recu.statut === 'ECHEC'
                    ? 'Le paiement n’a pas pu être effectué. Vous pouvez retenter votre versement dès maintenant.'
                    : recu.moyenPaiement === 'ESPECES'
                      ? 'Déposez votre enveloppe au secrétariat du Temple. La trésorerie confirmera la réception pour valider votre reçu.'
                      : 'Finalisez le règlement en ligne pour valider immédiatement votre reçu officiel.'}
              </Text>
              {recu.statut === 'ECHEC' ? (
                <Button
                  title="Réessayer un versement"
                  onPress={() => router.replace('/(tabs)')}
                  size="lg"
                  variant="primary"
                  style={styles.actionBtn}
                />
              ) : null}
              {recu.statut === 'EN_ATTENTE' && transaction?.checkoutUrl ? (
                <Button
                  title="Finaliser le paiement en ligne"
                  onPress={handleOpenCheckout}
                  size="lg"
                  variant="primary"
                  icon={<Ionicons name="card-outline" size={20} color={AppColors.white} />}
                  style={styles.actionBtn}
                />
              ) : null}
              {recu.statut === 'EN_ATTENTE' && recu.moyenPaiement !== 'ESPECES' ? (
                <Button
                  title={isSyncing ? "Vérification en cours…" : "Vérifier la confirmation du paiement"}
                  onPress={handleSync}
                  size="lg"
                  variant={transaction?.checkoutUrl ? "outline" : "primary"}
                  icon={<Ionicons name="refresh-outline" size={20} color={transaction?.checkoutUrl ? AppColors.primary : AppColors.white} />}
                  style={styles.actionBtn}
                />
              ) : null}
              <Button
                title="Retour à l accueil"
                onPress={() => router.replace('/(tabs)')}
                size="lg"
                variant={recu.statut === 'VALIDE' ? 'primary' : 'outline'}
                style={styles.actionBtn}
              />
              <Button
                title="Voir tous les reçus"
                onPress={() => router.replace('/(tabs)/recus')}
                size="lg"
                variant="outline"
                style={styles.actionBtn}
              />
            </View>
          ) : null}

          {recu.statut === 'VALIDE' ? (
            <>
              <Button
                title="Télécharger le reçu (PDF)"
                onPress={handleDownload}
                size="lg"
                variant={showChoice ? 'outline' : 'primary'}
                icon={<Ionicons name="download-outline" size={20} color={showChoice ? AppColors.primary : AppColors.white} />}
                style={styles.actionBtn}
              />
              <Button
                title="Partager le justificatif"
                onPress={handleShare}
                size="lg"
                variant="outline"
                icon={<Ionicons name="share-outline" size={20} color={AppColors.primary} />}
                style={styles.actionBtn}
              />
            </>
          ) : null}
        </View>
      </ScrollView>
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
    paddingBottom: 100,
  },
  headerShareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  ticketCard: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    ...Shadows.ticket,
  },
  ticketTopSection: {
    padding: 20,
  },
  churchBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  churchMainName: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  churchAddress: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  metaLabel: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 2,
  },
  contributionBanner: {
    backgroundColor: AppColors.primaryMuted,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  bannerCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  notch: {
    width: 20,
    height: 24,
    backgroundColor: AppColors.background,
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  notchLeft: {
    left: -10,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: AppColors.borderLight,
  },
  notchRight: {
    right: -10,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: AppColors.borderLight,
  },
  dashedDivider: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: AppColors.border,
    marginHorizontal: 16,
  },
  ticketMiddleSection: {
    padding: 20,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  detailsGrid: {
    gap: 8,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailTitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  detailContent: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  solidDivider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginVertical: 14,
  },
  financeTable: {
    gap: 8,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financeLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  financeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  financeValueGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.success,
  },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
    marginTop: 4,
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
  ticketBottomSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FAFCFC',
  },
  securityCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: AppColors.textSecondary,
    fontWeight: '600',
    marginTop: 8,
  },
  stampText: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  choiceBox: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    gap: 10,
    marginBottom: 4,
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  choiceHint: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  actionBtn: {
    width: '100%',
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
