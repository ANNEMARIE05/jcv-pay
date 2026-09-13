import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { TypeContribution } from '@/types';

interface ChurchEventDay {
  dateKey: string; // YYYY-MM-DD
  dayNum: number;
  dayName: string;
  monthName: string;
  year: number;
  title: string;
  category: 'CULTE' | 'SAMEDI' | 'VEILLEE' | 'ENSEIGNEMENT' | 'SEMINAIRE' | 'CELLULE';
  time: string;
  location: string;
  leader: string;
  description: string;
  isSpecial?: boolean;
  isSunday?: boolean;
  donationType: TypeContribution;
  donationTitle: string;
}

const CHURCH_CALENDAR_DATA: ChurchEventDay[] = [
  {
    dateKey: '2026-09-07',
    dayNum: 7,
    dayName: 'Lundi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Communion des Cellules de Maison',
    category: 'CELLULE',
    time: '18h30 - 20h00',
    location: 'Quartiers & Familles hôtes',
    leader: 'Responsables de Secteurs',
    description: 'Méditation biblique, prière pour les familles et partage de la Parole.',
    donationType: 'LIBRE',
    donationTitle: 'Offrande de Cellule',
  },
  {
    dateKey: '2026-09-08',
    dayNum: 8,
    dayName: 'Mardi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Prière d Intercession & Midi de Délivrance',
    category: 'VEILLEE',
    time: '12h00 - 13h30',
    location: 'Chapelle Haute',
    leader: 'Département Intercession',
    description: 'Prière pour les malades, pour la nation et les projets de l Église.',
    donationType: 'OFFRANDE',
    donationTitle: 'Offrande d Intercession',
  },
  {
    dateKey: '2026-09-09',
    dayNum: 9,
    dayName: 'Mercredi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Culte d Enseignement & Étude Biblique',
    category: 'ENSEIGNEMENT',
    time: '18h30 - 20h30',
    location: 'Grand Sanctuaire',
    leader: 'Pasteur Samuel',
    description: 'Thème approfondi : Les lois divines de la prospérité du Royaume et de la semence.',
    donationType: 'DIME',
    donationTitle: 'Dîme & Offrande du Mercredi',
  },
  {
    dateKey: '2026-09-11',
    dayNum: 11,
    dayName: 'Vendredi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Grande Veillée de Prière & Percée Prophétique',
    category: 'VEILLEE',
    time: '21h00 - 02h00',
    location: 'Grand Sanctuaire',
    leader: 'Pasteur Samuel & Équipe Pastorale',
    description: 'Nuit de louange, combat spirituel, onction d huile sainte et proclamation.',
    donationType: 'OFFRANDE',
    donationTitle: 'Offrande de la Veillée',
  },
  {
    dateKey: '2026-09-12',
    dayNum: 12,
    dayName: 'Samedi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Samedi Paroissial : Répétition & Réunion Bâtisseurs',
    category: 'SAMEDI',
    time: '15h00 - 18h00',
    location: 'Salle Polyvalente & Sanctuaire',
    leader: 'Pasteur Samuel & Comité des Bâtisseurs',
    description: '15h00 : Répétition générale chorale et louange.\n16h30 : Réunion stratégique de construction du Grand Sanctuaire.',
    isSpecial: true,
    donationType: 'PROJET',
    donationTitle: 'Soutien Chantier - Samedi',
  },
  {
    dateKey: '2026-09-13',
    dayNum: 13,
    dayName: 'Dimanche',
    monthName: 'Septembre',
    year: 2026,
    title: 'Grand Culte Dominical & Sainte Cène',
    category: 'CULTE',
    time: '07h30 (1er culte) & 10h00 (2e culte)',
    location: 'Grand Sanctuaire',
    leader: 'Pasteur Samuel',
    description: 'Célébration solennelle, Sainte Cène, prédication apostolique et collecte solennelle des dîmes.',
    isSunday: true,
    donationType: 'DIME',
    donationTitle: 'Dîme du Culte Dominical',
  },
  {
    dateKey: '2026-09-16',
    dayNum: 16,
    dayName: 'Mercredi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Culte de Guérison & Miracles',
    category: 'ENSEIGNEMENT',
    time: '18h30 - 20h30',
    location: 'Grand Sanctuaire',
    leader: 'Pasteur Samuel',
    description: 'Manifestation de la puissance de la résurrection pour les affligés.',
    donationType: 'OFFRANDE',
    donationTitle: 'Offrande du Mercredi',
  },
  {
    dateKey: '2026-09-19',
    dayNum: 19,
    dayName: 'Samedi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Samedi Mission & Évangélisation Urbaine',
    category: 'SAMEDI',
    time: '14h30 - 18h00',
    location: 'Esplanade de l Église',
    leader: 'Département Évangélisation & Jeunesse',
    description: 'Sortie d impact, distribution de traités et témoignages fraternels.',
    isSpecial: true,
    donationType: 'PROJET',
    donationTitle: 'Fonds Mission & Évangélisation',
  },
  {
    dateKey: '2026-09-20',
    dayNum: 20,
    dayName: 'Dimanche',
    monthName: 'Septembre',
    year: 2026,
    title: 'Culte d Actions de Grâce & Bénédictions',
    category: 'CULTE',
    time: '08h30 - 11h30',
    location: 'Grand Sanctuaire',
    leader: 'Pasteur Samuel',
    description: 'Témoignages de victoires, actions de grâce familiales et offrande libre.',
    isSunday: true,
    donationType: 'OFFRANDE',
    donationTitle: 'Offrande d Actions de Grâce',
  },
  {
    dateKey: '2026-09-25',
    dayNum: 25,
    dayName: 'Vendredi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Ouverture : Convention Nationale des Familles 2026',
    category: 'SEMINAIRE',
    time: '09h00 - 18h00',
    location: 'Palais de la Culture, Salle Anoumabo',
    leader: 'Pasteur Samuel & Invités Internationaux',
    description: 'Conférence de 3 jours : Ateliers couples, jeunesse et foi victorieuse.',
    donationType: 'EVENEMENT',
    donationTitle: 'Convention Nationale des Familles',
  },
  {
    dateKey: '2026-09-26',
    dayNum: 26,
    dayName: 'Samedi',
    monthName: 'Septembre',
    year: 2026,
    title: 'Samedi : Jour 2 Convention Nationale des Familles',
    category: 'SEMINAIRE',
    time: '09h00 - 18h00',
    location: 'Palais de la Culture, Salle Anoumabo',
    leader: 'Pasteur Samuel',
    description: 'Deuxième journée de formation et plénières sur la bénédiction générationnelle.',
    isSpecial: true,
    donationType: 'EVENEMENT',
    donationTitle: 'Convention Familles - Samedi',
  },
  {
    dateKey: '2026-09-27',
    dayNum: 27,
    dayName: 'Dimanche',
    monthName: 'Septembre',
    year: 2026,
    title: 'Clôture : Grande Célébration de la Convention',
    category: 'CULTE',
    time: '09h00 - 13h00',
    location: 'Palais de la Culture, Salle Anoumabo',
    leader: 'Pasteur Samuel',
    description: 'Culte d apothéose réunissant toutes les annexes de l Église Jésus Christ Victoire.',
    isSunday: true,
    donationType: 'DIME',
    donationTitle: 'Dîme & Offrande de Clôture',
  },
];

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function CalendrierScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  // Selected date key (defaults to Samedi 12 Septembre 2026)
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-09-12');
  const [categoryFilter, setCategoryFilter] = useState<string>('TOUS');

  // Days in September 2026 (Sept 1, 2026 was a Tuesday -> index 1 in Lun-Dim)
  // September has 30 days
  const calendarCells = useMemo(() => {
    // September 2026 starts on Tuesday (offset = 1 empty cell on Monday)
    const emptyOffset = 1;
    const daysCount = 30;
    const cells = [];

    for (let i = 0; i < emptyOffset; i++) {
      cells.push({ dayNum: null, dateKey: null });
    }

    for (let day = 1; day <= daysCount; day++) {
      const dayFormatted = day < 10 ? `0${day}` : `${day}`;
      const dateKey = `2026-09-${dayFormatted}`;
      const event = CHURCH_CALENDAR_DATA.find((e) => e.dateKey === dateKey);
      cells.push({
        dayNum: day,
        dateKey,
        event,
        isSaturday: (day + emptyOffset - 1) % 7 === 5,
        isSunday: (day + emptyOffset - 1) % 7 === 6,
      });
    }

    return cells;
  }, []);

  const selectedEvent = useMemo(() => {
    return CHURCH_CALENDAR_DATA.find((e) => e.dateKey === selectedDateKey);
  }, [selectedDateKey]);

  const filteredUpcomingEvents = useMemo(() => {
    if (categoryFilter === 'TOUS') {
      return CHURCH_CALENDAR_DATA;
    }
    return CHURCH_CALENDAR_DATA.filter((e) => e.category === categoryFilter);
  }, [categoryFilter]);

  const handleReminder = (title: string, date: string) => {
    Alert.alert(
      'Rappel programmé',
      `Un rappel a été activé pour "${title}" le ${date}. Vous recevrez une notification 2h avant le culte.`
    );
  };

  const handleConfirmPresence = (title: string) => {
    Alert.alert(
      'Présence confirmée !',
      `Votre présence à "${title}" a été notée auprès du secrétariat du Pasteur Samuel.`
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Calendrier des Cultes & Activités"
        subtitle="Église Jésus Christ Victoire • Septembre 2026"
        showBack
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
        variant="curved"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Title Header */}
        <View style={styles.monthSelectorBar}>
          <View style={styles.monthTitleBox}>
            <View style={styles.monthIconCircle}>
              <Ionicons name="calendar" size={18} color={AppColors.accent} />
            </View>
            <View>
              <Text style={styles.monthTitleText}>Septembre 2026</Text>
              <Text style={styles.monthSubtitle}>Cultes, samedis & séminaires</Text>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: AppColors.primary }]} />
              <Text style={styles.legendText}>Culte</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: AppColors.accent }]} />
              <Text style={styles.legendText}>Samedi</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>Séminaire</Text>
            </View>
          </View>
        </View>

        {/* 7 Days of the week row */}
        <View style={styles.calendarCardWrapper}>
          <Card style={styles.calendarCard} variant="elevated">
            <View style={styles.weekDaysRow}>
              {WEEK_DAYS.map((w, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.weekDayText,
                    idx === 5 && styles.saturdayHeaderText,
                    idx === 6 && styles.sundayHeaderText,
                  ]}
                >
                  {w}
                </Text>
              ))}
            </View>

            {/* Calendar Grid Cells */}
            <View style={styles.gridContainer}>
              {calendarCells.map((cell, idx) => {
                if (!cell.dayNum) {
                  return <View key={idx} style={styles.emptyCell} />;
                }

                const isSelected = selectedDateKey === cell.dateKey;
                const hasEvent = !!cell.event;
                const isSaturday = cell.isSaturday;
                const isSunday = cell.isSunday;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      isSaturday && styles.dayCellSaturday,
                      isSunday && styles.dayCellSunday,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => cell.dateKey && setSelectedDateKey(cell.dateKey)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayNumText,
                        isSaturday && styles.saturdayNumText,
                        isSunday && styles.sundayNumText,
                        isSelected && styles.dayNumTextSelected,
                      ]}
                    >
                      {cell.dayNum}
                    </Text>

                    {/* Event badge indicator */}
                    {hasEvent && (
                      <View
                        style={[
                          styles.eventDot,
                          isSaturday
                            ? styles.eventDotOrange
                            : isSunday
                            ? styles.eventDotGreen
                            : styles.eventDotPurple,
                          isSelected && styles.eventDotSelected,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Selected Day Detailed Card */}
        {selectedEvent ? (
          <View style={styles.selectedDetailWrapper}>
            <Card style={styles.selectedEventCard} variant="elevated">
              <View style={styles.detailHeaderRow}>
                <View
                  style={[
                    styles.detailBadge,
                    selectedEvent.isSpecial ? styles.detailBadgeSpecial : null,
                  ]}
                >
                  <Ionicons
                    name={
                      selectedEvent.isSunday
                        ? 'sunny'
                        : selectedEvent.isSpecial
                        ? 'hammer-outline'
                        : 'book-outline'
                    }
                    size={15}
                    color={selectedEvent.isSpecial ? AppColors.accentDark : AppColors.primary}
                  />
                  <Text
                    style={[
                      styles.detailBadgeText,
                      selectedEvent.isSpecial ? styles.detailBadgeTextSpecial : null,
                    ]}
                  >
                    {selectedEvent.dayName} {selectedEvent.dayNum} {selectedEvent.monthName}
                  </Text>
                </View>

                <Badge
                  label={selectedEvent.time}
                  variant={selectedEvent.isSunday ? 'primary' : 'neutral'}
                  size="sm"
                />
              </View>

              <Text style={styles.selectedTitle}>{selectedEvent.title}</Text>
              <Text style={styles.selectedDesc}>{selectedEvent.description}</Text>

              <View style={styles.metaBox}>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={16} color={AppColors.primary} />
                  <Text style={styles.metaVal}>{selectedEvent.location}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={16} color={AppColors.accent} />
                  <Text style={styles.metaVal}>
                    Orateur / Direction :{' '}
                    <Text style={{ fontWeight: '700' }}>{selectedEvent.leader}</Text>
                  </Text>
                </View>
              </View>

              {/* Action Buttons for this day */}
              <View style={styles.actionButtonsCol}>
                <Button
                  title={`Faire un Don / Offrande (${selectedEvent.donationTitle})`}
                  onPress={() =>
                    router.push({
                      pathname: '/contribution/nouvelle',
                      params: {
                        type: selectedEvent.donationType,
                        titre: selectedEvent.donationTitle,
                      },
                    })
                  }
                  variant="primary"
                  size="md"
                />

                <View style={styles.subActionRow}>
                  <TouchableOpacity
                    style={styles.subBtn}
                    onPress={() =>
                      handleReminder(
                        selectedEvent.title,
                        `${selectedEvent.dayName} ${selectedEvent.dayNum}`
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons name="notifications-outline" size={16} color={AppColors.primary} />
                    <Text style={styles.subBtnText}>Rappel Culte</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subBtn}
                    onPress={() => handleConfirmPresence(selectedEvent.title)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={AppColors.success} />
                    <Text style={[styles.subBtnText, { color: AppColors.success }]}>
                      Je serai présent
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.selectedDetailWrapper}>
            <Card style={styles.noEventCard}>
              <Ionicons name="calendar-outline" size={32} color={AppColors.textMuted} />
              <Text style={styles.noEventTitle}>Journée Libre / Méditation Personnelle</Text>
              <Text style={styles.noEventSub}>
                Aucun rassemblement communautaire programmé ce jour. Vous pouvez tout de même
                soutenir les œuvres de l Église.
              </Text>
              <Button
                title="Faire un don libre"
                onPress={() => router.push('/contribution/nouvelle')}
                variant="outline"
                size="sm"
                style={{ marginTop: 10 }}
              />
            </Card>
          </View>
        )}

        {/* Chronological Agenda Section */}
        <View style={styles.agendaSection}>
          <View style={styles.agendaHeaderRow}>
            <Text style={styles.agendaSectionTitle}>Programme & Agenda du Mois</Text>
            <Text style={styles.agendaSectionCount}>{filteredUpcomingEvents.length} cultes</Text>
          </View>

          {/* Quick Category Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterStrip}>
            {[
              { id: 'TOUS', label: 'Tous' },
              { id: 'SAMEDI', label: 'Samedis' },
              { id: 'CULTE', label: 'Cultes Dominicals' },
              { id: 'ENSEIGNEMENT', label: 'Études Bibliques' },
              { id: 'VEILLEE', label: 'Veillées' },
              { id: 'SEMINAIRE', label: 'Séminaires' },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterPill,
                  categoryFilter === f.id && styles.filterPillActive,
                ]}
                onPress={() => setCategoryFilter(f.id)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    categoryFilter === f.id && styles.filterPillTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chronological List of All Events */}
          <View style={styles.agendaList}>
            {filteredUpcomingEvents.map((item, idx) => {
              const isSelected = selectedDateKey === item.dateKey;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.agendaItemCard, isSelected && styles.agendaItemCardActive]}
                  onPress={() => setSelectedDateKey(item.dateKey)}
                  activeOpacity={0.8}
                >
                  <View style={styles.agendaDateSquare}>
                    <Text style={styles.agendaDayNum}>{item.dayNum}</Text>
                    <Text style={styles.agendaDayShort}>{item.dayName.slice(0, 3)}</Text>
                  </View>

                  <View style={styles.agendaItemBody}>
                    <View style={styles.agendaItemTopRow}>
                      <Text style={styles.agendaItemCategory}>{item.category}</Text>
                      <Text style={styles.agendaItemTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.agendaItemTitle}>{item.title}</Text>
                    <Text style={styles.agendaItemLeader}>
                      Orateur : {item.leader}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
                </TouchableOpacity>
              );
            })}
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
    paddingBottom: 40,
  },
  monthSelectorBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 14,
    gap: 12,
  },
  monthTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: AppColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  monthSubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  calendarCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  calendarCard: {
    padding: 16,
    borderRadius: 22,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
    width: 38,
    textAlign: 'center',
  },
  saturdayHeaderText: {
    color: AppColors.accentDark,
  },
  sundayHeaderText: {
    color: AppColors.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: 8,
  },
  emptyCell: {
    width: 40,
    height: 44,
  },
  dayCell: {
    width: 40,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCFC',
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  dayCellSaturday: {
    borderColor: 'rgba(242, 133, 0, 0.3)',
    backgroundColor: '#FFFDF9',
  },
  dayCellSunday: {
    borderColor: 'rgba(12, 74, 72, 0.25)',
    backgroundColor: '#F7FBFA',
  },
  dayCellSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    ...Shadows.small,
  },
  dayNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  saturdayNumText: {
    color: AppColors.accentDark,
  },
  sundayNumText: {
    color: AppColors.primary,
    fontWeight: '800',
  },
  dayNumTextSelected: {
    color: AppColors.white,
    fontWeight: '800',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  eventDotGreen: {
    backgroundColor: AppColors.success,
  },
  eventDotOrange: {
    backgroundColor: AppColors.accent,
  },
  eventDotPurple: {
    backgroundColor: '#8B5CF6',
  },
  eventDotSelected: {
    backgroundColor: AppColors.white,
  },
  selectedDetailWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  selectedEventCard: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(12, 74, 72, 0.15)',
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  detailBadgeSpecial: {
    backgroundColor: AppColors.accentLight,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
  },
  detailBadgeTextSpecial: {
    color: AppColors.accentDark,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  selectedDesc: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaVal: {
    fontSize: 12,
    color: AppColors.textSecondary,
    flex: 1,
  },
  actionButtonsCol: {
    gap: 10,
  },
  subActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  subBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    gap: 6,
  },
  subBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  noEventCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 20,
  },
  noEventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 8,
  },
  noEventSub: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  agendaSection: {
    paddingHorizontal: 20,
  },
  agendaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  agendaSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  agendaSectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.primary,
  },
  filterStrip: {
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  filterPillTextActive: {
    color: AppColors.white,
    fontWeight: '700',
  },
  agendaList: {
    gap: 10,
  },
  agendaItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    ...Shadows.small,
  },
  agendaItemCardActive: {
    borderColor: AppColors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FBFDFD',
  },
  agendaDateSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  agendaDayNum: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
  },
  agendaDayShort: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.primary,
    textTransform: 'uppercase',
  },
  agendaItemBody: {
    flex: 1,
  },
  agendaItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  agendaItemCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: AppColors.accentDark,
    letterSpacing: 0.5,
  },
  agendaItemTime: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  agendaItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  agendaItemLeader: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
});
