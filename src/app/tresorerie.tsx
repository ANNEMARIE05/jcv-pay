import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { KeyboardSpacer } from '@/components/common/KeyboardAwareScreen';
import { scrollInputIntoView } from '@/utils/scrollInputIntoView';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { SourceCaisse, Transaction } from '@/types';
import { formatMoyenPaiementLabel, isCashPayment } from '@/constants/versement';
import { ListSkeleton } from '@/components/motion/Skeleton';
import { useScreenReady } from '@/hooks/useScreenReady';
import { isStaff } from '@/constants/roles';
import { PayersDirectory } from '@/components/finance/PayersDirectory';
import { CaisseDesk } from '@/components/finance/CaisseDesk';

type TresorerieTab =
  | 'VUE_GLOBALE'
  | 'CAISSES'
  | 'PAYEURS'
  | 'JOURNAL'
  | 'ENCAISSEMENTS'
  | 'VALIDATIONS';

export default function TresorerieScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const user = useAuthStore((s) => s.user);

  const tresorerie = useFinanceStore((s) => s.tresorerieGlobale);
  const transactions = useFinanceStore((s) => s.transactions);
  const projets = useFinanceStore((s) => s.projets);
  const mouvements = useFinanceStore((s) => s.mouvements);
  const utilisateurs = useFinanceStore((s) => s.utilisateurs);
  const openProjectCaisse = useFinanceStore((s) => s.openProjectCaisse);
  const validatePayment = useFinanceStore((s) => s.validatePayment);
  const recordCashPayment = useFinanceStore((s) => s.recordCashPayment);
  const recordWithdrawal = useFinanceStore((s) => s.recordWithdrawal);
  const getPayersSummary = useFinanceStore((s) => s.getPayersSummary);

  const [activeTab, setActiveTab] = useState<TresorerieTab>('VUE_GLOBALE');
  const [showCashModal, setShowCashModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showNewCaisseModal, setShowNewCaisseModal] = useState(false);

  const [cashDonorName, setCashDonorName] = useState('');
  const [cashDonorPhone, setCashDonorPhone] = useState('+225 ');
  const [cashAmount, setCashAmount] = useState('');
  const [cashType, setCashType] = useState<'DIME' | 'OFFRANDE' | 'COTISATION' | 'PROJET'>('DIME');
  const [cashProjetId, setCashProjetId] = useState('');
  const [cashProjetOpen, setCashProjetOpen] = useState(false);
  const [cashTitle, setCashTitle] = useState('Versement en espèces (Guichet)');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMotif, setWithdrawMotif] = useState('');
  const [withdrawBeneficiaire, setWithdrawBeneficiaire] = useState('');
  const [withdrawSource, setWithdrawSource] = useState<SourceCaisse>('CAISSE_PHYSIQUE');

  const [newCaisseNom, setNewCaisseNom] = useState('');
  const [newCaisseDesc, setNewCaisseDesc] = useState('');
  const [newCaisseObjectif, setNewCaisseObjectif] = useState('');
  const ready = useScreenReady(640);

  const pendingPayments = transactions.filter((t) => t.statut === 'EN_ATTENTE');
  const projetsOuverts = projets.filter((p) => p.statut !== 'CLOTURE');
  const projetSelectionne = projets.find((p) => p.id === cashProjetId);
  const validatedPayments = transactions.filter((t) => t.statut === 'VALIDE');
  const payers = getPayersSummary();
  const soldeRestant =
    tresorerie.entreesMois - tresorerie.sortiesMois;

  if (!isStaff(user?.role)) {
    return <Redirect href="/(tabs)" />;
  }

  const handleRecordCash = async () => {
    if (!cashDonorName.trim() || !cashAmount.trim()) {
      Alert.alert('Champs obligatoires', 'Veuillez saisir le nom du donateur et le montant reçu.');
      return;
    }
    const amt = parseInt(cashAmount.replace(/\D/g, ''), 10) || 0;
    if (amt <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir une somme positive.');
      return;
    }
    if (cashType === 'PROJET' && !cashProjetId) {
      Alert.alert('Projet requis', 'Sélectionnez le projet concerné par ce versement.');
      return;
    }

    try {
      const recu = await recordCashPayment({
        donateurNom: cashDonorName.trim(),
        donateurTelephone: cashDonorPhone.trim(),
        montant: amt,
        type: cashType,
        titre: cashTitle.trim() || projetSelectionne?.titre || 'Versement en espèces',
        projetId: cashType === 'PROJET' ? cashProjetId : undefined,
      });
      setShowCashModal(false);
      setCashDonorName('');
      setCashDonorPhone('+225 ');
      setCashAmount('');
      setCashProjetId('');
      setCashProjetOpen(false);
      Alert.alert(
        'Encaissement Réussi !',
        `Reçu officiel N° ${recu.numeroRecu} édité pour ${cashDonorName}.\nMontant : ${amt.toLocaleString('fr-FR')} FCFA.`,
        [
          { text: 'Fermer', style: 'cancel' },
          { text: 'Voir le Billet / Reçu', onPress: () => router.push(`/recu/${recu.id}`) },
        ]
      );
    } catch (error) {
      Alert.alert('Encaissement impossible', error instanceof Error ? error.message : 'Réessayez.');
    }
  };

  const handleValidate = (tx: Transaction) => {
    const { id: txId, donateurNom: donateur, montant, moyenPaiement } = tx;
    const cash = isCashPayment(moyenPaiement);
    Alert.alert(
      cash ? 'Confirmer la réception des espèces' : 'Valider le paiement',
      cash
        ? `Confirmez-vous avoir reçu ${montant.toLocaleString('fr-FR')} FCFA en espèces de ${donateur} au guichet ?`
        : `Confirmez-vous la bonne réception des ${montant.toLocaleString('fr-FR')} FCFA de ${donateur} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer & Créditer',
          onPress: async () => {
            try {
              await validatePayment(txId);
              Alert.alert('Succès', 'Versement validé et ajouté à la trésorerie.');
            } catch (error) {
              Alert.alert('Validation impossible', error instanceof Error ? error.message : 'Réessayez.');
            }
          },
        },
      ]
    );
  };

  const handleWithdraw = async () => {
    if (!withdrawMotif.trim() || !withdrawAmount.trim()) {
      Alert.alert('Champs obligatoires', 'Indiquez le montant et le motif du retrait.');
      return;
    }
    const amt = parseInt(withdrawAmount.replace(/\D/g, ''), 10) || 0;
    if (amt <= 0) {
      Alert.alert('Montant invalide', 'Saisissez une somme positive.');
      return;
    }

    try {
      const result = await recordWithdrawal({
        montant: amt,
        motif: withdrawMotif.trim(),
        source: withdrawSource,
        auteur: user ? `${user.prenom} ${user.nom}`.trim() : 'Trésorier',
        beneficiaire: withdrawBeneficiaire.trim() || undefined,
      });

      if (!result) {
        Alert.alert(
          'Solde insuffisant',
          'Le montant demandé dépasse le solde disponible sur cette caisse.'
        );
        return;
      }

      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawMotif('');
      setWithdrawBeneficiaire('');
      Alert.alert(
        'Retrait enregistré',
        `${amt.toLocaleString('fr-FR')} FCFA retirés.\nNouveau solde global : ${
          useFinanceStore.getState().tresorerieGlobale.soldeTotal.toLocaleString('fr-FR')
        } FCFA.`
      );
    } catch (error) {
      Alert.alert('Retrait impossible', error instanceof Error ? error.message : 'Réessayez.');
    }
  };

  const sourceLabel = (s: SourceCaisse) => {
    switch (s) {
      case 'WAVE':
        return 'Wave';
      case 'ORANGE_MONEY':
        return 'Orange Money';
      case 'BANQUE':
        return 'Banque';
      default:
        return 'Caisse physique';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Tableau de bord Trésorier"
        subtitle="JCV Pay • Caisse & traçabilité"
        showBack
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
        variant="curved"
        rightAction={
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowWithdrawModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="remove-circle-outline" size={20} color={AppColors.white} />
          </TouchableOpacity>
        }
      />

      {!ready ? (
        <ListSkeleton count={5} />
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Identité Pastorale & Trésorerie */}
        <View style={styles.topCardContainer}>
          <Card style={styles.treasuryBadgeCard} variant="elevated">
            <View style={styles.treasuryHeaderRow}>
              <View style={styles.treasuryIcon}>
                <Ionicons name="shield-checkmark" size={26} color={AppColors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.officerName}>
                  {user ? `${user.prenom} ${user.nom}`.trim() : 'Trésorier'}
                </Text>
                <Text style={styles.officerRole}>Vue globale de la caisse • Mise à jour automatique</Text>
              </View>
              <Badge label="Trésorier" variant="accent" size="sm" />
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={[styles.quickCashAction, { flex: 1 }]}
                onPress={() => setShowCashModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={18} color={AppColors.white} />
                <Text style={styles.quickCashActionText}>Encaisser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickCashAction, styles.quickWithdrawAction, { flex: 1 }]}
                onPress={() => setShowWithdrawModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="remove-circle" size={18} color={AppColors.white} />
                <Text style={styles.quickCashActionText}>Retirer</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vision globale de la caisse</Text>
          <Text style={styles.sectionSubtitle}>
            L application ne garde pas l argent physique : elle compte ce qui entre et ce qui sort
          </Text>

          <Card style={styles.helpCard}>
            <Text style={styles.helpTitle}>La caisse principale</Text>
            <Text style={styles.helpLine}>
              L’argent de l’église y est regroupé. Pour un projet, créez une autre caisse et transférez.
            </Text>
          </Card>

          <Card style={styles.mainSoldeCard}>
            <Text style={styles.soldeLabel}>SOLDE DISPONIBLE MAINTENANT</Text>
            <Text style={styles.soldeNumber}>
              {tresorerie.soldeTotal.toLocaleString('fr-FR')}{' '}
              <Text style={styles.soldeCurrency}>FCFA</Text>
            </Text>
            <Text style={styles.soldeHint}>
              {payers.length} membres • {validatedPayments.length} versements confirmés •{' '}
              {utilisateurs.filter((u) => u.role === 'MEMBRE').length} membres inscrits
            </Text>
          </Card>

          <View style={styles.twoColsRow}>
            <Card style={styles.halfCard}>
              <Text style={styles.halfCardLabel}>Rentré ce mois</Text>
              <Text style={styles.valPositive}>
                +{tresorerie.entreesMois.toLocaleString('fr-FR')} F
              </Text>
              <Text style={styles.halfCardSub}>Tous les paiements crédités</Text>
            </Card>

            <Card style={styles.halfCard}>
              <Text style={styles.halfCardLabel}>Retiré ce mois</Text>
              <Text style={styles.valNegative}>
                -{tresorerie.sortiesMois.toLocaleString('fr-FR')} F
              </Text>
              <Text style={styles.halfCardSub}>Décaissements tracés</Text>
            </Card>
          </View>

          <Card style={styles.resteCard}>
            <View style={styles.resteRow}>
              <View>
                <Text style={styles.halfCardLabel}>Résultat du mois</Text>
                <Text
                  style={[
                    styles.resteValue,
                    { color: soldeRestant >= 0 ? AppColors.success : AppColors.danger },
                  ]}
                >
                  {soldeRestant >= 0 ? '+' : ''}
                  {soldeRestant.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
              <Ionicons
                name={soldeRestant >= 0 ? 'trending-up' : 'trending-down'}
                size={28}
                color={soldeRestant >= 0 ? AppColors.success : AppColors.danger}
              />
            </View>
          </Card>
        </View>

        {/* Onglets de navigation */}
        <View style={styles.tabsStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {[
              { id: 'VUE_GLOBALE', label: 'Vue globale' },
              { id: 'PAYEURS', label: `Membres (${payers.length})` },
              { id: 'JOURNAL', label: 'Journal caisse' },
              { id: 'CAISSES', label: 'Caisses' },
              { id: 'VALIDATIONS', label: `Validations (${pendingPayments.length})` },
              { id: 'ENCAISSEMENTS', label: `Transactions (${validatedPayments.length})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.id as TresorerieTab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* TAB 1: VUE GLOBALE & ACTIONS RAPIDES */}
        {activeTab === 'VUE_GLOBALE' && (
          <View style={styles.tabBody}>
            {/* Actions rapides */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionGridCard}
                onPress={() => setShowCashModal(true)}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="cash" size={24} color="#10B981" />
                </View>
                <Text style={styles.gridActionTitle}>Encaisser espèces</Text>
                <Text style={styles.gridActionSub}>Reçu instantané + solde à jour</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionGridCard}
                onPress={() => setShowWithdrawModal(true)}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="arrow-down-circle" size={24} color="#EF4444" />
                </View>
                <Text style={styles.gridActionTitle}>Retirer de la caisse</Text>
                <Text style={styles.gridActionSub}>Décaissement tracé automatiquement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionGridCard}
                onPress={() => router.push('/projet/nouveau')}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="add-circle" size={24} color="#0284C7" />
                </View>
                <Text style={styles.gridActionTitle}>Nouveau projet</Text>
                <Text style={styles.gridActionSub}>Publier une collecte pour l Église</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionGridCard}
                onPress={() => router.push('/caisse/nouvelle')}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="wallet" size={24} color="#D97706" />
                </View>
                <Text style={styles.gridActionTitle}>Nouvelle caisse</Text>
                <Text style={styles.gridActionSub}>Ouvrir une caisse visible aux membres</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionGridCard}
                onPress={() => setActiveTab('PAYEURS')}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="people" size={24} color="#10B981" />
                </View>
                <Text style={styles.gridActionTitle}>Qui a payé</Text>
                <Text style={styles.gridActionSub}>{payers.length} personnes référencées</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionGridCard}
                onPress={() => setActiveTab('VALIDATIONS')}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="time" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.gridActionTitle}>Validations</Text>
                <Text style={styles.gridActionSub}>
                  {pendingPayments.length} paiement{pendingPayments.length > 1 ? 's' : ''} en attente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionGridCard}
                onPress={() => setActiveTab('JOURNAL')}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="list" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.gridActionTitle}>Journal caisse</Text>
                <Text style={styles.gridActionSub}>Entrées & sorties détaillées</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'PAYEURS' && (
          <View style={styles.tabBody}>
            <Text style={styles.inlineHint}>
              Annuaire des membres de l’assemblée. L’historique des versements est dans l’onglet Transactions.
            </Text>
            <PayersDirectory variant="members" />
          </View>
        )}

        {/* TAB: JOURNAL DES MOUVEMENTS */}
        {activeTab === 'JOURNAL' && (
          <View style={styles.tabBody}>
            <Text style={styles.inlineHint}>
              Traçabilité complète : chaque entrée et chaque retrait avec motif.
            </Text>
            {mouvements.map((m) => (
              <Card key={m.id} style={styles.mouvementCard}>
                <View style={styles.valRow}>
                  <View
                    style={[
                      styles.valIconCircle,
                      {
                        backgroundColor:
                          m.type === 'ENTREE' ? '#ECFDF5' : '#FEE2E2',
                      },
                    ]}
                  >
                    <Ionicons
                      name={m.type === 'ENTREE' ? 'arrow-up' : 'arrow-down'}
                      size={18}
                      color={m.type === 'ENTREE' ? '#10B981' : '#EF4444'}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.valDonorName}>{m.motif}</Text>
                    <Text style={styles.valDateText}>
                      {m.date} • {m.heure} • {sourceLabel(m.source)}
                      {m.beneficiaire ? ` • ${m.beneficiaire}` : ''}
                    </Text>
                    <Text style={styles.valDateText}>Par {m.auteur}</Text>
                  </View>
                  <Text
                    style={[
                      styles.valAmountText,
                      { color: m.type === 'ENTREE' ? AppColors.success : AppColors.danger },
                    ]}
                  >
                    {m.type === 'ENTREE' ? '+' : '-'}
                    {m.montant.toLocaleString('fr-FR')} F
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* TAB 2: DÉTAIL DES CAISSES */}
        {activeTab === 'CAISSES' && (
          <View style={styles.tabBody}>
            <TouchableOpacity
              style={styles.openCaisseBtn}
              onPress={() => router.push('/caisse/nouvelle')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color={AppColors.white} />
              <Text style={styles.openCaisseBtnText}>Ouvrir une autre caisse</Text>
            </TouchableOpacity>

            <Text style={styles.inlineHint}>
              La caisse principale ne se supprime pas. Les autres caisses se transfèrent, puis se suppriment.
            </Text>

            <CaisseDesk />

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Comptes & moyens de paiement</Text>
            <View style={styles.caissesList}>
              {[
                { name: 'Compte Bancaire Église', amount: tresorerie.soldeBancaire, icon: 'business-outline', color: '#0C4A48', desc: 'Dépôts chèques et virements' },
                { name: 'Compte Wave Marchand', amount: tresorerie.soldeWave, icon: 'water-outline', color: '#1DA1F2', desc: 'Encaissements mobiles' },
                { name: 'Compte Orange Money Pro', amount: tresorerie.soldeOrangeMoney, icon: 'phone-portrait-outline', color: '#FF7900', desc: 'Dons par téléphone' },
                { name: 'Caisse Physique (Secrétariat)', amount: tresorerie.soldeCaissePhysique, icon: 'cash-outline', color: '#10B981', desc: 'Espèces remises au guichet' },
              ].map((c, i) => (
                <Card key={i} style={styles.caisseDetailCard} variant="elevated">
                  <View style={[styles.caisseIconCircle, { backgroundColor: c.color + '15' }]}>
                    <Ionicons name={c.icon as any} size={24} color={c.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.caisseDetailTitle}>{c.name}</Text>
                    <Text style={styles.caisseDetailDesc}>{c.desc}</Text>
                    <Text style={styles.caisseDetailAmount}>
                      {c.amount.toLocaleString('fr-FR')} FCFA
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* TAB 3: VALIDATIONS DES PAIEMENTS */}
        {activeTab === 'VALIDATIONS' && (
          <View style={styles.tabBody}>
            {pendingPayments.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color={AppColors.success} />
                <Text style={styles.emptyTitle}>Tous les paiements sont validés !</Text>
                <Text style={styles.emptySubtitle}>
                  Aucun versement en attente de vérification pour le moment.
                </Text>
              </Card>
            ) : (
              pendingPayments.map((tx) => {
                const cash = isCashPayment(tx.moyenPaiement);
                return (
                <Card key={tx.id} style={styles.validationCard} variant="elevated">
                  <View style={styles.validationHeader}>
                    <Badge label={cash ? 'Espèces' : 'À valider'} variant="warning" size="sm" />
                    <Text style={styles.validationDate}>{tx.date} à {tx.heure}</Text>
                  </View>

                  {cash ? (
                    <Text style={styles.validationCashNote}>
                      Paiement en espèces — confirmer après réception au guichet
                    </Text>
                  ) : null}

                  <Text style={styles.validationDonor}>{tx.donateurNom}</Text>
                  <Text style={styles.validationTitle}>{tx.titre}</Text>
                  <Text style={styles.validationMethod}>
                    {formatMoyenPaiementLabel(tx.moyenPaiement)}
                  </Text>

                  <View style={styles.validationBottomRow}>
                    <Text style={styles.validationAmount}>
                      {tx.montant.toLocaleString('fr-FR')} FCFA
                    </Text>
                    <TouchableOpacity
                      style={styles.validateBtn}
                      onPress={() => handleValidate(tx)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={AppColors.white} />
                      <Text style={styles.validateBtnText}>
                        {cash ? 'Confirmer espèces' : 'Valider'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
              })
            )}
          </View>
        )}

        {/* TAB 4: DERNIERS ENCAISSEMENTS */}
        {activeTab === 'ENCAISSEMENTS' && (
          <View style={styles.tabBody}>
            {validatedPayments.map((tx) => (
              <Card
                key={tx.id}
                style={styles.validatedCard}
                onPress={() => router.push(`/recu/${tx.id}`)}
              >
                <View style={styles.valRow}>
                  <View style={styles.valIconCircle}>
                    <Ionicons name="receipt-outline" size={20} color={AppColors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.valDonorName}>{tx.donateurNom}</Text>
                    <Text style={styles.valTxTitle} numberOfLines={1}>{tx.titre}</Text>
                    <Text style={styles.valDateText}>{tx.date} • {tx.recuNumero}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.valAmountText}>
                      +{tx.montant.toLocaleString('fr-FR')} F
                    </Text>
                    <Badge label="Certifié" variant="success" size="sm" />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
      )}

      {/* MODAL D'ENCAISSEMENT ESPÈCES DIRECT */}
      <Modal visible={showCashModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Encaisser des Espèces</Text>
                <Text style={styles.modalHeaderSub}>Génère immédiatement une quittance officielle</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCashModal(false)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.inputLabel}>Type de Contribution *</Text>
              <View style={styles.typeSelectorRow}>
                {[
                  { id: 'DIME', label: 'Dîme' },
                  { id: 'OFFRANDE', label: 'Offrande' },
                  { id: 'COTISATION', label: 'Cotisation' },
                  { id: 'PROJET', label: 'Projet' },
                ].map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typePill, cashType === t.id && styles.typePillActive]}
                    onPress={() => {
                      setCashType(t.id as 'DIME' | 'OFFRANDE' | 'COTISATION' | 'PROJET');
                      setCashProjetId('');
                      setCashProjetOpen(false);
                    }}
                  >
                    <Text style={[styles.typePillText, cashType === t.id && styles.typePillTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {cashType === 'PROJET' && (
                <>
                  <Text style={styles.inputLabel}>Projet concerné *</Text>
                  <TouchableOpacity
                    style={styles.projectSelect}
                    onPress={() => setCashProjetOpen((open) => !open)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.projectSelectText,
                        !projetSelectionne && styles.projectSelectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {projetSelectionne ? projetSelectionne.titre : 'Choisir un projet'}
                    </Text>
                    <Ionicons
                      name={cashProjetOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={AppColors.textSecondary}
                    />
                  </TouchableOpacity>
                  {cashProjetOpen && (
                    <View style={styles.projectSelectList}>
                      {projetsOuverts.length === 0 ? (
                        <Text style={styles.projectEmpty}>
                          Aucun projet ouvert. Créez-en un avant d encaisser.
                        </Text>
                      ) : (
                        projetsOuverts.map((projet) => (
                          <TouchableOpacity
                            key={projet.id}
                            style={[
                              styles.projectOption,
                              cashProjetId === projet.id && styles.projectOptionActive,
                            ]}
                            onPress={() => {
                              setCashProjetId(projet.id);
                              setCashTitle(projet.titre);
                              setCashProjetOpen(false);
                            }}
                          >
                            <Text style={styles.projectOptionTitle}>{projet.titre}</Text>
                            <Text style={styles.projectOptionMeta}>
                              {projet.montantCollecte.toLocaleString('fr-FR')} / {projet.objectif.toLocaleString('fr-FR')} FCFA
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </>
              )}

              <Text style={styles.inputLabel}>Nom complet du Donateur / Membre *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Jean-Marc Kouassi"
                value={cashDonorName}
                onChangeText={setCashDonorName}
              />

              <Text style={styles.inputLabel}>Numéro de Téléphone (Optionnel)</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="+225 07 00 00 00 00"
                keyboardType="phone-pad"
                value={cashDonorPhone}
                onChangeText={setCashDonorPhone}
              />

              <Text style={styles.inputLabel}>Montant Reçu en Espèces (FCFA) *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 50000"
                keyboardType="numeric"
                value={cashAmount}
                onChangeText={setCashAmount}
              />

              <Text style={styles.inputLabel}>Motif / Intitulé</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Dîme de reconnaissance"
                value={cashTitle}
                onChangeText={setCashTitle}
              />

              <Button
                title="Encaisser & Émettre le Billet Officiel"
                onPress={handleRecordCash}
                variant="primary"
                size="lg"
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            <KeyboardSpacer />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* MODAL RETRAIT CAISSE */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Noter un retrait d argent</Text>
                <Text style={styles.modalHeaderSub}>
                  Exemple : achat, frais, avance — le solde baisse tout de suite
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.inputLabel}>Source du retrait *</Text>
              <View style={styles.typeSelectorRow}>
                {(
                  [
                    { id: 'CAISSE_PHYSIQUE', label: 'Caisse' },
                    { id: 'WAVE', label: 'Wave' },
                    { id: 'ORANGE_MONEY', label: 'OM' },
                    { id: 'BANQUE', label: 'Banque' },
                  ] as const
                ).map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typePill, withdrawSource === t.id && styles.typePillActive]}
                    onPress={() => setWithdrawSource(t.id)}
                  >
                    <Text
                      style={[
                        styles.typePillText,
                        withdrawSource === t.id && styles.typePillTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Montant à retirer (FCFA) *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 100000"
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />

              <Text style={styles.inputLabel}>Motif / Pourquoi *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Achat fournitures, frais mission..."
                value={withdrawMotif}
                onChangeText={setWithdrawMotif}
              />

              <Text style={styles.inputLabel}>Bénéficiaire (optionnel)</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Fournisseur, responsable..."
                value={withdrawBeneficiaire}
                onChangeText={setWithdrawBeneficiaire}
              />

              <Button
                title="Enregistrer le retrait dans le journal"
                onPress={handleWithdraw}
                variant="primary"
                size="lg"
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            <KeyboardSpacer />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showNewCaisseModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Ouvrir une nouvelle caisse</Text>
                <Text style={styles.modalHeaderSub}>
                  Visible pour les membres • Suivi du montant rentré
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowNewCaisseModal(false)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.inputLabel}>Nom de la caisse *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Caisse Climatisation Temple"
                value={newCaisseNom}
                onChangeText={setNewCaisseNom}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="Pour quoi cette caisse est ouverte"
                value={newCaisseDesc}
                onChangeText={setNewCaisseDesc}
              />

              <Text style={styles.inputLabel}>Objectif (FCFA) *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 5000000"
                keyboardType="numeric"
                value={newCaisseObjectif}
                onChangeText={setNewCaisseObjectif}
              />

              <Button
                title="Ouvrir la caisse pour les membres"
                onPress={async () => {
                  if (!newCaisseNom.trim() || !newCaisseObjectif.trim()) {
                    Alert.alert('Champs requis', 'Indiquez le nom et l objectif.');
                    return;
                  }
                  const obj = parseInt(newCaisseObjectif.replace(/\D/g, ''), 10) || 0;
                  try {
                    await openProjectCaisse({
                      nom: newCaisseNom.trim(),
                      description: newCaisseDesc.trim() || 'Nouvelle collecte',
                      objectif: obj,
                    });
                    setShowNewCaisseModal(false);
                    setNewCaisseNom('');
                    setNewCaisseDesc('');
                    setNewCaisseObjectif('');
                    Alert.alert(
                      'Caisse ouverte',
                      'Les membres voient maintenant cette caisse dans les projets / contributions.'
                    );
                  } catch (error) {
                    Alert.alert('Caisse non ouverte', error instanceof Error ? error.message : 'Réessayez.');
                  }
                }}
                variant="primary"
                size="lg"
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            <KeyboardSpacer />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCardContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  treasuryBadgeCard: {
    padding: 16,
    borderRadius: 22,
  },
  treasuryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  treasuryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: AppColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officerName: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  officerRole: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  quickCashAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  quickWithdrawAction: {
    backgroundColor: AppColors.danger,
  },
  quickCashActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.white,
  },
  resteCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
  },
  resteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resteValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  helpCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: 'rgba(242, 133, 0, 0.25)',
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 8,
  },
  helpLine: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  inlineHint: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginBottom: 4,
    lineHeight: 17,
  },
  payerCard: {
    padding: 14,
    borderRadius: 18,
  },
  payerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payerName: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  payerMeta: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 1,
  },
  payerLast: {
    fontSize: 10,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  payerTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 4,
  },
  payerHistory: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
    gap: 8,
  },
  payerTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  payerTxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  payerTxDate: {
    fontSize: 10,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  payerTxAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 4,
  },
  mouvementCard: {
    padding: 14,
    borderRadius: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  mainSoldeCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: AppColors.primary,
  },
  soldeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.accent,
    letterSpacing: 1,
  },
  soldeNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: AppColors.white,
    marginVertical: 4,
  },
  soldeCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  soldeHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  twoColsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  halfCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
  },
  halfCardLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  valPositive: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.success,
    marginVertical: 4,
  },
  valNegative: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.danger,
    marginVertical: 4,
  },
  halfCardSub: {
    fontSize: 10,
    color: AppColors.textMuted,
  },
  tabsStrip: {
    marginTop: 20,
    marginBottom: 8,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  tabButtonActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  tabButtonTextActive: {
    color: AppColors.white,
    fontWeight: '700',
  },
  tabBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionGridCard: {
    width: '48%',
    backgroundColor: AppColors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    ...Shadows.small,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  gridActionSub: {
    fontSize: 10,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  caissesList: {
    gap: 12,
  },
  caisseDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
  },
  caisseIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caisseDetailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  caisseDetailDesc: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  caisseDetailAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 4,
  },
  caisseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  openCaisseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  openCaisseBtnText: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  closeCaisseBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: AppColors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  closeCaisseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.accentDark,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  validationCard: {
    padding: 16,
    borderRadius: 18,
  },
  validationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationDate: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  validationDonor: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  validationTitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  validationCashNote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  validationMethod: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textMuted,
    marginTop: 6,
  },
  validationBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  validationAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
  },
  validateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.success,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  validateBtnText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  validatedCard: {
    padding: 14,
    borderRadius: 16,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valDonorName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  valTxTitle: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 1,
  },
  valDateText: {
    fontSize: 10,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  valAmountText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.success,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
    marginBottom: 14,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  modalHeaderSub: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  modalBody: {
    paddingTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: AppColors.background,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: AppColors.textPrimary,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  typePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: AppColors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  typePillActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  typePillTextActive: {
    color: AppColors.white,
    fontWeight: '700',
  },
  projectSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  projectSelectText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  projectSelectPlaceholder: {
    fontWeight: '500',
    color: AppColors.textMuted,
  },
  projectSelectList: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    backgroundColor: AppColors.white,
    overflow: 'hidden',
  },
  projectOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  projectOptionActive: {
    backgroundColor: AppColors.primaryMuted,
  },
  projectOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  projectOptionMeta: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  projectEmpty: {
    fontSize: 12,
    color: AppColors.textMuted,
    padding: 14,
  },
});
