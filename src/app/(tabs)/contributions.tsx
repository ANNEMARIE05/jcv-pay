import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { TabsSelector } from '@/components/common/TabsSelector';
import { PaginationBar } from '@/components/common/PaginationBar';
import { FilterChips } from '@/components/common/FilterChips';
import { usePagedList } from '@/hooks/usePagedList';
import { useFinanceStore } from '@/store/financeStore';
import { ListSkeleton } from '@/components/motion/Skeleton';
import { useScreenReady } from '@/hooks/useScreenReady';
import { scrollInputIntoView } from '@/utils/scrollInputIntoView';

const CATEGORIES = [
  { id: 'TOUS', label: 'Tous' },
  { id: 'COTISATION', label: 'Cotisations' },
  { id: 'DIME', label: 'Dîmes' },
  { id: 'OFFRANDE', label: 'Offrandes' },
  { id: 'PROJET', label: 'Projets' },
  { id: 'EPARGNE', label: 'Épargne' },
];

const WEEK_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function mondayOf(d: Date) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export default function ContributionsScreen() {
  const transactions = useFinanceStore((s) => s.transactions);
  const cotisationsStatutaires = useFinanceStore((s) => s.cotisations);

  const [activeCategory, setActiveCategory] = useState('TOUS');
  const [cotisStatut, setCotisStatut] = useState<'TOUS' | 'A_PAYER' | 'PARTIEL' | 'PAYE'>('TOUS');
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => toDateKey(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const ready = useScreenReady(600);

  const todayKey = toDateKey(new Date());
  const weekDays = useMemo(() => {
    return WEEK_SHORT.map((name, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        key: toDateKey(d),
        day: String(d.getDate()),
        name,
        isSunday: d.getDay() === 0,
        isToday: toDateKey(d) === todayKey,
      };
    });
  }, [weekStart, todayKey]);

  const shiftWeek = (dir: -1 | 1) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + dir * 7);
    setWeekStart(next);
    const keep = new Date(next);
    keep.setDate(next.getDate() + 3);
    setSelectedDay(toDateKey(keep));
  };

  const filteredCotisations = useMemo(() => {
    return cotisationsStatutaires.filter((c) => {
      const matchCat = activeCategory === 'TOUS' || c.categorie === activeCategory;
      const matchSearch =
        c.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.categorie.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatut = cotisStatut === 'TOUS' || c.statut === cotisStatut;
      return matchCat && matchSearch && matchStatut;
    });
  }, [activeCategory, searchQuery, cotisStatut, cotisationsStatutaires]);

  const cotisPage = usePagedList(filteredCotisations, 6, `${activeCategory}|${searchQuery}|${cotisStatut}`);
  const txPage = usePagedList(transactions, 6, 'tx');

  return (
    <View style={styles.container}>
      {/* Deep Teal Curved Header (Screen 7) */}
      <Header
        title="Cotisations"
        showBack
        onBack={() => router.replace('/(tabs)')}
        variant="curved"
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => router.push('/contribution/nouvelle')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={AppColors.white} />
          </TouchableOpacity>
        }
      />

      {!ready ? (
        <ListSkeleton count={5} />
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Search Bar Container */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={AppColors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une cotisation, un engagement..."
              placeholderTextColor={AppColors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={scrollInputIntoView}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={AppColors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Calendrier hebdo — section dédiée, plus lisible */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarSectionHeader}>
            <View>
              <Text style={styles.calendarSectionTitle}>Cette semaine</Text>
            </View>
            <View style={styles.weekNav}>
              <TouchableOpacity style={styles.weekNavBtn} onPress={() => shiftWeek(-1)} activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={16} color={AppColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fullCalendarBtn}
                onPress={() => router.push('/calendrier')}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={16} color={AppColors.primary} />
                <Text style={styles.fullCalendarBtnText}>Mois</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.weekNavBtn} onPress={() => shiftWeek(1)} activeOpacity={0.8}>
                <Ionicons name="chevron-forward" size={16} color={AppColors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScroll}
          >
            {weekDays.map((d) => {
              const isSelected = selectedDay === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[
                    styles.dayCard,
                    isSelected && styles.dayCardActive,
                    d.isToday && !isSelected && styles.dayCardToday,
                  ]}
                  onPress={() => setSelectedDay(d.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayName,
                      isSelected && styles.dayNameActive,
                    ]}
                  >
                    {d.name}
                  </Text>
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextActive,
                    ]}
                  >
                    {d.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Categories Pills */}
        <View style={styles.categoriesSection}>
          <TabsSelector
            tabs={CATEGORIES}
            activeTab={activeCategory}
            onChangeTab={setActiveCategory}
            scrollable
          />
          <View style={{ marginTop: 10 }}>
            <FilterChips
              value={cotisStatut}
              onChange={setCotisStatut}
              options={[
                { id: 'TOUS', label: 'Tous' },
                { id: 'A_PAYER', label: 'À payer' },
                { id: 'PARTIEL', label: 'Partiel' },
                { id: 'PAYE', label: 'Payé' },
              ]}
            />
          </View>
        </View>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Engagements</Text>
          </View>

          <View style={styles.cardsList}>
            {filteredCotisations.length === 0 ? (
              <Card style={styles.cotisationCard}>
                <Text style={styles.agendaDesc}>Aucun engagement pour le moment.</Text>
              </Card>
            ) : (
            cotisPage.pageItems.map((item) => {
              const isPaid = item.statut === 'PAYE';
              const isPartial = item.statut === 'PARTIEL';

              return (
                <Card key={item.id} style={styles.cotisationCard} variant="elevated">
                  {/* Top Row: Title & Badge */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.categorie}</Text>
                    </View>
                    <Badge
                      label={
                        isPaid
                          ? 'Soldé'
                          : isPartial
                          ? `Reste ${item.resteAPayer.toLocaleString('fr-FR')} F`
                          : 'À payer'
                      }
                      variant={isPaid ? 'success' : isPartial ? 'warning' : 'danger'}
                      size="sm"
                    />
                  </View>

                  <Text style={styles.itemTitle}>{item.titre}</Text>

                  {/* Middle Ticket-like details */}
                  <View style={styles.ticketDetailsRow}>
                    <View style={styles.ticketDetailCol}>
                      <Text style={styles.detailLabel}>Échéance</Text>
                      <Text style={styles.detailValue}>{item.echeance}</Text>
                    </View>

                    <View style={styles.ticketDivider} />

                    <View style={styles.ticketDetailCol}>
                      <Text style={styles.detailLabel}>Versé</Text>
                      <Text style={styles.detailValueGreen}>
                        {item.montantVerse.toLocaleString('fr-FR')} F
                      </Text>
                    </View>

                    <View style={styles.ticketDivider} />

                    <View style={styles.ticketDetailCol}>
                      <Text style={styles.detailLabel}>Objectif / Total</Text>
                      <Text style={styles.detailValue}>
                        {item.montantTotal.toLocaleString('fr-FR')} F
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Action Row */}
                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.priceLabel}>Montant à régler</Text>
                      <Text style={styles.priceValue}>
                        {item.resteAPayer > 0
                          ? `${item.resteAPayer.toLocaleString('fr-FR')} FCFA`
                          : '0 FCFA (À jour)'}
                      </Text>
                    </View>

                    {item.resteAPayer > 0 ? (
                      <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => {
                          router.push({
                            pathname: '/contribution/nouvelle',
                            params: {
                              titre: item.titre,
                              type: item.categorie,
                              preselectedAmount: item.resteAPayer.toString(),
                            },
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.payBtnText}>Payer</Text>
                        <Ionicons name="arrow-forward" size={16} color={AppColors.white} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.viewReceiptBtn}
                        onPress={() => router.push('/(tabs)/recus')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="receipt-outline" size={16} color={AppColors.primary} />
                        <Text style={styles.viewReceiptText}>Voir reçu</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })
            )}
            <PaginationBar
              page={cotisPage.page}
              totalPages={cotisPage.totalPages}
              total={cotisPage.total}
              from={cotisPage.from}
              to={cotisPage.to}
              onPageChange={cotisPage.setPage}
              label="engagements"
            />
          </View>
        </View>

        {transactions.length > 0 ? (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Tous les paiements</Text>
          {txPage.pageItems.map((tx) => (
            <Card
              key={tx.id}
              style={styles.historyCard}
              onPress={() => router.push(`/recu/${tx.recuNumero}`)}
            >
              <View style={styles.historyRow}>
                <Ionicons name="checkmark-circle" size={22} color={AppColors.success} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.historyItemTitle}>{tx.titre}</Text>
                  <Text style={styles.historyItemDate}>{tx.date} • Réf: {tx.reference}</Text>
                </View>
                <Text style={styles.historyItemAmount}>
                  +{tx.montant.toLocaleString('fr-FR')} F
                </Text>
              </View>
            </Card>
          ))}
          <PaginationBar
            page={txPage.page}
            totalPages={txPage.totalPages}
            total={txPage.total}
            from={txPage.from}
            to={txPage.to}
            onPageChange={txPage.setPage}
            label="paiements"
          />
        </View>
        ) : null}
      </ScrollView>
      )}

      {/* Floating CTA Button for quick new contribution */}
      <View style={styles.floatingContainer}>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => router.push('/contribution/nouvelle')}
          activeOpacity={0.85}
        >
          <Ionicons name="heart" size={20} color={AppColors.accent} />
          <Text style={styles.floatingBtnText}>Faire un don ou offrande libre</Text>
          <Ionicons name="chevron-forward" size={18} color={AppColors.white} />
        </TouchableOpacity>
      </View>
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
  headerAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: AppColors.textPrimary,
  },
  calendarStrip: {
    marginBottom: 14,
  },
  calendarSection: {
    marginBottom: 16,
    paddingTop: 2,
  },
  calendarSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  calendarSectionSub: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  fullCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  fullCalendarBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
  },
  calendarScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dayCard: {
    width: 62,
    height: 72,
    borderRadius: 18,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayCardActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayCardToday: {
    borderColor: AppColors.primary,
    borderWidth: 1.5,
  },
  dayText: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  dayTextActive: {
    color: AppColors.white,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  dayNameActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dayCardSpecial: {
    borderColor: AppColors.accent,
    borderWidth: 1.5,
    backgroundColor: '#FFFBF2',
  },
  dayTextSpecial: {
    color: AppColors.accentDark,
  },
  dayNameSpecial: {
    color: AppColors.accentDark,
    fontWeight: '700',
  },
  agendaDayContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  agendaCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: AppColors.white,
    borderWidth: 1.5,
    borderColor: 'rgba(12, 74, 72, 0.12)',
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  agendaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  agendaBadgeSpecial: {
    backgroundColor: AppColors.accentLight,
  },
  agendaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  agendaBadgeTextSpecial: {
    color: AppColors.accentDark,
  },
  agendaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  agendaDesc: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  agendaLeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  agendaLeaderText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  agendaLeaderBold: {
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  agendaActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 8,
  },
  agendaActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.white,
  },
  categoriesSection: {
    marginBottom: 16,
  },
  resultsSection: {
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  resultsSub: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  cardsList: {
    gap: 14,
  },
  cotisationCard: {
    padding: 16,
    borderRadius: 20,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  ticketDetailsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  ticketDetailCol: {
    flex: 1,
    alignItems: 'center',
  },
  ticketDivider: {
    width: 1,
    height: 24,
    backgroundColor: AppColors.border,
  },
  detailLabel: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  detailValueGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.success,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  priceLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
  },
  payBtn: {
    backgroundColor: AppColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  payBtnText: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  viewReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: AppColors.primaryMuted,
    gap: 6,
  },
  viewReceiptText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
  },
  historySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 10,
  },
  historyCard: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  historyItemDate: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 1,
  },
  historyItemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.success,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  floatingBtn: {
    backgroundColor: AppColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingBtnText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
