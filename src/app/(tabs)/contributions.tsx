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
import { useFinanceStore } from '@/store/financeStore';

const CATEGORIES = [
  { id: 'TOUS', label: 'Tous' },
  { id: 'COTISATION', label: 'Cotisations' },
  { id: 'DIME', label: 'Dîmes' },
  { id: 'OFFRANDE', label: 'Offrandes' },
  { id: 'PROJET', label: 'Projets' },
  { id: 'EPARGNE', label: 'Épargne' },
];

const CALENDAR_DAYS = [
  {
    day: '07',
    name: 'Lun',
    date: '7 Sep 2026',
    title: 'Communion des Cellules de Maison',
    time: '18h30 - 20h00',
    leader: 'Responsables de Quartier',
    desc: 'Prière fraternelle et méditation dans les familles.',
    badge: 'Cellules de maison',
    donationType: 'LIBRE',
    donationTitle: 'Offrande de Cellule',
  },
  {
    day: '08',
    name: 'Mar',
    date: '8 Sep 2026',
    title: 'Intercession & Prière de Midi',
    time: '12h00 - 13h30',
    leader: 'Département Intercession',
    desc: 'Prière pour la nation, les familles et les malades.',
    badge: 'Prière de midi',
    donationType: 'OFFRANDE',
    donationTitle: 'Offrande d Intercession',
  },
  {
    day: '09',
    name: 'Mer',
    date: '9 Sep 2026',
    title: 'Culte d Enseignement & Étude Biblique',
    time: '18h30 - 20h30',
    leader: 'Pasteur Samuel',
    desc: 'Thème : Les lois de la bénédiction financière et de la semence.',
    badge: 'Étude Biblique',
    donationType: 'DIME',
    donationTitle: 'Dîme & Offrande du Mercredi',
  },
  {
    day: '10',
    name: 'Jeu',
    date: '10 Sep 2026',
    title: 'Permanence Pastorale & Écoute',
    time: '09h00 - 15h00',
    leader: 'Pasteur Samuel & Secrétariat',
    desc: 'Conseils spirituels, entretiens de mariage et délivrance.',
    badge: 'Pastoral',
    donationType: 'COTISATION',
    donationTitle: 'Soutien Pastoral',
  },
  {
    day: '11',
    name: 'Ven',
    date: '11 Sep 2026',
    title: 'Grande Veillée de Percée & Onction',
    time: '21h00 - 02h00',
    leader: 'Pasteur Samuel & Équipe Prophétique',
    desc: 'Nuit de louange intense, combat spirituel et visitation divine.',
    badge: 'Veillée de Prière',
    donationType: 'OFFRANDE',
    donationTitle: 'Offrande de la Veillée',
  },
  {
    day: '12',
    name: 'Sam',
    date: '12 Sep 2026',
    title: 'Samedi : Répétition & Rencontre des Bâtisseurs',
    time: '15h00 - 18h00',
    leader: 'Pasteur Samuel & Comité Bâtisseurs',
    desc: 'Répétition de la chorale puis réunion stratégique du comité de construction du Grand Sanctuaire.',
    badge: 'Samedi - Activités & Chœur',
    isSpecial: true,
    donationType: 'PROJET',
    donationTitle: 'Soutien Construction - Samedi',
  },
  {
    day: '13',
    name: 'Dim',
    date: '13 Sep 2026',
    title: 'Grand Culte Dominical & Sainte Cène',
    time: '07h30 (1er culte) & 10h00 (2e culte)',
    leader: 'Pasteur Samuel',
    desc: 'Célébration festive, Sainte Cène, proclamation de victoires et collecte des dîmes et offrandes.',
    badge: 'Culte Dominical',
    isSunday: true,
    donationType: 'DIME',
    donationTitle: 'Dîme du Culte Dominical',
  },
];

