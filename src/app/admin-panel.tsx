import React, { useEffect, useState } from 'react';
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
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { DISPLAY_PREF_ITEMS, useDisplayPrefsStore } from '@/store/displayPrefsStore';
import { ASSIGNABLE_ROLES, ROLE_LABELS, canManageCampaigns, canManageMoney, canManagePeople } from '@/constants/roles';
import { RoleUtilisateur, SourceCaisse } from '@/types';

type AdminTab = 'VALIDATIONS' | 'PROJETS' | 'CAISSES' | 'EVENEMENTS' | 'COTISATIONS' | 'MEMBRES';

export function AdminDashboard({ embedded = false }: { embedded?: boolean }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const user = useAuthStore((s) => s.user);
  const switchRole = useAuthStore((s) => s.switchRole);

  const tresorerie = useFinanceStore((s) => s.tresorerieGlobale);
  const transactions = useFinanceStore((s) => s.transactions);
  const projets = useFinanceStore((s) => s.projets);
  const evenements = useFinanceStore((s) => s.evenements);
  const cotisations = useFinanceStore((s) => s.cotisations);
  const caissesProjet = useFinanceStore((s) => s.caissesProjet);
  const closeProjectCaisse = useFinanceStore((s) => s.closeProjectCaisse);

  const validatePayment = useFinanceStore((s) => s.validatePayment);
  const rejectPayment = useFinanceStore((s) => s.rejectPayment);
  const addProject = useFinanceStore((s) => s.addProject);
  const addEvent = useFinanceStore((s) => s.addEvent);
  const addCotisation = useFinanceStore((s) => s.addCotisation);
  const recordCashPayment = useFinanceStore((s) => s.recordCashPayment);
  const recordWithdrawal = useFinanceStore((s) => s.recordWithdrawal);
  const mouvements = useFinanceStore((s) => s.mouvements);
  const utilisateurs = useFinanceStore((s) => s.utilisateurs);
  const addUser = useFinanceStore((s) => s.addUser);
  const updateUserRole = useFinanceStore((s) => s.updateUserRole);
  const prefs = useDisplayPrefsStore();
  const money = canManageMoney(user?.role);
  const people = canManagePeople(user?.role);
  const campaigns = canManageCampaigns(user?.role);

  const [activeTab, setActiveTab] = useState<AdminTab>(money ? 'VALIDATIONS' : 'MEMBRES');

  useEffect(() => {
    setActiveTab(money ? 'VALIDATIONS' : 'MEMBRES');
  }, [money, people, user?.role]);

  // Modals visibility
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCotisationModal, setShowCotisationModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [roleUserId, setRoleUserId] = useState<string | null>(null);

  // New Project Form State
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjGoal, setNewProjGoal] = useState('');
  const [newProjCategory, setNewProjCategory] = useState<'CONSTRUCTION' | 'EQUIPEMENT' | 'MISSION' | 'SOCIAL'>('CONSTRUCTION');
  const [newProjOrganizer, setNewProjOrganizer] = useState('Conseil Pastoral & Bâtisseurs');
  const [newProjDateFin, setNewProjDateFin] = useState('31 Décembre 2026');
  const [newProjDesc, setNewProjDesc] = useState('');

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('Samedi 26 Septembre 2026');
  const [newEventTime, setNewEventTime] = useState('09h00 - 16h30');
  const [newEventPlace, setNewEventPlace] = useState('Grand Temple de la Victoire');
  const [newEventSpeaker, setNewEventSpeaker] = useState('Pasteur Samuel');
  const [newEventPrice, setNewEventPrice] = useState('0');
  const [newEventSeats, setNewEventSeats] = useState('300');
  const [newEventDesc, setNewEventDesc] = useState('');

  // New Cotisation Form State
  const [newCotisTitle, setNewCotisTitle] = useState('');
  const [newCotisAmount, setNewCotisAmount] = useState('25000');
  const [newCotisCategory, setNewCotisCategory] = useState<'COTISATION' | 'DIME' | 'EPARGNE' | 'PROJET'>('COTISATION');
  const [newCotisDeadline, setNewCotisDeadline] = useState('31 Octobre 2026');

  // New Cash Payment Form State
  const [cashDonorName, setCashDonorName] = useState('');
  const [cashDonorPhone, setCashDonorPhone] = useState('+225 ');
  const [cashAmount, setCashAmount] = useState('');
  const [cashType, setCashType] = useState<'DIME' | 'OFFRANDE' | 'COTISATION' | 'PROJET'>('DIME');
  const [cashTitle, setCashTitle] = useState('Dîme reçue au secrétariat');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMotif, setWithdrawMotif] = useState('');
  const [withdrawBeneficiaire, setWithdrawBeneficiaire] = useState('');
  const [withdrawSource, setWithdrawSource] = useState<SourceCaisse>('CAISSE_PHYSIQUE');

  const [newUserPrenom, setNewUserPrenom] = useState('');
  const [newUserNom, setNewUserNom] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+225 ');
  const [newUserRole, setNewUserRole] = useState<RoleUtilisateur>('MEMBRE');

  const pendingPayments = transactions.filter((t) => t.statut === 'EN_ATTENTE');

  const handleValidate = (txId: string, donateur: string, montant: number) => {
    Alert.alert(
      'Valider l encaissement',
      `Confirmez-vous la réception des ${montant.toLocaleString('fr-FR')} FCFA de ${donateur} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, Valider',
          onPress: () => {
            validatePayment(txId);
            Alert.alert(
              'Encaissement Validé !',
              `Le versement a été crédité. Le billet/reçu officiel de ${donateur} est maintenant téléchargeable.`
            );
          },
        },
      ]
    );
  };

  const handleReject = (txId: string, donateur: string) => {
    Alert.alert(
      'Rejeter le versement',
      `Confirmez-vous le rejet du versement de ${donateur} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: () => {
            rejectPayment(txId);
            Alert.alert('Paiement rejeté', 'Le statut a été mis à jour.');
          },
        },
      ]
    );
  };

  // Submit Project
  const handleCreateProject = () => {
    if (!newProjTitle.trim() || !newProjGoal.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir au minimum le titre et le montant cible en FCFA.');
      return;
    }
    const goalNumber = parseInt(newProjGoal.replace(/\D/g, ''), 10) || 5000000;
    addProject({
      titre: newProjTitle.trim(),
      description: newProjDesc.trim() || 'Projet pour l expansion du Royaume et de l Église.',
      categorie: newProjCategory,
      objectif: goalNumber,
      dateFin: newProjDateFin,
      statut: 'EN_COURS',
      imageUrl: 'https://images.unsplash.com/photo-1548625361-1959779df303?auto=format&fit=crop&w=800&q=80',
      organisateur: newProjOrganizer,
      lieu: 'Sanctuaire Principal',
    });

    setShowProjectModal(false);
    setNewProjTitle('');
    setNewProjGoal('');
    setNewProjDesc('');
    setActiveTab('PROJETS');
    Alert.alert('Projet créé avec succès !', 'Le projet est désormais visible par tous les fidèles sur l application.');
  };

  // Submit Event
  const handleCreateEvent = () => {
    if (!newEventTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner le titre du séminaire ou de la conférence.');
      return;
    }
    const priceNum = parseInt(newEventPrice.replace(/\D/g, ''), 10) || 0;
    const seatsNum = parseInt(newEventSeats.replace(/\D/g, ''), 10) || 200;

    addEvent({
      titre: newEventTitle.trim(),
      description: newEventDesc.trim() || 'Rassemblement spirituel sous la direction du Pasteur Samuel.',
      date: newEventDate,
      heure: newEventTime,
      lieu: newEventPlace,
      tarif: priceNum,
      placesDisponibles: seatsNum,
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      intervenant: newEventSpeaker || 'Pasteur Samuel',
    });

    setShowEventModal(false);
    setNewEventTitle('');
    setNewEventDesc('');
    setActiveTab('EVENEMENTS');
    Alert.alert('Événement programmé !', 'Les fidèles peuvent dès maintenant s inscrire et réserver leurs pass.');
  };

  // Submit Cotisation
  const handleCreateCotisation = () => {
    if (!newCotisTitle.trim() || !newCotisAmount.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le titre et le montant par membre.');
      return;
    }
    const amtNum = parseInt(newCotisAmount.replace(/\D/g, ''), 10) || 25000;

    addCotisation({
      titre: newCotisTitle.trim(),
      categorie: newCotisCategory,
      montantTotal: amtNum,
      echeance: newCotisDeadline,
    });

    setShowCotisationModal(false);
    setNewCotisTitle('');
    setActiveTab('COTISATIONS');
    Alert.alert('Campagne de cotisation créée !', 'Elle est active et accessible dans la section Cotisations.');
  };

  // Submit Cash
  const handleCreateCashPayment = () => {
    if (!cashDonorName.trim() || !cashAmount.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom du fidèle et le montant en espèces.');
      return;
    }
    const amtNum = parseInt(cashAmount.replace(/\D/g, ''), 10) || 10000;

    const recu = recordCashPayment({
      donateurNom: cashDonorName.trim(),
      donateurTelephone: cashDonorPhone.trim() || '+225 07 00 00 00 00',
      montant: amtNum,
      type: cashType,
      titre: cashTitle || `${cashType} reçue au secrétariat`,
    });

    setShowCashModal(false);
    setCashDonorName('');
    setCashAmount('');

    Alert.alert(
      'Encaissement Espèces Enregistré !',
      `Reçu officiel N° ${recu.numeroRecu} émis avec succès pour ${cashDonorName}.\nLa caisse physique a été créditée de ${amtNum.toLocaleString('fr-FR')} FCFA.`,
      [
        { text: 'Fermer' },
        { text: 'Voir le Billet', onPress: () => router.push(`/recu/${recu.id}`) },
      ]
    );
  };

  const handleCreateUser = () => {
    if (!newUserPrenom.trim() || !newUserNom.trim() || !newUserEmail.trim()) {
      Alert.alert('Champs requis', 'Saisissez le prénom, le nom et l email.');
      return;
    }
    const created = addUser({
      prenom: newUserPrenom,
      nom: newUserNom,
      email: newUserEmail,
      telephone: newUserPhone.trim() || '+225 07 00 00 00 00',
      role: newUserRole,
    });
    setShowUserModal(false);
    setNewUserPrenom('');
    setNewUserNom('');
    setNewUserEmail('');
    setNewUserPhone('+225 ');
    setNewUserRole('MEMBRE');
    setActiveTab('MEMBRES');
    Alert.alert(
      'Compte créé',
      `${created.prenom} ${created.nom} peut se connecter avec ${created.email}. Rôle : ${ROLE_LABELS[created.role]}.`
    );
  };

  const handleChangeRole = (userId: string) => {
    setRoleUserId(userId);
  };

  const handleWithdraw = () => {
    if (!withdrawMotif.trim() || !withdrawAmount.trim()) {
      Alert.alert('Champs obligatoires', 'Indiquez le montant et le motif du retrait.');
      return;
    }
    const amt = parseInt(withdrawAmount.replace(/\D/g, ''), 10) || 0;
    if (amt <= 0) {
      Alert.alert('Montant invalide', 'Saisissez une somme positive.');
      return;
    }
    const result = recordWithdrawal({
      montant: amt,
      motif: withdrawMotif.trim(),
      source: withdrawSource,
      auteur: user ? `${user.prenom} ${user.nom}`.trim() : 'Trésorier',
      beneficiaire: withdrawBeneficiaire.trim() || undefined,
    });
    if (!result) {
      Alert.alert('Solde insuffisant', 'Ce montant dépasse le solde de cette caisse.');
      return;
    }
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setWithdrawMotif('');
    setWithdrawBeneficiaire('');
    Alert.alert('Sortie enregistrée', `${amt.toLocaleString('fr-FR')} FCFA ont été retirés de la caisse.`);
  };

  return (
    <View style={styles.container}>
      <Header
        title={embedded ? (money ? 'Caisse' : 'Gestion') : 'Espace Administration'}
        subtitle={
          money && people
            ? 'Comptes, projets, caisses et argent'
            : money
              ? 'Confirmez l argent, ouvrez les caisses et les projets'
              : 'Créez les comptes, projets, caisses et campagnes'
        }
        showBack={!embedded}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
        variant="curved"
        rightAction={
          <View style={styles.headerActions}>
            {embedded ? (
              <TouchableOpacity
                style={styles.switchRoleHeaderBtn}
                onPress={() => switchRole()}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal" size={16} color={AppColors.white} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.switchRoleHeaderBtn}
              onPress={() => setShowPrefsModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={18} color={AppColors.white} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (embedded ? 110 : 60) + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCardContainer}>
          <Card style={styles.adminCard} variant="elevated">
            <View style={styles.adminHeaderRow}>
              <View style={[styles.adminIconCircle, money && styles.tresorIconCircle]}>
                <Ionicons
                  name={money ? 'wallet' : 'people'}
                  size={26}
                  color={money ? AppColors.accent : AppColors.primary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.adminName}>
                  {user ? `${user.prenom} ${user.nom}`.trim() : 'Trésorier'}
                </Text>
                <Text style={styles.adminRoleTag}>
                  {user ? ROLE_LABELS[user.role] : 'Administration'}
                </Text>
              </View>
            </View>

            <Text style={styles.adminHowTo}>
              {money && people
                ? 'Vous gérez les comptes, les campagnes et l argent : projets, caisses, validations et sorties.'
                : money
                  ? 'Le fidèle verse hors de l appli. Vous confirmez ici, ouvrez les caisses et les projets, et notez les sorties.'
                  : 'Vous créez les comptes, les projets et les caisses. Le trésorier confirme l argent reçu.'}
            </Text>
          </Card>
        </View>

        {money && prefs.adminSolde ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Argent disponible</Text>
          <Text style={styles.sectionSubtitle}>Caisse Wave, Orange Money, banque et espèces</Text>

          <View style={styles.statsGrid}>
            <Card style={styles.statBoxPrimary}>
              <Text style={styles.statBoxLabel}>SOLDE TOTAL DISPONIBLE</Text>
              <Text style={styles.statBoxBigValue}>
                {tresorerie.soldeTotal.toLocaleString('fr-FR')} FCFA
              </Text>
              <Text style={styles.statBoxHint}>Cumul banques, caisses mobiles & espèces</Text>
            </Card>

            <View style={styles.twoColsRow}>
              <Card style={styles.statBoxHalf}>
                <Text style={styles.statMiniLabel}>Entrées du mois</Text>
                <Text style={styles.statValueGreen}>
                  +{tresorerie.entreesMois.toLocaleString('fr-FR')} F
                </Text>
                <Text style={styles.statMiniSub}>Dîmes, dons & quêtes</Text>
              </Card>

              <Card style={styles.statBoxHalf}>
                <Text style={styles.statMiniLabel}>Dépenses du mois</Text>
                <Text style={styles.statValueRed}>
                  -{tresorerie.sortiesMois.toLocaleString('fr-FR')} F
                </Text>
                <Text style={styles.statMiniSub}>Travaux & œuvres</Text>
              </Card>
            </View>
          </View>

          <Card style={styles.caisseCard}>
            {[
              { label: 'Wave', value: tresorerie.soldeWave },
              { label: 'Orange Money', value: tresorerie.soldeOrangeMoney },
              { label: 'Banque', value: tresorerie.soldeBancaire },
              { label: 'Espèces', value: tresorerie.soldeCaissePhysique },
            ].map((line) => (
              <View key={line.label} style={styles.caisseRow}>
                <Text style={styles.caisseLabel}>{line.label}</Text>
                <Text style={styles.caisseValue}>{line.value.toLocaleString('fr-FR')} F</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.withdrawLink}
              onPress={() => setShowWithdrawModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-down-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.withdrawLinkText}>Noter une sortie de caisse</Text>
            </TouchableOpacity>
            {mouvements.slice(0, 3).map((mv) => (
              <Text key={mv.id} style={styles.mouvementLine}>
                {mv.type === 'SORTIE' ? '−' : '+'}
                {mv.montant.toLocaleString('fr-FR')} F · {mv.motif}
              </Text>
            ))}
          </Card>
        </View>
        ) : null}

        {!money && people ? (
          <View style={styles.section}>
            <Card style={styles.pendingHintCard}>
              <Ionicons name="time-outline" size={20} color={AppColors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingHintTitle}>
                  {pendingPayments.length === 0
                    ? 'Aucun versement en attente'
                    : `${pendingPayments.length} versement${pendingPayments.length > 1 ? 's' : ''} chez le trésorier`}
                </Text>
                <Text style={styles.pendingHintSub}>
                  Seul le trésorier confirme l argent et tient la caisse.
                </Text>
              </View>
            </Card>
          </View>
        ) : null}

        {prefs.adminQuickActions && (people || money) ? (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Text style={styles.sectionSubtitle}>
            Créer un projet, une caisse, un compte, ou ouvrir la trésorerie.
          </Text>

          <View style={styles.actionButtonsGrid}>
            {campaigns ? (
            <TouchableOpacity
              style={styles.actionGridBtn}
              onPress={() => router.push('/projet/nouveau')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionBtnIconCircle, { backgroundColor: AppColors.primaryMuted }]}>
                <Ionicons name="add-circle-outline" size={22} color={AppColors.primary} />
              </View>
              <Text style={styles.actionBtnTitle}>Nouveau projet</Text>
              <Text style={styles.actionBtnDesc}>Publier une collecte</Text>
            </TouchableOpacity>
            ) : null}

            {campaigns ? (
            <TouchableOpacity
              style={styles.actionGridBtn}
              onPress={() => router.push('/caisse/nouvelle')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionBtnIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="wallet-outline" size={22} color="#D97706" />
              </View>
              <Text style={styles.actionBtnTitle}>Nouvelle caisse</Text>
              <Text style={styles.actionBtnDesc}>Ouvrir une collecte</Text>
            </TouchableOpacity>
            ) : null}

            {campaigns ? (
            <TouchableOpacity
              style={styles.actionGridBtn}
              onPress={() => router.push('/evenement/nouveau')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionBtnIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="calendar-outline" size={22} color="#7C3AED" />
              </View>
              <Text style={styles.actionBtnTitle}>Nouvel événement</Text>
              <Text style={styles.actionBtnDesc}>Séminaire ou conférence</Text>
            </TouchableOpacity>
            ) : null}

            {people ? (
            <TouchableOpacity
              style={styles.actionGridBtn}
              onPress={() => setShowUserModal(true)}
              activeOpacity={0.85}
            >
              <View style={[styles.actionBtnIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="person-add-outline" size={22} color="#0284C7" />
              </View>
              <Text style={styles.actionBtnTitle}>Nouveau compte</Text>
              <Text style={styles.actionBtnDesc}>Fidèle, trésorier ou admin</Text>
            </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.actionGridBtn}
              onPress={() => router.push('/(tabs)/payeurs')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionBtnIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="people-outline" size={22} color="#0284C7" />
              </View>
              <Text style={styles.actionBtnTitle}>Tous les payeurs</Text>
              <Text style={styles.actionBtnDesc}>Qui a payé, sans exception</Text>
            </TouchableOpacity>

            {money ? (
            <TouchableOpacity
              style={styles.actionGridBtn}
              onPress={() => setShowCashModal(true)}
              activeOpacity={0.85}
            >
              <View style={[styles.actionBtnIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="cash-outline" size={22} color="#16A34A" />
              </View>
              <Text style={styles.actionBtnTitle}>Versement espèces</Text>
              <Text style={styles.actionBtnDesc}>Déjà reçu au secrétariat</Text>
            </TouchableOpacity>
            ) : null}

            {money ? (
            <TouchableOpacity
              style={styles.actionGridBtn}
              onPress={() => router.push('/tresorerie')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionBtnIconCircle, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="stats-chart-outline" size={22} color={AppColors.accent} />
              </View>
              <Text style={styles.actionBtnTitle}>Trésorerie complète</Text>
              <Text style={styles.actionBtnDesc}>Caisses, journal, payeurs</Text>
            </TouchableOpacity>
            ) : people ? (
            <TouchableOpacity
              style={styles.actionGridBtn}
              onPress={() => router.push('/tresorerie')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionBtnIconCircle, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="stats-chart-outline" size={22} color={AppColors.accent} />
              </View>
              <Text style={styles.actionBtnTitle}>Voir la trésorerie</Text>
              <Text style={styles.actionBtnDesc}>Caisses et soldes de l Église</Text>
            </TouchableOpacity>
            ) : null}
          </View>
        </View>
        ) : null}

        {(() => {
          const tabs = ([
              money && prefs.adminValidations
                ? { id: 'VALIDATIONS' as const, label: 'À confirmer', count: pendingPayments.length }
                : null,
              campaigns && prefs.adminCampagnes ? { id: 'PROJETS' as const, label: `Projets (${projets.length})` } : null,
              campaigns && prefs.adminCampagnes ? { id: 'CAISSES' as const, label: `Caisses (${caissesProjet.length})` } : null,
              campaigns && prefs.adminCampagnes ? { id: 'EVENEMENTS' as const, label: `Événements (${evenements.length})` } : null,
              campaigns && prefs.adminCampagnes ? { id: 'COTISATIONS' as const, label: `Cotisations (${cotisations.length})` } : null,
              people && prefs.adminMembres ? { id: 'MEMBRES' as const, label: `Comptes (${utilisateurs.length})` } : null,
            ].filter(Boolean) as { id: AdminTab; label: string; count?: number }[]);
          if (tabs.length === 0) return null;
          if (tabs.length === 1) return null;
          return (
        <View style={styles.tabsStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsStripContent}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.id as AdminTab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                  {tab.count !== undefined && tab.count > 0 && (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{tab.count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
          );
        })()}

        {money && activeTab === 'VALIDATIONS' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Versements à confirmer ({pendingPayments.length})
              </Text>
              <Text style={styles.sectionSub}>Cochez seulement si l argent est bien arrivé</Text>
            </View>

            {pendingPayments.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color={AppColors.success} />
                <Text style={styles.emptyTitle}>Rien à confirmer</Text>
                <Text style={styles.emptySub}>
                  Quand un fidèle déclare un versement Wave, Orange Money, virement ou espèces, il apparaît ici.
                </Text>
              </Card>
            ) : (
              pendingPayments.map((tx) => (
                <Card key={tx.id} style={styles.pendingCard} variant="elevated">
                  <View style={styles.pendingTop}>
                    <Badge label="En attente" variant="warning" size="sm" />
                    <Text style={styles.pendingDate}>
                      {tx.date} • {tx.heure}
                    </Text>
                  </View>

                  <Text style={styles.pendingTitle}>{tx.titre}</Text>

                  <View style={styles.pendingMetaBox}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLbl}>Donateur :</Text>
                      <Text style={styles.metaVal}>{tx.donateurNom}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLbl}>Téléphone :</Text>
                      <Text style={styles.metaVal}>{tx.donateurTelephone}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLbl}>Opérateur :</Text>
                      <Text style={styles.metaVal}>{tx.moyenPaiement.replace('_', ' ')}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLbl}>Montant déclaré :</Text>
                      <Text style={styles.metaAmount}>
                        {tx.montant.toLocaleString('fr-FR')} FCFA
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleReject(tx.id, tx.donateurNom)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={16} color={AppColors.danger} />
                      <Text style={styles.rejectBtnText}>Rejeter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.validateBtn}
                      onPress={() => handleValidate(tx.id, tx.donateurNom, tx.montant)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark" size={16} color={AppColors.white} />
                      <Text style={styles.validateBtnText}>Valider l encaissement</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* TAB 2: GESTION DES PROJETS */}
        {campaigns && activeTab === 'PROJETS' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Projets & Travaux du Temple</Text>
              <TouchableOpacity onPress={() => router.push('/projet/nouveau')}>
                <Text style={styles.linkText}>+ Nouveau projet</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardsList}>
              {projets.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="folder-open-outline" size={42} color={AppColors.textMuted} />
                  <Text style={styles.emptyTitle}>Aucun projet</Text>
                  <Text style={styles.emptySub}>Créez le premier projet : une caisse de collecte sera ouverte en même temps.</Text>
                  <TouchableOpacity onPress={() => router.push('/projet/nouveau')} style={{ marginTop: 12 }}>
                    <Text style={styles.linkText}>Créer un projet</Text>
                  </TouchableOpacity>
                </Card>
              ) : null}
              {projets.map((p) => {
                const percent = Math.min(Math.round((p.montantCollecte / p.objectif) * 100), 100);
                return (
                  <Card key={p.id} style={styles.projectManageCard} variant="elevated">
                    <View style={styles.projectManageHeader}>
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{p.categorie}</Text>
                      </View>
                      <Badge label={`${percent}% financé`} variant={percent >= 75 ? 'success' : 'accent'} size="sm" />
                    </View>

                    <Text style={styles.itemTitle}>{p.titre}</Text>
                    <Text style={styles.itemSub}>{p.description}</Text>

                    <View style={styles.progressBox}>
                      <ProgressBar progress={percent / 100} height={7} />
                      <View style={styles.progressLabels}>
                        <Text style={styles.progressCollected}>
                          {p.montantCollecte.toLocaleString('fr-FR')} FCFA
                        </Text>
                        <Text style={styles.progressGoal}>
                          Cible : {p.objectif.toLocaleString('fr-FR')} FCFA
                        </Text>
                      </View>
                    </View>

                    <View style={styles.projectFooterRow}>
                      <Text style={styles.projectFooterMeta}>
                        👥 {p.participantsCount} donateurs • Échéance : {p.dateFin}
                      </Text>
                      <TouchableOpacity
                        style={styles.btnSmall}
                        onPress={() => router.push(`/projet/${p.id}`)}
                      >
                        <Text style={styles.btnSmallText}>Détail public →</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {campaigns && activeTab === 'CAISSES' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Caisses de collecte</Text>
              <TouchableOpacity onPress={() => router.push('/caisse/nouvelle')}>
                <Text style={styles.linkText}>+ Nouvelle caisse</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardsList}>
              {caissesProjet.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="wallet-outline" size={42} color={AppColors.textMuted} />
                  <Text style={styles.emptyTitle}>Aucune caisse</Text>
                  <Text style={styles.emptySub}>
                    Ouvrez une caisse autonome, ou créez un projet : une caisse liée est ouverte automatiquement.
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/caisse/nouvelle')} style={{ marginTop: 12 }}>
                    <Text style={styles.linkText}>Ouvrir une caisse</Text>
                  </TouchableOpacity>
                </Card>
              ) : (
                caissesProjet.map((c) => {
                  const percent = c.objectif
                    ? Math.min(Math.round((c.montantCollecte / c.objectif) * 100), 100)
                    : 0;
                  return (
                    <Card key={c.id} style={styles.projectManageCard} variant="elevated">
                      <View style={styles.projectManageHeader}>
                        <View style={styles.catBadge}>
                          <Text style={styles.catBadgeText}>Caisse</Text>
                        </View>
                        <Badge
                          label={c.statut === 'OUVERTE' ? 'Ouverte' : 'Terminée'}
                          variant={c.statut === 'OUVERTE' ? 'success' : 'neutral'}
                          size="sm"
                        />
                      </View>
                      <Text style={styles.itemTitle}>{c.nom}</Text>
                      <Text style={styles.itemSub}>{c.description}</Text>
                      <View style={styles.progressBox}>
                        <ProgressBar progress={percent / 100} height={7} />
                        <View style={styles.progressLabels}>
                          <Text style={styles.progressCollected}>
                            {c.montantCollecte.toLocaleString('fr-FR')} FCFA
                          </Text>
                          <Text style={styles.progressGoal}>
                            Cible : {c.objectif.toLocaleString('fr-FR')} FCFA
                          </Text>
                        </View>
                      </View>
                      {c.statut === 'OUVERTE' ? (
                        <TouchableOpacity
                          style={styles.btnSmall}
                          onPress={() => {
                            Alert.alert(
                              'Clôturer cette caisse ?',
                              `Marquer « ${c.nom} » comme terminée ? Le projet lié sera aussi clôturé.`,
                              [
                                { text: 'Annuler', style: 'cancel' },
                                {
                                  text: 'Oui, c est terminé',
                                  onPress: () => closeProjectCaisse(c.id),
                                },
                              ]
                            );
                          }}
                        >
                          <Text style={styles.btnSmallText}>Marquer terminée</Text>
                        </TouchableOpacity>
                      ) : null}
                    </Card>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* TAB 3: GESTION DES ÉVÉNEMENTS */}
        {campaigns && activeTab === 'EVENEMENTS' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Séminaires, Retraites & Conférences</Text>
              <TouchableOpacity onPress={() => router.push('/evenement/nouveau')}>
                <Text style={styles.linkText}>+ Nouvel événement</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardsList}>
              {evenements.map((ev) => (
                <Card key={ev.id} style={styles.eventManageCard} variant="elevated">
                  <View style={styles.eventManageHeader}>
                    <Badge
                      label={ev.tarif === 0 ? 'Entrée Libre' : `${ev.tarif.toLocaleString('fr-FR')} FCFA`}
                      variant={ev.tarif === 0 ? 'accent' : 'primary'}
                      size="sm"
                    />
                    <Text style={styles.eventSeatsText}>
                      {ev.placesReservees} / {ev.placesDisponibles} places
                    </Text>
                  </View>

                  <Text style={styles.itemTitle}>{ev.titre}</Text>

                  <View style={styles.eventMetaDetails}>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="calendar-outline" size={14} color={AppColors.primary} />
                      <Text style={styles.eventMetaVal}>{ev.date} • {ev.heure}</Text>
                    </View>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="location-outline" size={14} color={AppColors.primary} />
                      <Text style={styles.eventMetaVal}>{ev.lieu}</Text>
                    </View>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="mic-outline" size={14} color={AppColors.accent} />
                      <Text style={styles.eventMetaVal}>
                        Orateur : <Text style={{ fontWeight: '700' }}>{ev.intervenant || 'Pasteur Samuel'}</Text>
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.btnSmallPrimary}
                    onPress={() => router.push(`/evenement/${ev.id}`)}
                  >
                    <Text style={styles.btnSmallPrimaryText}>Voir la fiche d événement →</Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* TAB 4: GESTION DES COTISATIONS */}
        {campaigns && activeTab === 'COTISATIONS' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Campagnes de Cotisations</Text>
              <TouchableOpacity onPress={() => setShowCotisationModal(true)}>
                <Text style={styles.linkText}>+ Nouvelle cotisation</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardsList}>
              {cotisations.map((c) => (
                <Card key={c.id} style={styles.cotisationManageCard} variant="elevated">
                  <View style={styles.projectManageHeader}>
                    <View style={styles.catBadge}>
                      <Text style={styles.catBadgeText}>{c.categorie}</Text>
                    </View>
                    <Badge label={`Cible : ${c.montantTotal.toLocaleString('fr-FR')} F`} variant="primary" size="sm" />
                  </View>

                  <Text style={styles.itemTitle}>{c.titre}</Text>
                  <Text style={styles.itemSub}>Échéance fixée au : {c.echeance}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {people && activeTab === 'MEMBRES' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Comptes et rôles</Text>
              <TouchableOpacity onPress={() => setShowUserModal(true)}>
                <Text style={styles.linkText}>+ Nouveau compte</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>
              Touchez un rôle pour le changer. Un fidèle déclare. Un trésorier confirme. Un admin crée les comptes.
            </Text>

            <View style={styles.caissesList}>
              {utilisateurs.map((m) => (
                <Card key={m.id} style={styles.memberCard} variant="elevated">
                  <View style={styles.memberTop}>
                    <View style={styles.memberAvatar}>
                      <Ionicons name="person" size={20} color={AppColors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.memberName}>{`${m.prenom} ${m.nom}`.trim()}</Text>
                      <Text style={styles.memberMatricule}>{m.email} • {m.telephone}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleChangeRole(m.id)}>
                      <Badge label={ROLE_LABELS[m.role]} variant={m.role === 'MEMBRE' ? 'neutral' : 'accent'} size="sm" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.memberHint}>{m.matricule}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ========================================================
          MODAL 1: CRÉER UN NOUVEAU PROJET
         ======================================================== */}
      <Modal visible={showProjectModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Créer un Nouveau Projet</Text>
                <Text style={styles.modalHeaderSub}>Sous la direction de Pasteur Samuel</Text>
              </View>
              <TouchableOpacity onPress={() => setShowProjectModal(false)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.inputLabel}>Titre du Projet *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Extension de la Salle Polyvalente"
                value={newProjTitle}
                onChangeText={setNewProjTitle}
              />

              <Text style={styles.inputLabel}>Objectif Financier (FCFA) *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 10000000"
                keyboardType="numeric"
                value={newProjGoal}
                onChangeText={setNewProjGoal}
              />

              <Text style={styles.inputLabel}>Catégorie</Text>
              <View style={styles.catPickerRow}>
                {(['CONSTRUCTION', 'EQUIPEMENT', 'MISSION', 'SOCIAL'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catPickBtn, newProjCategory === cat && styles.catPickBtnActive]}
                    onPress={() => setNewProjCategory(cat)}
                  >
                    <Text style={[styles.catPickText, newProjCategory === cat && styles.catPickTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Organisateur / Comité</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="Comité des Bâtisseurs"
                value={newProjOrganizer}
                onChangeText={setNewProjOrganizer}
              />

              <Text style={styles.inputLabel}>Date d Échéance</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 31 Décembre 2026"
                value={newProjDateFin}
                onChangeText={setNewProjDateFin}
              />

              <Text style={styles.inputLabel}>Description du Projet</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                onFocus={scrollInputIntoView}
                placeholder="Expliquez la vision et l impact de ce projet..."
                multiline
                numberOfLines={3}
                value={newProjDesc}
                onChangeText={setNewProjDesc}
              />

              <Button
                title="Publier le Projet pour l Église"
                onPress={handleCreateProject}
                variant="primary"
                size="lg"
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            <KeyboardSpacer />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================
          MODAL 2: CRÉER UN NOUVEL ÉVÉNEMENT
         ======================================================== */}
      <Modal visible={showEventModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Créer un Événement / Séminaire</Text>
                <Text style={styles.modalHeaderSub}>Conférence, Culte spécial, Retraite</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.inputLabel}>Titre de l Événement *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Séminaire des Couples Victorieux"
                value={newEventTitle}
                onChangeText={setNewEventTitle}
              />

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Samedi 26 Septembre 2026"
                value={newEventDate}
                onChangeText={setNewEventDate}
              />

              <Text style={styles.inputLabel}>Horaire</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 09h00 - 16h30"
                value={newEventTime}
                onChangeText={setNewEventTime}
              />

              <Text style={styles.inputLabel}>Lieu</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="Grand Temple de la Victoire"
                value={newEventPlace}
                onChangeText={setNewEventPlace}
              />

              <Text style={styles.inputLabel}>Orateur Principal</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="Pasteur Samuel"
                value={newEventSpeaker}
                onChangeText={setNewEventSpeaker}
              />

              <Text style={styles.inputLabel}>Tarif (0 si Entrée Libre) (FCFA)</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="0"
                keyboardType="numeric"
                value={newEventPrice}
                onChangeText={setNewEventPrice}
              />

              <Text style={styles.inputLabel}>Nombre de Places Disponibles</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="300"
                keyboardType="numeric"
                value={newEventSeats}
                onChangeText={setNewEventSeats}
              />

              <Text style={styles.inputLabel}>Description & Programme</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                onFocus={scrollInputIntoView}
                placeholder="Description du thème et objectifs spirituels..."
                multiline
                numberOfLines={3}
                value={newEventDesc}
                onChangeText={setNewEventDesc}
              />

              <Button
                title="Enregistrer & Ouvrir les Inscriptions"
                onPress={handleCreateEvent}
                variant="primary"
                size="lg"
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            <KeyboardSpacer />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================
          MODAL 3: CRÉER UNE COTISATION
         ======================================================== */}
      <Modal visible={showCotisationModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Nouvelle Cotisation d Église</Text>
                <Text style={styles.modalHeaderSub}>Campagne de mobilisation financière</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCotisationModal(false)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.inputLabel}>Titre de la Cotisation *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Cotisation Fête des Moissons 2026"
                value={newCotisTitle}
                onChangeText={setNewCotisTitle}
              />

              <Text style={styles.inputLabel}>Montant par Fidèle (FCFA) *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="25000"
                keyboardType="numeric"
                value={newCotisAmount}
                onChangeText={setNewCotisAmount}
              />

              <Text style={styles.inputLabel}>Date Limite / Échéance</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 31 Octobre 2026"
                value={newCotisDeadline}
                onChangeText={setNewCotisDeadline}
              />

              <Button
                title="Lancer la Campagne"
                onPress={handleCreateCotisation}
                variant="primary"
                size="lg"
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            <KeyboardSpacer />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================
          MODAL 4: ENCAISSER DES ESPÈCES AU GUICHET
         ======================================================== */}
      <Modal visible={showCashModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Encaisser des Espèces au Guichet</Text>
                <Text style={styles.modalHeaderSub}>Génère instantanément un reçu officiel</Text>
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
              <Text style={styles.inputLabel}>Nom & Prénom du Fidèle *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Yao Kouadio Paul"
                value={cashDonorName}
                onChangeText={setCashDonorName}
              />

              <Text style={styles.inputLabel}>Téléphone du Fidèle</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="+225 07 00 00 00 00"
                keyboardType="phone-pad"
                value={cashDonorPhone}
                onChangeText={setCashDonorPhone}
              />

              <Text style={styles.inputLabel}>Montant Reçu en Liquide (FCFA) *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 50000"
                keyboardType="numeric"
                value={cashAmount}
                onChangeText={setCashAmount}
              />

              <Text style={styles.inputLabel}>Type de Versement</Text>
              <View style={styles.catPickerRow}>
                {(['DIME', 'OFFRANDE', 'COTISATION', 'PROJET'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.catPickBtn, cashType === t && styles.catPickBtnActive]}
                    onPress={() => {
                      setCashType(t);
                      setCashTitle(`${t} reçue au secrétariat`);
                    }}
                  >
                    <Text style={[styles.catPickText, cashType === t && styles.catPickTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Libellé sur la Quittance</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="Dîme du mois au guichet"
                value={cashTitle}
                onChangeText={setCashTitle}
              />

              <Button
                title="Valider & Générer le Billet / Reçu"
                onPress={handleCreateCashPayment}
                variant="primary"
                size="lg"
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            <KeyboardSpacer />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Noter une sortie de caisse</Text>
                <Text style={styles.modalHeaderSub}>Achat, frais, avance — le solde baisse tout de suite</Text>
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
              <Text style={styles.inputLabel}>Source *</Text>
              <View style={styles.catPickerRow}>
                {([
                  { id: 'CAISSE_PHYSIQUE' as const, label: 'Caisse' },
                  { id: 'WAVE' as const, label: 'Wave' },
                  { id: 'ORANGE_MONEY' as const, label: 'OM' },
                  { id: 'BANQUE' as const, label: 'Banque' },
                ]).map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.catPickBtn, withdrawSource === t.id && styles.catPickBtnActive]}
                    onPress={() => setWithdrawSource(t.id)}
                  >
                    <Text style={[styles.catPickText, withdrawSource === t.id && styles.catPickTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Montant (FCFA) *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: 100000"
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
              <Text style={styles.inputLabel}>Motif *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Achat fournitures"
                value={withdrawMotif}
                onChangeText={setWithdrawMotif}
              />
              <Text style={styles.inputLabel}>Bénéficiaire (optionnel)</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="ex: Fournisseur"
                value={withdrawBeneficiaire}
                onChangeText={setWithdrawBeneficiaire}
              />
              <Button
                title="Enregistrer la sortie"
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

      <Modal visible={showUserModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Nouveau compte</Text>
                <Text style={styles.modalHeaderSub}>La personne se connecte avec son email</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Prénom *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="Amina"
                value={newUserPrenom}
                onChangeText={setNewUserPrenom}
              />
              <Text style={styles.inputLabel}>Nom *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="Yao"
                value={newUserNom}
                onChangeText={setNewUserNom}
              />
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="amina@jcvictoire.org"
                autoCapitalize="none"
                keyboardType="email-address"
                value={newUserEmail}
                onChangeText={setNewUserEmail}
              />
              <Text style={styles.inputLabel}>Téléphone</Text>
              <TextInput
                style={styles.modalInput}
                onFocus={scrollInputIntoView}
                placeholder="+225 07 00 00 00 00"
                keyboardType="phone-pad"
                value={newUserPhone}
                onChangeText={setNewUserPhone}
              />
              <Text style={styles.inputLabel}>Rôle</Text>
              {ASSIGNABLE_ROLES.map((r) => {
                const selected = newUserRole === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.rolePick, selected && styles.rolePickActive]}
                    onPress={() => setNewUserRole(r.id)}
                  >
                    <Text style={[styles.rolePickTitle, selected && styles.rolePickTitleActive]}>{r.label}</Text>
                    <Text style={styles.rolePickHint}>{r.hint}</Text>
                  </TouchableOpacity>
                );
              })}
              <Button
                title="Créer le compte"
                onPress={handleCreateUser}
                variant="primary"
                size="lg"
                style={{ marginTop: 16, marginBottom: 20 }}
              />
              <KeyboardSpacer />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showPrefsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Éléments affichés</Text>
                <Text style={styles.modalHeaderSub}>Masquez ce qui ne sert pas au quotidien</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPrefsModal(false)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {DISPLAY_PREF_ITEMS.filter((item) => {
                if (item.key === 'adminSolde' || item.key === 'adminValidations') return money;
                if (item.key === 'adminMembres' || item.key === 'adminCampagnes') return people;
                return money || people;
              }).map((item) => {
                const on = prefs[item.key];
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.prefRow}
                    onPress={() => prefs.toggle(item.key)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.prefArea}>{item.area}</Text>
                      <Text style={styles.prefTitle}>{item.title}</Text>
                      <Text style={styles.prefHint}>{item.hint}</Text>
                    </View>
                    <View style={[styles.prefSwitch, on && styles.prefSwitchOn]}>
                      <Text style={styles.prefSwitchText}>{on ? 'ON' : 'OFF'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <Button
                title="Fermer"
                onPress={() => setShowPrefsModal(false)}
                variant="outline"
                size="lg"
                style={{ marginTop: 8, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!roleUserId} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Changer le rôle</Text>
                <Text style={styles.modalHeaderSub}>
                  {(() => {
                    const u = utilisateurs.find((x) => x.id === roleUserId);
                    return u ? `${u.prenom} ${u.nom}`.trim() : '';
                  })()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRoleUserId(null)}>
                <Ionicons name="close-circle" size={26} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {ASSIGNABLE_ROLES.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.rolePick}
                  onPress={() => {
                    if (roleUserId) updateUserRole(roleUserId, r.id);
                    setRoleUserId(null);
                  }}
                >
                  <Text style={styles.rolePickTitle}>{r.label}</Text>
                  <Text style={styles.rolePickHint}>{r.hint}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    paddingBottom: 40,
  },
  switchRoleHeaderBtn: {
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
  adminCard: {
    padding: 18,
    borderRadius: 24,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  adminIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tresorIconCircle: {
    backgroundColor: AppColors.accentLight,
  },
  pendingHintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  pendingHintTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  pendingHintSub: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  adminName: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  adminRoleTag: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  adminHowTo: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  switchModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.primaryMuted,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  switchModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
    flex: 1,
    marginLeft: 8,
  },
  adminNavRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  adminNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: AppColors.primaryMuted,
    paddingVertical: 10,
    borderRadius: 12,
  },
  adminNavBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
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
    color: AppColors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSub: {
    fontSize: 12,
    color: AppColors.warning,
    fontWeight: '600',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },
  statsGrid: {
    gap: 10,
  },
  statBoxPrimary: {
    backgroundColor: AppColors.primary,
    padding: 18,
    borderRadius: 20,
  },
  statBoxLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statBoxBigValue: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.white,
    marginVertical: 4,
  },
  statBoxHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  twoColsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBoxHalf: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
  },
  statMiniLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  statValueGreen: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.success,
    marginVertical: 2,
  },
  statValueRed: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.danger,
    marginVertical: 2,
  },
  statMiniSub: {
    fontSize: 10,
    color: AppColors.textMuted,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionGridBtn: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: AppColors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    ...Shadows.small,
  },
  actionBtnIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  actionBtnDesc: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  tabsStrip: {
    marginTop: 22,
    marginBottom: 6,
  },
  tabsStripContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  tabTextActive: {
    color: AppColors.white,
  },
  tabBadge: {
    backgroundColor: AppColors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: AppColors.white,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  pendingCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  pendingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingDate: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 10,
  },
  pendingMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLbl: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  metaAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.danger,
    gap: 6,
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.danger,
  },
  validateBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    gap: 6,
  },
  validateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.white,
  },
  cardsList: {
    gap: 12,
  },
  projectManageCard: {
    padding: 16,
    borderRadius: 20,
  },
  projectManageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catBadge: {
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.primary,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  itemSub: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  progressBox: {
    marginTop: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressCollected: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.primary,
  },
  progressGoal: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  projectFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  projectFooterMeta: {
    fontSize: 11,
    color: AppColors.textSecondary,
    flex: 1,
  },
  btnSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: AppColors.primaryMuted,
  },
  btnSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  eventManageCard: {
    padding: 16,
    borderRadius: 20,
  },
  eventManageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventSeatsText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  eventMetaDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    marginVertical: 10,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventMetaVal: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  btnSmallPrimary: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
    marginTop: 4,
  },
  btnSmallPrimaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.white,
  },
  cotisationManageCard: {
    padding: 16,
    borderRadius: 18,
  },
  caissesList: {
    gap: 10,
  },
  caisseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
  },
  caisseIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caisseName: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  caisseSub: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  caisseAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.primary,
  },
  memberCard: {
    padding: 16,
    borderRadius: 18,
  },
  memberTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  memberMatricule: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  memberDivider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginVertical: 12,
  },
  memberBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCotisLabel: {
    fontSize: 10,
    color: AppColors.textMuted,
  },
  memberCotisVal: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 2,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
  },
  reminderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.accentDark,
  },
  upToDateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upToDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  modalHeaderSub: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  catPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPickBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  catPickBtnActive: {
    backgroundColor: AppColors.primary,
  },
  catPickText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  catPickTextActive: {
    color: AppColors.white,
  },
  memberHint: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 8,
  },
  rolePick: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: AppColors.borderLight,
  },
  rolePickActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryMuted,
  },
  rolePickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  rolePickTitleActive: {
    color: AppColors.primary,
  },
  rolePickHint: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  prefArea: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 2,
  },
  prefHint: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  prefSwitch: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  prefSwitchOn: {
    backgroundColor: AppColors.primary,
  },
  prefSwitchText: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  caisseCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
  },
  caisseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  caisseLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  caisseValue: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  withdrawLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  withdrawLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  mouvementLine: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 6,
  },
});

export default function AdminPanelRoute() {
  return <Redirect href="/(tabs)" />;
}
