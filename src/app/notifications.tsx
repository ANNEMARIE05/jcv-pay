import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { TabsSelector } from '@/components/common/TabsSelector';
import { useNotificationStore } from '@/store/notificationStore';

export default function NotificationsScreen() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const [filter, setFilter] = useState<'TOUTES' | 'NON_LUES' | 'PAIEMENT' | 'PROJET'>('TOUTES');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'NON_LUES':
        return notifications.filter((n) => !n.lue);
      case 'PAIEMENT':
        return notifications.filter((n) => n.type === 'PAIEMENT');
      case 'PROJET':
        return notifications.filter((n) => n.type === 'PROJET');
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const handlePressNotif = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    if (notif.type === 'PAIEMENT' && notif.referenceId) {
      router.push(`/recu/${notif.referenceId}`);
    } else if (notif.type === 'PROJET' && notif.referenceId) {
      router.push(`/projet/${notif.referenceId}`);
    } else if (notif.type === 'EVENEMENT' && notif.referenceId) {
      router.push(`/evenement/${notif.referenceId}`);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'PAIEMENT':
        return { name: 'checkmark-circle', color: AppColors.success, bg: AppColors.successLight };
      case 'ECHEANCE':
        return { name: 'time-outline', color: AppColors.warning, bg: AppColors.warningLight };
      case 'PROJET':
        return { name: 'business-outline', color: AppColors.primary, bg: AppColors.primaryMuted };
      case 'EVENEMENT':
        return { name: 'calendar-outline', color: AppColors.accent, bg: AppColors.accentLight };
      default:
        return { name: 'information-circle-outline', color: AppColors.info, bg: AppColors.infoLight };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        subtitle="Centre d alertes & rappels"
        showBack
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
        variant="curved"
        rightAction={
          <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
            <Ionicons name="checkmark-done-outline" size={22} color={AppColors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Pills */}
        <View style={styles.filterWrapper}>
          <TabsSelector
            tabs={[
              { id: 'TOUTES', label: 'Toutes' },
              {
                id: 'NON_LUES',
                label: 'Non lues',
                count: notifications.filter((n) => !n.lue).length,
              },
              { id: 'PAIEMENT', label: 'Finances' },
              { id: 'PROJET', label: 'Projets' },
            ]}
            activeTab={filter}
            onChangeTab={setFilter}
            scrollable
          />
        </View>

        {/* Notifications List */}
        <View style={styles.listContainer}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={44} color={AppColors.textMuted} />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySubtitle}>Vous êtes parfaitement à jour.</Text>
            </View>
          ) : (
            filtered.map((notif) => {
              const iconConfig = getNotifIcon(notif.type);
              return (
                <Card
                  key={notif.id}
                  style={[styles.notifCard, !notif.lue && styles.unreadCard]}
                  onPress={() => handlePressNotif(notif)}
                >
                  <View style={styles.notifRow}>
                    <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
                      <Ionicons
                        name={iconConfig.name as any}
                        size={22}
                        color={iconConfig.color}
                      />
                    </View>

                    <View style={styles.textCol}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.notifTitle, !notif.lue && styles.notifTitleBold]}>
                          {notif.titre}
                        </Text>
                        {!notif.lue && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notifMessage}>{notif.message}</Text>
                      <Text style={styles.notifDate}>{notif.date}</Text>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
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
    paddingBottom: 40,
  },
  filterWrapper: {
    paddingTop: 16,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  notifCard: {
    padding: 14,
    borderRadius: 18,
  },
  unreadCard: {
    borderColor: AppColors.primary,
    backgroundColor: '#FBFCFC',
    borderWidth: 1.5,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    flex: 1,
  },
  notifTitleBold: {
    fontWeight: '800',
    color: AppColors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.accent,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  notifDate: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    marginTop: 4,
  },
});