export default function ContributionsScreen() {
  const transactions = useFinanceStore((s) => s.transactions);
  const cotisationsStatutaires = useFinanceStore((s) => s.cotisations);

  const [activeCategory, setActiveCategory] = useState('TOUS');
  const [selectedDay, setSelectedDay] = useState('12'); // Defaults to Samedi so Saturday is in spotlight
  const [searchQuery, setSearchQuery] = useState('');

  const activeDayInfo = CALENDAR_DAYS.find((d) => d.day === selectedDay) || CALENDAR_DAYS[5];

  const filteredCotisations = useMemo(() => {
    return cotisationsStatutaires.filter((c) => {
      const matchCat = activeCategory === 'TOUS' || c.categorie === activeCategory;
      const matchSearch =
        c.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.categorie.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Deep Teal Curved Header (Screen 7) */}
      <Header
        title="Contributions & Cotisations"
        subtitle="Search & Pay Contributions"
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
              <Text style={styles.calendarSectionSub}>Choisissez un jour pour voir l activité</Text>
            </View>
            <TouchableOpacity
              style={styles.fullCalendarBtn}
              onPress={() => router.push('/calendrier')}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color={AppColors.primary} />
              <Text style={styles.fullCalendarBtnText}>Mois</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScroll}
          >
            {CALENDAR_DAYS.map((d) => {
              const isSelected = selectedDay === d.day;
              return (
                <TouchableOpacity
                  key={d.day}
                  style={[
                    styles.dayCard,
                    isSelected && styles.dayCardActive,
                    d.isSpecial && !isSelected && styles.dayCardSpecial,
                  ]}
                  onPress={() => setSelectedDay(d.day)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayName,
                      isSelected && styles.dayNameActive,
                      d.isSpecial && !isSelected && styles.dayNameSpecial,
                    ]}
                  >
                    {d.name}
                  </Text>
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextActive,
                      d.isSpecial && !isSelected && styles.dayTextSpecial,
                    ]}
                  >
                    {d.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Day Agenda Banner */}
        {activeDayInfo && (
          <View style={styles.agendaDayContainer}>
            <Card style={styles.agendaCard} variant="elevated">
              <View style={styles.agendaHeader}>
                <View
                  style={[
                    styles.agendaBadge,
                    activeDayInfo.isSpecial ? styles.agendaBadgeSpecial : null,
                  ]}
                >
                  <Ionicons
                    name={activeDayInfo.isSunday ? 'sunny' : activeDayInfo.isSpecial ? 'calendar' : 'time-outline'}
                    size={14}
                    color={activeDayInfo.isSpecial ? AppColors.accentDark : AppColors.primary}
                  />
                  <Text
                    style={[
                      styles.agendaBadgeText,
                      activeDayInfo.isSpecial ? styles.agendaBadgeTextSpecial : null,
                    ]}
                  >
                    {activeDayInfo.badge} • {activeDayInfo.date}
                  </Text>
                </View>

                <Badge
                  label={activeDayInfo.time}
                  variant={activeDayInfo.isSunday ? 'primary' : 'neutral'}
                  size="sm"
                />
              </View>

              <Text style={styles.agendaTitle}>{activeDayInfo.title}</Text>
              <Text style={styles.agendaDesc}>{activeDayInfo.desc}</Text>

              <View style={styles.agendaLeaderRow}>
                <Ionicons name="person-outline" size={14} color={AppColors.accent} />
                <Text style={styles.agendaLeaderText}>
                  Responsable : <Text style={styles.agendaLeaderBold}>{activeDayInfo.leader}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.agendaActionBtn}
                onPress={() =>
                  router.push({
                    pathname: '/contribution/nouvelle',
                    params: {
                      type: activeDayInfo.donationType as any,
                      titre: activeDayInfo.donationTitle,
                    },
                  })
                }
                activeOpacity={0.8}
              >
                <Ionicons name="wallet-outline" size={16} color={AppColors.white} />
                <Text style={styles.agendaActionBtnText}>
                  Faire l offrande de ce culte ({activeDayInfo.donationTitle}) →
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Categories Pills */}
        <View style={styles.categoriesSection}>
          <TabsSelector
            tabs={CATEGORIES}
            activeTab={activeCategory}
            onChangeTab={setActiveCategory}
            scrollable
          />
        </View>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Engagements trouvés ({filteredCotisations.length})
            </Text>
            <Text style={styles.resultsSub}>Septembre 2026</Text>
          </View>

          {/* List of Cotisation Cards (Styled like Screen 7 ticket search cards) */}
          <View style={styles.cardsList}>
            {filteredCotisations.map((item) => {
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
            })}
          </View>
        </View>

        {/* Section: Historique récent des paiements de cotisations */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Derniers paiements validés</Text>
          {transactions.slice(0, 2).map((tx) => (
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
        </View>
      </ScrollView>

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
