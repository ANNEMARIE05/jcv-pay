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
import { useFinanceStore } from '@/store/financeStore';

interface ChurchEventDay {
  dateKey: string;
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

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_INDEX: Record<string, number> = {
  janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11, décembre: 11,
};

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function parseToDateKey(raw: string): string | null {
  const iso = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const fr = raw.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i);
  if (fr) {
    const month = MONTH_INDEX[fr[2].toLowerCase()];
    if (month === undefined) return null;
    return toDateKey(new Date(Number(fr[3]), month, Number(fr[1])));
  }
  return null;
}

function inferCategory(date: Date, title: string): ChurchEventDay['category'] {
  const t = title.toLowerCase();
  if (t.includes('veill')) return 'VEILLEE';
  if (t.includes('sémin') || t.includes('semin') || t.includes('conférence') || t.includes('conference')) {
    return 'SEMINAIRE';
  }
  if (t.includes('étude') || t.includes('etude') || t.includes('enseignement')) return 'ENSEIGNEMENT';
  if (t.includes('cellule')) return 'CELLULE';
  if (date.getDay() === 6) return 'SAMEDI';
  if (date.getDay() === 0) return 'CULTE';
  return 'SEMINAIRE';
}

export default function CalendrierScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const evenements = useFinanceStore((s) => s.evenements);
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const [visibleYear, setVisibleYear] = useState(today.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [categoryFilter, setCategoryFilter] = useState<string>('TOUS');

  const goToMonth = (year: number, month: number) => {
    const d = new Date(year, month, 1);
    setVisibleYear(d.getFullYear());
    setVisibleMonth(d.getMonth());
  };

  const goPrevMonth = () => goToMonth(visibleYear, visibleMonth - 1);
  const goNextMonth = () => goToMonth(visibleYear, visibleMonth + 1);

  const goToday = () => {
    setVisibleYear(today.getFullYear());
    setVisibleMonth(today.getMonth());
    setSelectedDateKey(todayKey);
  };

  const churchEvents = useMemo<ChurchEventDay[]>(() => {
    return evenements.flatMap((ev) => {
      const dateKey = parseToDateKey(ev.date);
      if (!dateKey) return [];
      const [y, m, d] = dateKey.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return [{
        dateKey,
        dayNum: d,
        dayName: DAYS_FR[date.getDay()],
        monthName: MONTHS_FR[date.getMonth()],
        year: date.getFullYear(),
        title: ev.titre,
        category: inferCategory(date, ev.titre),
        time: ev.heure,
        location: ev.lieu,
        leader: ev.intervenant || 'Pasteur',
        description: ev.description,
        isSpecial: inferCategory(date, ev.titre) === 'SEMINAIRE',
        isSunday: date.getDay() === 0,
        donationType: 'EVENEMENT' as TypeContribution,
        donationTitle: ev.titre,
      }];
    });
  }, [evenements]);

  const calendarCells = useMemo(() => {
    const first = startOfMonth(visibleYear, visibleMonth);
    const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
    const mondayOffset = (first.getDay() + 6) % 7;
    const cells: Array<{
      dayNum: number;
      dateKey: string;
      event?: ChurchEventDay;
      isSaturday: boolean;
      isSunday: boolean;
      isOutside: boolean;
      isToday: boolean;
    }> = [];

    const prevMonthLast = new Date(visibleYear, visibleMonth, 0).getDate();
    for (let i = mondayOffset; i > 0; i -= 1) {
      const day = prevMonthLast - i + 1;
      const date = new Date(visibleYear, visibleMonth - 1, day);
      const dateKey = toDateKey(date);
      cells.push({
        dayNum: day,
        dateKey,
        event: churchEvents.find((e) => e.dateKey === dateKey),
        isSaturday: date.getDay() === 6,
        isSunday: date.getDay() === 0,
        isOutside: true,
        isToday: dateKey === todayKey,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(visibleYear, visibleMonth, day);
      const dateKey = toDateKey(date);
      cells.push({
        dayNum: day,
        dateKey,
        event: churchEvents.find((e) => e.dateKey === dateKey),
        isSaturday: date.getDay() === 6,
        isSunday: date.getDay() === 0,
        isOutside: false,
        isToday: dateKey === todayKey,
      });
    }

    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let day = 1; day <= 7 - remainder; day += 1) {
        const date = new Date(visibleYear, visibleMonth + 1, day);
        const dateKey = toDateKey(date);
        cells.push({
          dayNum: day,
          dateKey,
          event: churchEvents.find((e) => e.dateKey === dateKey),
          isSaturday: date.getDay() === 6,
          isSunday: date.getDay() === 0,
          isOutside: true,
          isToday: dateKey === todayKey,
        });
      }
    }

    return cells;
  }, [visibleYear, visibleMonth, churchEvents, todayKey]);

  const selectedEvent = useMemo(() => {
    return churchEvents.find((e) => e.dateKey === selectedDateKey);
  }, [churchEvents, selectedDateKey]);

  const monthPrefix = `${visibleYear}-${String(visibleMonth + 1).padStart(2, '0')}`;

  const filteredUpcomingEvents = useMemo(() => {
    return churchEvents.filter((e) => {
      const inMonth = e.dateKey.startsWith(monthPrefix);
      const matchCat = categoryFilter === 'TOUS' || e.category === categoryFilter;
      return inMonth && matchCat;
    });
  }, [churchEvents, categoryFilter, monthPrefix]);

  const selectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    const [y, m] = dateKey.split('-').map(Number);
    if (y !== visibleYear || m - 1 !== visibleMonth) {
      goToMonth(y, m - 1);
    }
  };

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
        title="Calendrier"
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
          <View style={styles.monthNavRow}>
            <TouchableOpacity
              style={styles.monthNavBtn}
              onPress={goPrevMonth}
              activeOpacity={0.8}
              accessibilityLabel="Mois précédent"
            >
              <Ionicons name="chevron-back" size={22} color={AppColors.primary} />
            </TouchableOpacity>

            <View style={styles.monthTitleBox}>
              <Text style={styles.monthTitleText}>
                {MONTHS_FR[visibleMonth]} {visibleYear}
              </Text>
              <TouchableOpacity onPress={goToday} activeOpacity={0.8}>
                <Text style={styles.monthSubtitle}>
                  {selectedDateKey === todayKey
                    ? 'Aujourd hui'
                    : 'Revenir à aujourd hui'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.monthNavBtn}
              onPress={goNextMonth}
              activeOpacity={0.8}
              accessibilityLabel="Mois suivant"
            >
              <Ionicons name="chevron-forward" size={22} color={AppColors.primary} />
            </TouchableOpacity>
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
              {calendarCells.map((cell) => {
                const isSelected = selectedDateKey === cell.dateKey;
                const hasEvent = !!cell.event;
                const isSaturday = cell.isSaturday;
                const isSunday = cell.isSunday;

                return (
                  <TouchableOpacity
                    key={cell.dateKey}
                    style={[
                      styles.dayCell,
                      isSaturday && styles.dayCellSaturday,
                      isSunday && styles.dayCellSunday,
                      cell.isOutside && styles.dayCellOutside,
                      cell.isToday && !isSelected && styles.dayCellToday,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => selectDate(cell.dateKey)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayNumText,
                        isSaturday && styles.saturdayNumText,
                        isSunday && styles.sundayNumText,
                        cell.isOutside && !isSelected && styles.dayNumTextOutside,
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
              <Text style={styles.noEventTitle}>Aucun rassemblement</Text>
              <Text style={styles.noEventSub}>
                Rien n est programmé le {selectedDateKey.split('-').reverse().join('/')}.
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
            <Text style={styles.agendaSectionTitle}>Agenda</Text>
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

          <View style={styles.agendaList}>
            {filteredUpcomingEvents.length === 0 ? (
              <Card style={styles.noEventCard}>
                <Text style={styles.noEventTitle}>Rien ce mois-ci</Text>
                <Text style={styles.noEventSub}>
                  Passez au mois suivant ou précédent avec les flèches en haut.
                </Text>
              </Card>
            ) : null}
            {filteredUpcomingEvents.map((item) => {
              const isSelected = selectedDateKey === item.dateKey;
              return (
                <TouchableOpacity
                  key={`${item.dateKey}-${item.title}`}
                  style={[styles.agendaItemCard, isSelected && styles.agendaItemCardActive]}
                  onPress={() => selectDate(item.dateKey)}
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
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  monthTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  monthSubtitle: {
    fontSize: 12,
    color: AppColors.primary,
    marginTop: 2,
    fontWeight: '600',
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
  dayCellOutside: {
    backgroundColor: '#F8FAFC',
    borderColor: 'transparent',
    opacity: 0.55,
  },
  dayCellToday: {
    borderColor: AppColors.primary,
    borderWidth: 1.5,
  },
  dayCellSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    ...Shadows.small,
  },
  dayNumTextOutside: {
    color: AppColors.textMuted,
    fontWeight: '500',
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
