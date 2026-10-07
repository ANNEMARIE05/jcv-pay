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
import { AppColors, Shadows } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Badge } from '@/components/common/Badge';
import { TabsSelector } from '@/components/common/TabsSelector';
import { SearchBar } from '@/components/common/SearchBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { usePagedList } from '@/hooks/usePagedList';
import { useFinanceStore } from '@/store/financeStore';
import { useAuthStore } from '@/store/authStore';
import { isStaff } from '@/constants/roles';
import { formatMoyenPaiementLabel } from '@/constants/versement';
import { TicketSkeleton } from '@/components/motion/Skeleton';
import { FadeInView } from '@/components/motion/FadeIn';
import { useScreenReady } from '@/hooks/useScreenReady';
import { Card } from '@/components/common/Card';

type StatusTab = 'TOUS' | 'VALIDE' | 'ECHEC';

export default function RecusScreen() {
  const user = useAuthStore((s) => s.user);
  const staff = isStaff(user?.role);
  const recus = useFinanceStore((s) => s.recus);
  const transactions = useFinanceStore((s) => s.transactions);

  const [activeTab, setActiveTab] = useState<StatusTab>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');
  const ready = useScreenReady(560);

  const visibleRecus = useMemo(
    () => recus.filter((r) => r.statut !== 'EN_ATTENTE'),
    [recus]
  );

  const visibleTransactions = useMemo(
    () => transactions.filter((t) => t.statut !== 'EN_ATTENTE'),
    [transactions]
  );

  const filteredRecus = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return visibleRecus.filter((r) => {
      const statusOk =
        activeTab === 'TOUS' ||
        r.statut === activeTab ||
        (activeTab === 'ECHEC' && (r.statut === 'ECHEC' || r.statut === 'REJETE' || r.statut === 'ANNULE'));
      const searchOk =
        !q ||
        r.titre.toLowerCase().includes(q) ||
        r.donateurNom.toLowerCase().includes(q) ||
        r.numeroRecu.toLowerCase().includes(q) ||
        r.donateurTelephone.toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [visibleRecus, activeTab, searchQuery]);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return visibleTransactions.filter((t) => {
      const statusOk =
        activeTab === 'TOUS' ||
        t.statut === activeTab ||
        (activeTab === 'ECHEC' && (t.statut === 'ECHEC' || t.statut === 'REJETE' || t.statut === 'ANNULE'));
      const searchOk =
        !q ||
        t.titre.toLowerCase().includes(q) ||
        t.donateurNom.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        (t.recuNumero && t.recuNumero.toLowerCase().includes(q)) ||
        t.donateurTelephone.toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [visibleTransactions, activeTab, searchQuery]);

  const recuPage = usePagedList(filteredRecus, 8, `recu|${activeTab}|${searchQuery}`);
  const txPage = usePagedList(filteredTransactions, 8, `tx|${activeTab}|${searchQuery}`);
  const page = staff ? txPage : recuPage;
  const listCount = staff ? filteredTransactions.length : filteredRecus.length;

  return (
    <View style={styles.container}>
      {/* Deep Teal Header (Screen 13 style) */}
      <Header
        title={staff ? 'Transactions' : 'Reçus'}
        showBack={staff}
        onBack={staff ? () => router.replace('/(tabs)') : undefined}
        variant="curved"
      />

      {!ready ? (
        <TicketSkeleton />
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Segmented Filter Bar (Screen 13 tabs: Ongoing, Completed, Canceled) */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.calendarBanner}
            onPress={() => router.push('/calendrier')}
            activeOpacity={0.88}
          >
            <View style={styles.calendarBannerIcon}>
              <Ionicons name="calendar" size={22} color={AppColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.calendarBannerTitle}>Calendrier des cultes</Text>
              <Text style={styles.calendarBannerSub}>
                Voir les dates et faire un versement lié à un événement
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={AppColors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={staff ? 'Rechercher une transaction, un nom…' : 'Rechercher un reçu, un nom, un n°…'}
          />
        </View>

        <View style={styles.tabsContainer}>
          <TabsSelector
            tabs={[
              {
                id: 'TOUS',
                label: 'Tous',
                count: staff ? visibleTransactions.length : visibleRecus.length,
              },
              {
                id: 'VALIDE',
                label: 'Validés',
                count: staff
                  ? visibleTransactions.filter((t) => t.statut === 'VALIDE').length
                  : visibleRecus.filter((r) => r.statut === 'VALIDE').length,
              },
              {
                id: 'ECHEC',
                label: 'Échecs',
                count: staff
                  ? visibleTransactions.filter((t) =>
                      t.statut === 'ECHEC' || t.statut === 'REJETE' || t.statut === 'ANNULE'
                    ).length
                  : visibleRecus.filter((r) =>
                      r.statut === 'ECHEC' || r.statut === 'REJETE' || r.statut === 'ANNULE'
                    ).length,
              },
            ]}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            variant="segmented"
          />
        </View>

        {/* List of Ticket Cards (Authentic train ticket style from Screen 13) */}
        <View style={styles.ticketsList}>
          {listCount === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name={staff ? 'swap-horizontal-outline' : 'receipt-outline'} size={48} color={AppColors.textMuted} />
              <Text style={styles.emptyTitle}>{staff ? 'Aucune transaction trouvée' : 'Aucun reçu trouvé'}</Text>
              <Text style={styles.emptySubtitle}>
                {staff
                  ? 'Les versements enregistrés apparaîtront ici.'
                  : 'Vos futurs paiements et cotisations apparaîtront ici.'}
              </Text>
            </View>
          ) : staff ? (
            txPage.pageItems.map((tx, i) => (
              <FadeInView key={tx.id} index={i}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push(`/recu/${tx.id}`)}
                >
                  <Card style={styles.staffTxCard} variant="elevated">
                    <View style={styles.staffTxTop}>
                      <Text style={styles.contributionTitle}>{tx.titre}</Text>
                      <Badge
                        label={tx.statut === 'VALIDE' ? 'Validé' : 'Échec'}
                        variant={tx.statut === 'VALIDE' ? 'success' : 'danger'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.label}>{tx.donateurNom}</Text>
                    <Text style={styles.val}>
                      {tx.date} • {tx.heure} • {tx.montant.toLocaleString('fr-FR')} FCFA
                    </Text>
                  </Card>
                </TouchableOpacity>
              </FadeInView>
            ))
          ) : (
            recuPage.pageItems.map((recu, i) => {
              return (
                <FadeInView key={recu.id} index={i}>
                <TouchableOpacity
                  key={recu.id}
                  style={styles.ticketCard}
                  onPress={() => router.push(`/recu/${recu.id}`)}
                  activeOpacity={0.85}
                >
                  {/* Ticket Header */}
                  <View style={styles.ticketHeader}>
                    <View style={styles.churchInfoRow}>
                      <View style={styles.churchIconCircle}>
                        <Ionicons name="book-outline" size={16} color={AppColors.primary} />
                      </View>
                      <View>
                        <Text style={styles.churchName}>{recu.egliseNom}</Text>
                        <Text style={styles.receiptNum}>N° {recu.numeroRecu}</Text>
                      </View>
                    </View>
                    <Badge
                      label={
                        recu.statut === 'VALIDE'
                          ? 'Validé'
                          : recu.statut === 'REJETE'
                            ? 'Rejeté'
                            : 'Échec de paiement'
                      }
                      variant={
                        recu.statut === 'VALIDE'
                          ? 'success'
                          : 'danger'
                      }
                      size="sm"
                    />
                  </View>

                  {/* Perforated Divider (Notched look) */}
                  <View style={styles.perforatedRow}>
                    <View style={[styles.notch, styles.notchLeft]} />
                    <View style={styles.dashedLine} />
                    <View style={[styles.notch, styles.notchRight]} />
                  </View>

                  {/* Ticket Body */}
                  <View style={styles.ticketBody}>
                    <Text style={styles.contributionTitle}>{recu.titre}</Text>
                    <Text style={styles.label}>{recu.donateurNom}</Text>

                    <View style={styles.infoGrid}>
                      <View style={styles.infoCol}>
                        <Text style={styles.label}>Date & Heure</Text>
                        <Text style={styles.val}>
                          {recu.date} • {recu.heure}
                        </Text>
                      </View>
                      <View style={styles.infoColRight}>
                        <Text style={styles.label}>Règlement</Text>
                        <Text style={styles.val}>{formatMoyenPaiementLabel(recu.moyenPaiement)}</Text>
                      </View>
                    </View>

                    <View style={styles.ticketFooter}>
                      <View>
                        <Text style={styles.amountLabel}>Montant versé</Text>
                        <Text style={styles.amountValue}>
                          {recu.montant.toLocaleString('fr-FR')} FCFA
                        </Text>
                      </View>

                      <View style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>Voir le billet</Text>
                        <Ionicons name="barcode-outline" size={18} color={AppColors.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                </FadeInView>
              );
            })
          )}
          <PaginationBar
            page={page.page}
            totalPages={page.totalPages}
            total={page.total}
            from={page.from}
            to={page.to}
            onPageChange={page.setPage}
            label={staff ? 'transactions' : 'reçus'}
          />
        </View>
      </ScrollView>
      )}
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
  tabsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  calendarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  calendarBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  calendarBannerSub: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  ticketsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  staffTxCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 4,
  },
  staffTxTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  ticketCard: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    ...Shadows.ticket,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  churchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  churchIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  churchName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  receiptNum: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontFamily: 'monospace',
  },
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  notch: {
    width: 16,
    height: 20,
    backgroundColor: AppColors.background,
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  notchLeft: {
    left: -8,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: AppColors.borderLight,
  },
  notchRight: {
    right: -8,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: AppColors.borderLight,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: AppColors.border,
    marginHorizontal: 16,
  },
  ticketBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contributionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoColRight: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  val: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  amountLabel: {
    fontSize: 10,
    color: AppColors.textSecondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 1,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
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
    textAlign: 'center',
  },
});
