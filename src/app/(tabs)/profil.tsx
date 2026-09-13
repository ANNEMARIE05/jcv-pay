import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';

interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  route?: string;
  badge?: string;
  action?: () => void;
  isDestructive?: boolean;
}

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios'
    ? Math.max(insets.top, 44)
    : Math.max(insets.top, StatusBar.currentHeight || 24) + 8;

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const switchRole = useAuthStore((s) => s.switchRole);
  const resume = useFinanceStore((s) => s.resume);

  const isAdmin = user?.role === 'ADMINISTRATEUR' || user?.role === 'TRESORIER';

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de votre compte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuSections: { title: string; items: ProfileMenuItem[] }[] = [
    ...(isAdmin
      ? [
          {
            title: 'Direction & Trésorerie',
            items: [
              {
                id: 'treasury_dashboard',
                title: 'Tableau de bord Trésorier',
                subtitle: 'Comptabilité, caisses & encaissements',
                icon: 'wallet-outline',
                route: '/tresorerie',
              },
              {
                id: 'admin_dashboard',
                title: 'Espace Administration',
                subtitle: 'Validation des paiements, projets & membres',
                icon: 'shield-checkmark-outline',
                route: '/admin-panel',
              },
            ],
          },
        ]
      : []),
    {
      title: 'Mon espace',
      items: [
        {
          id: 'account',
          title: 'Informations personnelles',
          subtitle: `${user?.matricule} • ${user?.paroisse}`,
          icon: 'person-outline',
          action: () =>
            Alert.alert(
              'Profil membre',
              `Nom : ${user?.prenom} ${user?.nom}\nEmail : ${user?.email}\nTéléphone : ${user?.telephone}\nMatricule : ${user?.matricule}\nParoisse : ${user?.paroisse}\nRôle : ${user?.role}`
            ),
        },
        {
          id: 'receipts',
          title: 'Mes Quittances & Reçus fiscaux',
          subtitle: 'Télécharger les attestations annuelles',
          icon: 'receipt-outline',
          route: '/(tabs)/recus',
        },
        {
          id: 'history',
          title: 'Historique complet des versements',
          subtitle: 'Journal détaillé de toutes vos contributions',
          icon: 'time-outline',
          route: '/historique',
        },
        {
          id: 'pledges',
          title: 'Mes Engagements & Cotisations',
          subtitle: 'Suivi des échéances et promesses',
          icon: 'calendar-outline',
          route: '/(tabs)/contributions',
        },
      ],
    },
    {
      title: 'Sécurité & Préférences',
      items: [
        {
          id: 'security',
          title: 'Sécurité & Mot de passe',
          subtitle: 'Authentification à deux facteurs',
          icon: 'shield-checkmark-outline',
          action: () =>
            Alert.alert(
              'Sécurité',
              'Votre compte est protégé par code PIN et vérification OTP.'
            ),
        },
        {
          id: 'notifications',
          title: 'Notifications & Alertes',
          subtitle: 'Rappels de cotisations et cultes',
          icon: 'notifications-outline',
          route: '/notifications',
        },
        {
          id: 'help',
          title: 'Centre d aide & Trésorerie',
          subtitle: 'Contacter le secrétariat financier',
          icon: 'help-circle-outline',
          action: () =>
            Alert.alert(
              'Support Trésorerie',
              'Pour toute question sur vos reçus ou versements :\nEmail : tresorerie@jcvictoire.org\nTél : +225 27 22 00 11 22'
            ),
        },
      ],
    },
    {
      title: 'Compte',
      items: [
        {
          id: 'logout',
          title: 'Déconnexion',
          icon: 'log-out-outline',
          action: handleLogout,
          isDestructive: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Deep Teal Profile Header (Screen 15) */}
        <View style={[styles.header, { paddingTop: topPadding }]}>
          <View style={styles.headerTopBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={AppColors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTopTitle}>Mon Profil</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={44} color={AppColors.primary} />
            </View>
            <View style={styles.badgeChurch}>
              <Ionicons name="checkmark" size={14} color={AppColors.white} />
            </View>
          </View>

          <Text style={styles.profileName}>
            {user ? `${user.prenom} ${user.nom}` : 'Membre de l Église'}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <View style={styles.memberTagRow}>
            <Badge label={user?.matricule || 'JCV-MBR-1042'} variant="neutral" size="sm" />
            <Badge
              label={isAdmin ? '🛡️ Administrateur' : '👤 Membre Actif'}
              variant={isAdmin ? 'accent' : 'primary'}
              size="sm"
            />
          </View>

          {/* Quick Role Switcher Button */}
          <TouchableOpacity
            style={styles.switchRoleBtn}
            onPress={() => switchRole()}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={16} color={AppColors.white} />
            <Text style={styles.switchRoleBtnText}>
              {isAdmin
                ? 'Tester le Mode Membre / Fidèle'
                : 'Tester le Mode Trésorier / Admin'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Banner */}
        <View style={styles.statsWrapper}>
          <Card style={styles.statsCard} variant="elevated">
            <View style={styles.statCol}>
              <Text style={styles.statNum}>
                {(resume.totalContribue / 1000).toFixed(0)}k F
              </Text>
              <Text style={styles.statLbl}>Contributions 2026</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCol}>
              <Text style={styles.statNumAccent}>
                {(resume.resteAPayer / 1000).toFixed(0)}k F
              </Text>
              <Text style={styles.statLbl}>Engagements dus</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>
                {resume.projetsActifsCount}
              </Text>
              <Text style={styles.statLbl}>Projets soutenus</Text>
            </View>
          </Card>
        </View>

        {/* Menu Sections (Screen 15 Style) */}
        <View style={styles.menuContainer}>
          {menuSections.map((section, sIdx) => (
            <View key={sIdx} style={styles.sectionBlock}>
              <Text style={styles.sectionBlockTitle}>{section.title}</Text>
              <Card style={styles.sectionCard}>
                {section.items.map((item, iIdx) => {
                  const isLast = iIdx === section.items.length - 1;
                  return (
                    <React.Fragment key={item.id}>
                      <TouchableOpacity
                        style={styles.menuItemRow}
                        onPress={() => {
                          if (item.action) {
                            item.action();
                          } else if (item.route) {
                            router.push(item.route as any);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.menuIconCircle,
                            item.isDestructive && styles.destructiveIconCircle,
                          ]}
                        >
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color={item.isDestructive ? AppColors.danger : AppColors.primary}
                          />
                        </View>

                        <View style={styles.menuItemTextCol}>
                          <Text
                            style={[
                              styles.menuItemTitle,
                              item.isDestructive && styles.destructiveText,
                            ]}
                          >
                            {item.title}
                          </Text>
                          {item.subtitle ? (
                            <Text style={styles.menuItemSubtitle} numberOfLines={1}>
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={AppColors.border}
                        />
                      </TouchableOpacity>
                      {!isLast && <View style={styles.itemDivider} />}
                    </React.Fragment>
                  );
                })}
              </Card>
            </View>
          ))}
        </View>

        {/* Version info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>JCV Pay v1.0.0 • Application Finances</Text>
          <Text style={styles.copyrightText}>
            Église Jésus Christ Victoire © 2026
          </Text>
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
  header: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 36,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTopBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTopTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.white,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Shadows.medium,
  },
  badgeChurch: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.white,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  memberTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  switchRoleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.white,
  },
  statsWrapper: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  statsCard: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
  },
  statNumAccent: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.accent,
  },
  statLbl: {
    fontSize: 10,
    color: AppColors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: AppColors.borderLight,
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 20,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 0,
    borderRadius: 20,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  destructiveIconCircle: {
    backgroundColor: AppColors.dangerLight,
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  destructiveText: {
    color: AppColors.danger,
    fontWeight: '700',
  },
  itemDivider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginLeft: 66,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 28,
    paddingBottom: 10,
  },
  versionText: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 10,
    color: AppColors.textMuted,
    marginTop: 2,
  },
});
