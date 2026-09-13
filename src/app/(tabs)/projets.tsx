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
import { ProgressBar } from '@/components/common/ProgressBar';
import { TabsSelector } from '@/components/common/TabsSelector';
import { useFinanceStore } from '@/store/financeStore';

export default function ProjetsScreen() {
  const projets = useFinanceStore((s) => s.projets);
  const evenements = useFinanceStore((s) => s.evenements);
  const caissesProjet = useFinanceStore((s) => s.caissesProjet);

  const [activeTab, setActiveTab] = useState<'PROJETS' | 'EVENEMENTS' | 'CAISSES'>('PROJETS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjets = useMemo(() => {
    return projets.filter(
      (p) =>
        p.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categorie.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projets, searchQuery]);

  const filteredEvenements = useMemo(() => {
    return evenements.filter(
      (e) =>
        e.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.lieu.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [evenements, searchQuery]);

  const visibleCaisses = useMemo(() => {
    return caissesProjet.filter((c) => c.visibleAuxMembres);
  }, [caissesProjet]);

  return (
    <View style={styles.container}>
      {/* Header (Screen 14 style) */}
      <Header
        title="Projets & Événements"
        subtitle="Missions & Activités communautaires"
        showBack
        onBack={() => router.replace('/(tabs)')}
        variant="curved"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={AppColors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un projet, une conférence..."
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

        {/* Tab Selector (Segmented control) */}
        <View style={styles.tabContainer}>
          <TabsSelector
            tabs={[
              { id: 'PROJETS', label: 'Projets', count: projets.length },
              { id: 'CAISSES', label: 'Caisses', count: visibleCaisses.length },
              { id: 'EVENEMENTS', label: 'Événements', count: evenements.length },
            ]}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            variant="segmented"
          />
        </View>

        {activeTab === 'CAISSES' && (
          <View style={styles.listContainer}>
            {visibleCaisses.map((caisse) => {
              const percent = caisse.objectif
                ? Math.min(Math.round((caisse.montantCollecte / caisse.objectif) * 100), 100)
                : 0;
              return (
                <Card key={caisse.id} style={styles.itemCard} variant="elevated">
                  <View style={styles.itemTopRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>Caisse</Text>
                    </View>
                    <Badge
                      label={caisse.statut === 'OUVERTE' ? 'Ouverte' : 'Terminée'}
                      variant={caisse.statut === 'OUVERTE' ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.itemTitle}>{caisse.nom}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {caisse.description}
                  </Text>
                  <View style={styles.progressSection}>
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressCollected}>
                        {caisse.montantCollecte.toLocaleString('fr-FR')} FCFA rentrés
                      </Text>
                      <Text style={styles.progressPercent}>{percent}%</Text>
                    </View>
                    <ProgressBar progress={percent / 100} height={7} />
                    <Text style={styles.itemMeta}>
                      Objectif : {caisse.objectif.toLocaleString('fr-FR')} FCFA
                      {caisse.statut === 'TERMINEE' && caisse.dateCloture
                        ? ` • Clôturée le ${caisse.dateCloture}`
                        : ''}
                    </Text>
                  </View>
                  {caisse.statut === 'OUVERTE' && (
                    <TouchableOpacity
                      style={styles.contributeBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/contribution/nouvelle',
                          params: {
                            type: 'PROJET',
                            titre: caisse.nom,
                            projetId: caisse.projetId || '',
                          },
                        })
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.contributeBtnText}>Contribuer à cette caisse</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* PROJETS LIST */}
        {activeTab === 'PROJETS' && (
          <View style={styles.listContainer}>
            {filteredProjets.map((proj) => {
              const progressPct = Math.min(
                Math.round((proj.montantCollecte / proj.objectif) * 100),
                100
              );

              return (
                <Card
                  key={proj.id}
                  style={styles.itemCard}
                  variant="elevated"
                  onPress={() => router.push(`/projet/${proj.id}`)}
                >
                  <View style={styles.itemTopRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{proj.categorie}</Text>
                    </View>
                    <Badge
                      label={proj.statut === 'CLOTURE' ? 'Terminé' : 'En cours'}
                      variant={proj.statut === 'CLOTURE' ? 'neutral' : 'accent'}
                      size="sm"
                    />
                  </View>

                  <Text style={styles.itemTitle}>{proj.titre}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {proj.description}
                  </Text>

                  {/* Progress section */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressLabels}>
                      <Text style={styles.collectedText}>
                        {proj.montantCollecte.toLocaleString('fr-FR')} FCFA
                      </Text>
                      <Text style={styles.pctText}>{progressPct}%</Text>
                    </View>
                    <ProgressBar progress={progressPct} height={8} color={AppColors.accent} />
                    <View style={styles.goalRow}>
                      <Text style={styles.goalText}>
                        Objectif : {proj.objectif.toLocaleString('fr-FR')} FCFA
                      </Text>
                      <Text style={styles.participantsText}>
                        {proj.participantsCount} contributeurs
                      </Text>
                    </View>
                  </View>

                  {/* Personal participation badge if any */}
                  {proj.maContribution > 0 && (
                    <View style={styles.myContribRow}>
                      <Ionicons name="checkmark-circle" size={16} color={AppColors.success} />
                      <Text style={styles.myContribText}>
                        Votre contribution :{' '}
                        <Text style={styles.myContribBold}>
                          {proj.maContribution.toLocaleString('fr-FR')} FCFA
                        </Text>
                      </Text>
                    </View>
                  )}

                  {/* Action link */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.organizerText}>
                      <Ionicons name="people-outline" size={13} color={AppColors.textMuted} />{' '}
                      {proj.organisateur}
                    </Text>
                    <View style={styles.participateBtn}>
                      <Text style={styles.participateText}>Participer</Text>
                      <Ionicons name="chevron-forward" size={16} color={AppColors.primary} />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* EVENEMENTS LIST */}
        {activeTab === 'EVENEMENTS' && (
          <View style={styles.listContainer}>
            {filteredEvenements.map((ev) => (
              <Card
                key={ev.id}
                style={styles.itemCard}
                variant="elevated"
                onPress={() => router.push(`/evenement/${ev.id}`)}
              >
                <View style={styles.itemTopRow}>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar-outline" size={13} color={AppColors.primary} />
                    <Text style={styles.dateBadgeText}>{ev.date}</Text>
                  </View>
                  {ev.estInscrit ? (
                    <Badge label="Inscrit" variant="success" size="sm" />
                  ) : (
                    <Badge
                      label={ev.tarif === 0 ? 'Entrée Libre' : `${ev.tarif.toLocaleString('fr-FR')} F`}
                      variant={ev.tarif === 0 ? 'accent' : 'primary'}
                      size="sm"
                    />
                  )}
                </View>

                <Text style={styles.itemTitle}>{ev.titre}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {ev.description}
                </Text>

                <View style={styles.eventInfoBox}>
                  <View style={styles.eventInfoRow}>
                    <Ionicons name="time-outline" size={14} color={AppColors.textSecondary} />
                    <Text style={styles.eventInfoText}>{ev.heure}</Text>
                  </View>
                  <View style={styles.eventInfoRow}>
                    <Ionicons name="location-outline" size={14} color={AppColors.textSecondary} />
                    <Text style={styles.eventInfoText}>{ev.lieu}</Text>
                  </View>
                  {ev.intervenant && (
                    <View style={styles.eventInfoRow}>
                      <Ionicons name="mic-outline" size={14} color={AppColors.accent} />
                      <Text style={styles.eventInfoText}>{ev.intervenant}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.placesText}>
                    {ev.placesReservees} / {ev.placesDisponibles} places réservées
                  </Text>
                  <View style={styles.participateBtn}>
                    <Text style={styles.participateText}>
                      {ev.estInscrit ? 'Voir détails' : 'S inscrire'}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={AppColors.primary} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
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
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  itemCard: {
    padding: 16,
    borderRadius: 20,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.primary,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  collectedText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
  },
  progressSection: {
    marginBottom: 10,
  },
  progressCollected: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.accent,
  },
  itemMeta: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 6,
  },
  contributeBtn: {
    marginTop: 10,
    backgroundColor: AppColors.primary,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  contributeBtnText: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  pctText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.accent,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  goalText: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  participantsText: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  myContribRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10,
  },
  myContribText: {
    fontSize: 12,
    color: AppColors.success,
  },
  myContribBold: {
    fontWeight: '700',
  },
  eventInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventInfoText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  organizerText: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  placesText: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  participateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participateText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },
});
