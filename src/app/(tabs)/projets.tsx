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
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { TabsSelector } from '@/components/common/TabsSelector';
import { SearchBar } from '@/components/common/SearchBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { usePagedList } from '@/hooks/usePagedList';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { canManageCampaigns, canManagePeople } from '@/constants/roles';
import { CaisseDesk } from '@/components/finance/CaisseDesk';
import { ListSkeleton } from '@/components/motion/Skeleton';
import { useScreenReady } from '@/hooks/useScreenReady';

export default function ProjetsScreen() {
  const projets = useFinanceStore((s) => s.projets);
  const evenements = useFinanceStore((s) => s.evenements);
  const caissesProjet = useFinanceStore((s) => s.caissesProjet);
  const user = useAuthStore((s) => s.user);
  const staff = canManageCampaigns(user?.role);
  const isAdmin = canManagePeople(user?.role);

  const [activeTab, setActiveTab] = useState<'PROJETS' | 'EVENEMENTS' | 'CAISSES'>('PROJETS');
  const [searchQuery, setSearchQuery] = useState('');
  const ready = useScreenReady(580);

  const filteredProjets = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return projets.filter((p) => {
      const searchOk =
        p.titre.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categorie.toLowerCase().includes(q);
      return searchOk;
    });
  }, [projets, searchQuery]);

  const filteredEvenements = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return evenements.filter(
      (e) =>
        e.titre.toLowerCase().includes(q) ||
        e.lieu.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [evenements, searchQuery]);

  const visibleCaisses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return caissesProjet.filter((c) => {
      if (!staff && !c.visibleAuxMembres) return false;
      const searchOk =
        !q ||
        c.nom.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      return searchOk;
    });
  }, [caissesProjet, staff, searchQuery]);

  const projetsPage = usePagedList(filteredProjets, 6, searchQuery);
  const caissesPage = usePagedList(visibleCaisses, 6, searchQuery);
  const eventsPage = usePagedList(filteredEvenements, 6, searchQuery);

  const goCreate = () => {
    if (activeTab === 'CAISSES') router.push('/caisse/nouvelle');
    else if (activeTab === 'EVENEMENTS') router.push('/evenement/nouveau');
    else router.push('/projet/nouveau');
  };

  return (
    <View style={styles.container}>
      {/* Header (Screen 14 style) */}
      <Header
        title={isAdmin ? 'Gestion' : 'Projets'}
        showBack
        onBack={() => router.replace('/(tabs)')}
        variant="curved"
        rightAction={
          staff ? (
            <TouchableOpacity
              style={styles.headerCreateBtn}
              onPress={goCreate}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={22} color={AppColors.white} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {!ready ? (
        <ListSkeleton count={4} />
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un projet, une caisse, un événement…"
          />
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

        {staff ? (
          <View style={styles.staffBanner}>
            <Text style={styles.staffBannerText}>
              {activeTab === 'CAISSES'
                ? 'La caisse principale reste en place. Les autres se transfèrent, se suppriment, ou reçoivent un versement.'
                : activeTab === 'EVENEMENTS'
                  ? 'Publiez un séminaire, une retraite ou une conférence.'
                  : 'Créez un projet : une caisse de collecte est ouverte automatiquement.'}
            </Text>
            <TouchableOpacity style={styles.staffBannerBtn} onPress={goCreate} activeOpacity={0.85}>
              <Ionicons name="add-circle" size={18} color={AppColors.white} />
              <Text style={styles.staffBannerBtnText}>
                {activeTab === 'CAISSES'
                  ? 'Nouvelle caisse'
                  : activeTab === 'EVENEMENTS'
                    ? 'Nouvel événement'
                    : 'Nouveau projet'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeTab === 'CAISSES' && (
          <View style={styles.listContainer}>
            {staff ? (
              <CaisseDesk allowContribute />
            ) : visibleCaisses.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyHint}>Aucune caisse.</Text>
              </View>
            ) : (
              caissesPage.pageItems.map((caisse, i) => {
                const percent = caisse.objectif
                  ? Math.min(Math.round((caisse.montantCollecte / caisse.objectif) * 100), 100)
                  : 0;
                return (
                  <Card key={caisse.id} style={styles.itemCard} variant="elevated" enterIndex={i}>
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
                      </Text>
                    </View>
                    {caisse.statut !== 'TERMINEE' && (
                      <TouchableOpacity
                        style={styles.contributeBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/contribution/nouvelle',
                            params: {
                              type: 'PROJET',
                              titre: caisse.nom,
                              ...(caisse.projetId ? { projetId: caisse.projetId } : {}),
                              caisseProjetId: caisse.id,
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
              })
            )}
            {!staff ? (
              <PaginationBar
                page={caissesPage.page}
                totalPages={caissesPage.totalPages}
                total={caissesPage.total}
                from={caissesPage.from}
                to={caissesPage.to}
                onPageChange={caissesPage.setPage}
                label="caisses"
              />
            ) : null}
          </View>
        )}

        {/* PROJETS LIST */}
        {activeTab === 'PROJETS' && (
          <View style={styles.listContainer}>
            {filteredProjets.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyHint}>Aucun projet.</Text>
                {staff ? (
                  <TouchableOpacity onPress={() => router.push('/projet/nouveau')}>
                    <Text style={styles.emptyLink}>Créer un projet</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
            projetsPage.pageItems.map((proj, i) => {
              const progressPct = Math.min(
                Math.round((proj.montantCollecte / proj.objectif) * 100),
                100
              );
              const caisseLiee = caissesProjet.find(
                (caisse) =>
                  caisse.projetId === proj.id &&
                  caisse.statut !== 'TERMINEE' &&
                  (staff || caisse.visibleAuxMembres)
              );

              return (
                <Card
                  key={proj.id}
                  style={styles.itemCard}
                  variant="elevated"
                  enterIndex={i}
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
                  {caisseLiee ? (
                    <TouchableOpacity
                      style={styles.contributeBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/contribution/nouvelle',
                          params: {
                            type: 'PROJET',
                            titre: caisseLiee.nom,
                            projetId: proj.id,
                            caisseProjetId: caisseLiee.id,
                          },
                        })
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.contributeBtnText}>Contribuer à la caisse</Text>
                    </TouchableOpacity>
                  ) : null}

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
            })
            )}
            <PaginationBar
              page={projetsPage.page}
              totalPages={projetsPage.totalPages}
              total={projetsPage.total}
              from={projetsPage.from}
              to={projetsPage.to}
              onPageChange={projetsPage.setPage}
              label="projets"
            />
          </View>
        )}

        {/* EVENEMENTS LIST */}
        {activeTab === 'EVENEMENTS' && (
          <View style={styles.listContainer}>
            {filteredEvenements.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyHint}>Aucun événement.</Text>
                {staff ? (
                  <TouchableOpacity onPress={() => router.push('/evenement/nouveau')}>
                    <Text style={styles.emptyLink}>Créer un événement</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
            eventsPage.pageItems.map((ev, i) => (
              <Card
                key={ev.id}
                style={styles.itemCard}
                variant="elevated"
                enterIndex={i}
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
            ))
            )}
            <PaginationBar
              page={eventsPage.page}
              totalPages={eventsPage.totalPages}
              total={eventsPage.total}
              from={eventsPage.from}
              to={eventsPage.to}
              onPageChange={eventsPage.setPage}
              label="événements"
            />
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  filterRow: {
    paddingHorizontal: 20,
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
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: AppColors.primary,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  contributeBtnText: {
    color: AppColors.white,
    fontSize: 12,
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
  emptyHint: {
    fontSize: 13,
    color: AppColors.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  emptyLink: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
  },
  headerCreateBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    gap: 10,
  },
  staffBannerText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  staffBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 11,
  },
  staffBannerBtnText: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  closeStaffBtn: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  closeStaffBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
});
