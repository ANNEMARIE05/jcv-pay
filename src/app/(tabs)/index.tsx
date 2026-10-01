'use no memo';

import React from 'react';
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
import { FadeInView } from '@/components/motion/FadeIn';
import { HomeSkeleton } from '@/components/motion/Skeleton';
import { useScreenReady } from '@/hooks/useScreenReady';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { useNotificationStore } from '@/store/notificationStore';
import { isStaff } from '@/constants/roles';
import { AdminDashboard } from '@/app/admin-panel';
import { ProfileAvatar } from '@/components/common/ProfileAvatar';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'ios'
    ? Math.max(insets.top, 44)
    : Math.max(insets.top, StatusBar.currentHeight || 24);

  const user = useAuthStore((s) => s.user);
  const isAdmin = isStaff(user?.role);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const resume = useFinanceStore((s) => s.resume);
  const recus = useFinanceStore((s) => s.recus);

  const ready = useScreenReady(720);
  const recusCount = recus.filter((r) => r.statut !== 'EN_ATTENTE').length;
  const { displayUri } = useProfileAvatar();

  const memberShortcuts = [
    {
      id: 'contrib',
      label: 'Versement',
      icon: 'add-circle-outline' as const,
      route: '/contribution/nouvelle',
    },
    {
      id: 'recus',
      label: 'Mes reçus',
      icon: 'receipt-outline' as const,
      route: '/(tabs)/recus',
    },
    {
      id: 'projets',
      label: 'Projets',
      icon: 'grid-outline' as const,
      route: '/(tabs)/projets',
    },
  ];

  if (isAdmin) {
    return <AdminDashboard embedded />;
  }

  if (!ready) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} translucent={Platform.OS === 'android'} />
        <View style={{ height: topInset + 8, backgroundColor: AppColors.primary }} />
        <HomeSkeleton />
      </View>
    );
  }

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
            <ProfileAvatar uri={displayUri} size={44} iconSize={20} style={styles.avatarCircle} />
            <View>
              <Text style={styles.greetingText}>Bonjour,</Text>
              <Text style={styles.userNameText} numberOfLines={1}>
                {user ? `${user.prenom} ${user.nom}`.trim() : 'Membre de l Église'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
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
            <Text style={styles.heroTitle}>Mon espace</Text>
            <Text style={styles.heroHint}>
              Versements, reçus et projets de l’assemblée en un coup d’œil.
            </Text>
          </View>
        </View>

        <FadeInView style={styles.homeSheet}>
          <Card style={styles.summaryCard} variant="elevated">
            <Text style={styles.summaryTitle}>Mon suivi</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {resume.totalContribue.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.summaryLabel}>FCFA versés</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{recusCount}</Text>
                <Text style={styles.summaryLabel}>Reçus</Text>
              </View>
            </View>
          </Card>

          <Text style={styles.blockTitle}>Actions rapides</Text>
          <View style={styles.shortcutGrid}>
            {memberShortcuts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.shortcutBtn}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.85}
              >
                <View style={styles.shortcutIcon}>
                  <Ionicons name={item.icon} size={22} color={AppColors.primary} />
                </View>
                <Text style={styles.shortcutLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeInView>
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
  adminIntro: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  treasuryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 8,
  },
  treasuryLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.primary,
  },
  homeSheet: {
    paddingHorizontal: 20,
    marginTop: -28,
    paddingBottom: 8,
  },
  homeSheetAdmin: {
    marginTop: 8,
  },
  summaryCard: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: AppColors.borderLight,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  shortcutBtn: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: AppColors.white,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shortcutLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  emptyBlock: {
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  emptyBlockText: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  emptyLink: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
    marginTop: 8,
  },
  listCard: {
    padding: 14,
    marginBottom: 10,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  listCardMeta: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
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
  heroHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    lineHeight: 18,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  cardHint: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
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
  activityOverlap: {
    marginTop: -28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeaderCol: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  sectionHint: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
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
  emptyHint: {
    fontSize: 13,
    color: AppColors.textMuted,
    textAlign: 'center',
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
