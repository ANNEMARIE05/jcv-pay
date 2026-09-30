import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { HomeSkeleton } from '@/components/motion/Skeleton';
import { FadeInView } from '@/components/motion/FadeIn';
import { useScreenReady } from '@/hooks/useScreenReady';
import { ROLE_LABELS, canManageCampaigns } from '@/constants/roles';

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
  const changePassword = useAuthStore((s) => s.changePassword);
  const staff = canManageCampaigns(user?.role);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const ready = useScreenReady(520);

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
    ...(staff
      ? [
          {
            title: 'Gestion de l Église',
            items: [
              {
                id: 'new-project',
                title: 'Créer un projet',
                subtitle: 'Publier une collecte',
                icon: 'add-circle-outline',
                route: '/projet/nouveau',
              },
              {
                id: 'new-caisse',
                title: 'Ouvrir une caisse',
                subtitle: 'Visible par les fidèles',
                icon: 'wallet-outline',
                route: '/caisse/nouvelle',
              },
              {
                id: 'new-event',
                title: 'Créer un événement',
                icon: 'calendar-outline',
                route: '/evenement/nouveau',
              },
              {
                id: 'payers',
                title: 'Les fidèles',
                subtitle: 'Annuaire de l’assemblée',
                icon: 'people-outline',
                route: '/(tabs)/payeurs',
              },
              {
                id: 'treasury',
                title: 'Trésorerie',
                subtitle: 'Soldes, journal, validations',
                icon: 'stats-chart-outline',
                route: '/tresorerie',
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
          title: 'Mes informations',
          icon: 'person-outline',
          action: () =>
            Alert.alert(
              'Profil membre',
              `Nom : ${`${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim()}\nEmail : ${user?.email}\nTéléphone : ${user?.telephone}\nMatricule : ${user?.matricule}\nParoisse : ${user?.paroisse}\nRôle : ${user?.role}`
            ),
        },
        {
          id: 'history',
          title: 'Historique',
          icon: 'time-outline',
          route: '/historique',
        },
      ],
    },
    {
      title: 'Compte',
      items: [
        {
          id: 'password',
          title: 'Modifier le mot de passe',
          subtitle: 'À faire dès la première connexion',
          icon: 'lock-closed-outline',
          action: () => setPasswordOpen(true),
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'notifications-outline',
          route: '/notifications',
        },
        {
          id: 'help',
          title: 'Aide',
          icon: 'help-circle-outline',
          action: () =>
            Alert.alert(
              'Support Trésorerie',
              'Pour toute question sur vos reçus ou versements :\nEmail : tresorerie@jcvictoire.org\nTél : +225 27 22 00 11 22'
            ),
        },
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
      {!ready ? (
        <>
          <View style={{ height: topPadding + 12, backgroundColor: AppColors.primaryDark }} />
          <HomeSkeleton />
        </>
      ) : (
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
            {user ? `${user.prenom} ${user.nom}`.trim() : 'Membre'}
          </Text>
          <Text style={styles.profileRole}>
            {user ? ROLE_LABELS[user.role] : 'Fidèle'}
          </Text>
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
        <FadeInView index={4} style={styles.versionContainer}>
          <Text style={styles.versionText}>JCV Pay v1.0.0 • Application Finances</Text>
          <Text style={styles.copyrightText}>
            Église Jésus Christ Victoire © 2026
          </Text>
        </FadeInView>
      </ScrollView>
      )}
      <Modal visible={passwordOpen} transparent animationType="fade" onRequestClose={() => setPasswordOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nouveau mot de passe</Text>
            <Input
              label="Mot de passe actuel"
              value={oldPassword}
              onChangeText={setOldPassword}
              isPassword
              placeholder="••••••••"
            />
            <Input
              label="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
              placeholder="8 caractères minimum"
            />
            <Button
              title="Enregistrer"
              loading={savingPassword}
              onPress={async () => {
                if (newPassword.length < 8) {
                  Alert.alert('Mot de passe trop court', 'Utilisez au moins 8 caractères.');
                  return;
                }
                setSavingPassword(true);
                try {
                  await changePassword(oldPassword, newPassword);
                  setOldPassword('');
                  setNewPassword('');
                  setPasswordOpen(false);
                  Alert.alert('Mot de passe modifié', 'Utilisez-le lors de votre prochaine connexion.');
                } catch (error) {
                  Alert.alert(
                    'Modification impossible',
                    error instanceof Error ? error.message : 'Réessayez.'
                  );
                } finally {
                  setSavingPassword(false);
                }
              }}
            />
            <TouchableOpacity onPress={() => setPasswordOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </Card>
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
  profileRole: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.accent,
    marginTop: 4,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 20,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCancelText: {
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
});
