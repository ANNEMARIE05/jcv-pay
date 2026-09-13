import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { useNotificationStore } from '@/store/notificationStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'ios'
    ? Math.max(insets.top, 44)
    : Math.max(insets.top, StatusBar.currentHeight || 24);

  const user = useAuthStore((s) => s.user);
  const switchRole = useAuthStore((s) => s.switchRole);
  const isAdmin = user?.role === 'ADMINISTRATEUR' || user?.role === 'TRESORIER';

  const resume = useFinanceStore((s) => s.resume);
  const transactions = useFinanceStore((s) => s.transactions);
  const projets = useFinanceStore((s) => s.projets);
  const tresorerie = useFinanceStore((s) => s.tresorerieGlobale);
  const getPayersSummary = useFinanceStore((s) => s.getPayersSummary);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [activeCategory, setActiveCategory] = useState<'DIME' | 'COTISATION' | 'PROJET'>('DIME');
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);

  const quickAmounts = [5000, 10000, 25000, 50000];
  const featuredProject = projets[0];
  const payersCount = isAdmin ? getPayersSummary().length : 0;
  const validatedCount = transactions.filter((t) => t.statut === 'VALIDE').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} translucent={Platform.OS === 'android'} />

      {/* Barre supérieure fixe Deep Teal - Reste ancrée en haut, protège la barre d'état et l'accès au profil */}
      <View style={[styles.fixedHeader, { paddingTop: topInset + 6 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.userProfile}
            onPress={() => router.push('/(tabs)/profil')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'person'}
                size={20}
                color={isAdmin ? AppColors.accent : AppColors.primary}
              />
            </View>
            <View>
              <Text style={styles.greetingText}>Bonjour,</Text>
              <Text style={styles.userNameText} numberOfLines={1}>
                {user ? `${user.prenom} ${user.nom}` : 'Membre de l Église'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
            {/* Sélecteur rapide de rôle (Fidèle / Admin) */}
            <TouchableOpacity
              style={styles.roleSwitchPill}
              onPress={() => switchRole()}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'person-outline'}
                size={12}
                color={AppColors.accent}
              />
              <Text style={styles.roleSwitchText}>
                {isAdmin ? 'Admin' : 'Fidèle'}
              </Text>
              <Ionicons name="swap-horizontal" size={11} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color={AppColors.white} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section verte - Fait suite à la barre fixe et apporte le titre et la courbure */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              {isAdmin ? 'Caisse & suivi global' : 'Gérez vos finances & contributions'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isAdmin
                ? 'Solde, entrées, retraits et historiques — tout en un coup d œil'
                : 'Participez et suivez vos versements en toute transparence'}
            </Text>
          </View>
        </View>

        {isAdmin && (
          <View style={styles.adminBannerContainer}>
            <Card style={styles.adminOverviewCard} variant="elevated">
              <Text style={styles.adminOverviewLabel}>Solde caisse maintenant</Text>
              <Text style={styles.adminOverviewAmount}>
                {tresorerie.soldeTotal.toLocaleString('fr-FR')} FCFA
              </Text>
              <View style={styles.adminStatsRow}>
                <View style={styles.adminStatItem}>
                  <Text style={styles.adminStatLabel}>Rentré</Text>
                  <Text style={styles.adminStatIn}>
                    +{tresorerie.entreesMois.toLocaleString('fr-FR')}
                  </Text>
                </View>
                <View style={styles.adminStatItem}>
                  <Text style={styles.adminStatLabel}>Retiré</Text>
                  <Text style={styles.adminStatOut}>
                    -{tresorerie.sortiesMois.toLocaleString('fr-FR')}
                  </Text>
                </View>
                <View style={styles.adminStatItem}>
                  <Text style={styles.adminStatLabel}>Payeurs</Text>
                  <Text style={styles.adminStatNeutral}>{payersCount}</Text>
                </View>
                <View style={styles.adminStatItem}>
                  <Text style={styles.adminStatLabel}>Validés</Text>
                  <Text style={styles.adminStatNeutral}>{validatedCount}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.adminBanner}
                onPress={() => router.push('/tresorerie')}
                activeOpacity={0.85}
              >
                <View style={styles.adminBannerIcon}>
                  <Ionicons name="wallet" size={20} color={AppColors.white} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.adminBannerTitle}>Ouvrir la trésorerie</Text>
                  <Text style={styles.adminBannerSub}>
                    Caisses, qui a payé, retraits & validations →
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.adminQuickLinks}>
                <TouchableOpacity
                  style={styles.adminQuickLink}
                  onPress={() => router.push('/admin-panel')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="shield-checkmark" size={18} color={AppColors.primary} />
                  <Text style={styles.adminQuickLinkText}>Administration</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adminQuickLink}
                  onPress={() => router.push('/tresorerie')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="layers-outline" size={18} color={AppColors.primary} />
                  <Text style={styles.adminQuickLinkText}>Caisses</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adminQuickLink}
                  onPress={() => {
                    switchRole();
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="swap-horizontal" size={18} color={AppColors.accent} />
                  <Text style={styles.adminQuickLinkText}>Vue membre</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Floating Financial Action Card (Signature Card from Screen 6) */}
        <View style={[styles.cardContainer, isAdmin && styles.cardContainerAdmin]}>
          <Card style={styles.mainCard} variant="elevated">
            {/* Category Filter Pills inside Card */}
            <View style={styles.pillsRow}>
              {(
                [
                  { id: 'DIME', label: 'Dîmes & Dons' },
                  { id: 'COTISATION', label: 'Cotisations' },
                  { id: 'PROJET', label: 'Projets' },
                ] as const
              ).map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.pill, isActive && styles.pillActive]}
                    onPress={() => setActiveCategory(tab.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Total Balance & Stats Row */}
            <View style={styles.balanceSection}>
              <View>
                <Text style={styles.balanceLabel}>Total contribué (2026)</Text>
                <Text style={styles.balanceAmount}>
                  {resume.totalContribue.toLocaleString('fr-FR')} <Text style={styles.currency}>FCFA</Text>
                </Text>
              </View>

              <View style={styles.dueRow}>
                <View style={styles.dueBox}>
                  <Text style={styles.dueLabel}>Reste dû</Text>
                  <Text style={styles.dueAmount}>
                    {resume.resteAPayer.toLocaleString('fr-FR')} F
                  </Text>
                </View>
                <View style={styles.pendingBox}>
                  <Text style={styles.pendingLabel}>En attente</Text>
                  <Text style={styles.pendingAmount}>
                    {resume.enAttente.toLocaleString('fr-FR')} F
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Amount Selector */}
            <View style={styles.quickAmountContainer}>
              <Text style={styles.sectionMiniLabel}>Montant rapide</Text>
              <View style={styles.amountsRow}>
                {quickAmounts.map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.amtBtn, isSelected && styles.amtBtnSelected]}
                      onPress={() => setSelectedAmount(amt)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.amtText, isSelected && styles.amtTextSelected]}>
                        {(amt / 1000).toString()}k F
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Primary Action Button */}
            <Button
              title={`Contribuer (${selectedAmount.toLocaleString('fr-FR')} FCFA)`}
              onPress={() => {
                router.push({
                  pathname: '/contribution/nouvelle',
                  params: {
                    type: activeCategory,
                    preselectedAmount: selectedAmount.toString(),
                  },
                });
              }}
              size="lg"
              variant="primary"
              style={styles.contribBtn}
            />
          </Card>
        </View>

        {/* Featured Project Section (Screen 6 "Hot News" / Featured banner) */}
        {featuredProject && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Projet en cours</Text>
                <Text style={styles.sectionSubtitle}>Campagne de collecte prioritaire</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/projets')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>Voir tout →</Text>
              </TouchableOpacity>
            </View>

            <Card
              style={styles.projectCard}
              onPress={() => router.push(`/projet/${featuredProject.id}`)}
            >
              <View style={styles.projectCardHeader}>
                <View style={styles.projectIconBadge}>
                  <Ionicons name="business-outline" size={24} color={AppColors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {featuredProject.titre}
                  </Text>
                  <Text style={styles.projectOrganizer}>
                    {featuredProject.organisateur}
                  </Text>
                </View>
                <Badge label="En cours" variant="accent" size="sm" />
              </View>

              <View style={styles.projectProgressSection}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressAmountText}>
                    {featuredProject.montantCollecte.toLocaleString('fr-FR')} FCFA
                  </Text>
                  <Text style={styles.progressPercentText}>
                    {Math.round(
                      (featuredProject.montantCollecte / featuredProject.objectif) * 100
                    )}
                    %
                  </Text>
                </View>
                <ProgressBar
                  progress={featuredProject.montantCollecte / featuredProject.objectif}
                  height={8}
                  color={AppColors.accent}
                />
                <Text style={styles.projectGoalText}>
                  Objectif : {featuredProject.objectif.toLocaleString('fr-FR')} FCFA •{' '}
                  {featuredProject.participantsCount} donateurs
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Recent Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {isAdmin ? 'Derniers paiements (tous)' : 'Dernières transactions'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isAdmin
                  ? 'Qui a payé, quand, et pour quel motif'
                  : 'Historique de vos contributions'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/historique')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>Voir tout l historique →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {transactions.slice(0, 4).map((tx) => (
              <Card
                key={tx.id}
                style={styles.txCard}
                onPress={() => router.push(`/recu/${tx.id}`)}
              >
                <View style={styles.txRow}>
                  <View style={styles.txIconContainer}>
                    <Ionicons
                      name={
                        tx.type === 'DIME'
                          ? 'cash-outline'
                          : tx.type === 'PROJET'
                          ? 'hammer-outline'
                          : tx.type === 'EVENEMENT'
                          ? 'calendar-outline'
                          : 'gift-outline'
                      }
                      size={20}
                      color={AppColors.primary}
                    />
                  </View>

                  <View style={styles.txDetails}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.titre}
                    </Text>
                    <Text style={styles.txDate}>
                      {isAdmin ? `${tx.donateurNom} • ` : ''}
                      {tx.date} • {tx.heure}
                    </Text>
                  </View>

                  <View style={styles.txRight}>
                    <Text style={styles.txAmount}>
                      {tx.montant.toLocaleString('fr-FR')} F
                    </Text>
                    <Badge
                      label={tx.statut === 'VALIDE' ? 'Validé' : 'En attente'}
                      variant={tx.statut === 'VALIDE' ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>
                </View>
              </Card>
            ))}

            {/* Direct button to full history */}
            <TouchableOpacity
              style={styles.fullHistoryBtn}
              onPress={() => router.push('/historique')}
              activeOpacity={0.8}
            >
              <Ionicons name="receipt-outline" size={18} color={AppColors.primary} />
              <Text style={styles.fullHistoryBtnText}>
                Consulter tout l historique ({transactions.length} quittances)
              </Text>
              <Ionicons name="chevron-forward" size={16} color={AppColors.primary} />
            </TouchableOpacity>
          </View>
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
    paddingBottom: 130,
  },
  fixedHeader: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 14,
    zIndex: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSection: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 48,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleSwitchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  roleSwitchText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.white,
  },
  adminBannerContainer: {
    paddingHorizontal: 20,
    marginTop: -28,
    marginBottom: 12,
    zIndex: 10,
  },
  adminOverviewCard: {
    padding: 16,
    borderRadius: 20,
  },
  adminOverviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  adminOverviewAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
    marginBottom: 12,
  },
  adminStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  adminStatItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  adminStatLabel: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
  adminStatIn: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.success,
    marginTop: 2,
  },
  adminStatOut: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.danger,
    marginTop: 2,
  },
  adminStatNeutral: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
  },
  adminBanner: {
    backgroundColor: AppColors.accent,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminQuickLinks: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  adminQuickLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: AppColors.primaryMuted,
    paddingVertical: 10,
    borderRadius: 12,
  },
  adminQuickLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  adminBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.white,
  },
  adminBannerSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  greetingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: AppColors.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.white,
  },
  heroTextContainer: {
    marginTop: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.white,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: -28,
  },
  cardContainerAdmin: {
    marginTop: 0,
  },
  mainCard: {
    padding: 20,
    borderRadius: 24,
  },
  pillsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F7',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  pillActive: {
    backgroundColor: AppColors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  pillTextActive: {
    color: AppColors.white,
    fontWeight: '700',
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
    paddingBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  dueRow: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueLabel: {
    fontSize: 11,
    color: AppColors.danger,
    fontWeight: '600',
  },
  dueAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.danger,
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingLabel: {
    fontSize: 11,
    color: AppColors.warning,
    fontWeight: '600',
  },
  pendingAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.warning,
  },
  quickAmountContainer: {
    marginTop: 14,
    marginBottom: 16,
  },
  sectionMiniLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  amountsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  amtBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCFC',
  },
  amtBtnSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryMuted,
  },
  amtText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  amtTextSelected: {
    color: AppColors.primary,
  },
  contribBtn: {
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },
  projectCard: {
    padding: 16,
    borderRadius: 20,
  },
  projectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  projectIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  projectOrganizer: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  projectProgressSection: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressAmountText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.accent,
  },
  projectGoalText: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 6,
  },
  transactionsList: {
    gap: 10,
  },
  txCard: {
    padding: 14,
    borderRadius: 16,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  txDate: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
  },
  fullHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primaryMuted,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(12, 74, 72, 0.15)',
  },
  fullHistoryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },
});
