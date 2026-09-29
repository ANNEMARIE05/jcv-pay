import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { SearchBar } from '@/components/common/SearchBar';
import { FilterChips } from '@/components/common/FilterChips';
import { PaginationBar } from '@/components/common/PaginationBar';
import { TabsSelector } from '@/components/common/TabsSelector';
import { usePagedList } from '@/hooks/usePagedList';
import { PayerSummary, useFinanceStore } from '@/store/financeStore';
import { MoyenPaiement, StatutPaiement, Transaction, TypeContribution } from '@/types';
import { ROLE_LABELS } from '@/constants/roles';

type ViewMode = 'PERSONNES' | 'VERSEMENTS';
type PeopleFilter = 'TOUS' | 'PAYE' | 'ATTENTE' | 'NON_PAYE' | 'REJETE';
type TypeFilter = 'TOUS' | TypeContribution;
type StatusFilter = 'TOUS' | StatutPaiement;
type MoyenFilter = 'TOUS' | MoyenPaiement;

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'TOUS', label: 'Tous types' },
  { id: 'DIME', label: 'Dîme' },
  { id: 'OFFRANDE', label: 'Offrande' },
  { id: 'COTISATION', label: 'Cotisation' },
  { id: 'PROJET', label: 'Projet' },
  { id: 'EVENEMENT', label: 'Événement' },
  { id: 'EPARGNE', label: 'Épargne' },
  { id: 'LIBRE', label: 'Don libre' },
];

const MOYEN_OPTIONS: { id: MoyenFilter; label: string }[] = [
  { id: 'TOUS', label: 'Tous moyens' },
  { id: 'WAVE', label: 'Wave' },
  { id: 'ORANGE_MONEY', label: 'Orange Money' },
  { id: 'ESPECES', label: 'Espèces' },
  { id: 'VIREMENT', label: 'Virement' },
  { id: 'CARTE_BANCAIRE', label: 'Carte' },
];

const STATUS_LABEL: Record<StatutPaiement, string> = {
  VALIDE: 'Validé',
  EN_ATTENTE: 'Attente',
  REJETE: 'Rejeté',
  ANNULE: 'Annulé',
};

function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
}

export function PayersDirectory() {
  const transactions = useFinanceStore((s) => s.transactions);
  const utilisateurs = useFinanceStore((s) => s.utilisateurs);
  const getPayersSummary = useFinanceStore((s) => s.getPayersSummary);
  const payers = useMemo(
    () => getPayersSummary(),
    [getPayersSummary, transactions, utilisateurs]
  );

  const [mode, setMode] = useState<ViewMode>('PERSONNES');
  const [query, setQuery] = useState('');
  const [peopleFilter, setPeopleFilter] = useState<PeopleFilter>('TOUS');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('TOUS');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TOUS');
  const [moyenFilter, setMoyenFilter] = useState<MoyenFilter>('TOUS');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredPeople = useMemo(() => {
    return payers.filter((p) => {
      const q = query.trim();
      const searchOk =
        !q ||
        matchesQuery(p.nom, q) ||
        matchesQuery(p.telephone, q) ||
        matchesQuery(p.email || '', q) ||
        matchesQuery(p.matricule || '', q);
      if (!searchOk) return false;

      if (peopleFilter === 'PAYE' && !p.aPaye) return false;
      if (peopleFilter === 'NON_PAYE' && p.nbPaiements > 0) return false;
      if (peopleFilter === 'ATTENTE' && p.nbAttente === 0) return false;
      if (peopleFilter === 'REJETE' && p.nbRejetes === 0) return false;

      if (typeFilter !== 'TOUS' && !p.transactions.some((t) => t.type === typeFilter)) return false;
      if (moyenFilter !== 'TOUS' && !p.transactions.some((t) => t.moyenPaiement === moyenFilter)) {
        return false;
      }
      return true;
    });
  }, [payers, query, peopleFilter, typeFilter, moyenFilter]);

  const filteredTx = useMemo(() => {
    return transactions.filter((t) => {
      const q = query.trim();
      const searchOk =
        !q ||
        matchesQuery(t.donateurNom, q) ||
        matchesQuery(t.donateurTelephone, q) ||
        matchesQuery(t.titre, q) ||
        matchesQuery(t.reference, q);
      if (!searchOk) return false;
      if (statusFilter !== 'TOUS' && t.statut !== statusFilter) return false;
      if (typeFilter !== 'TOUS' && t.type !== typeFilter) return false;
      if (moyenFilter !== 'TOUS' && t.moyenPaiement !== moyenFilter) return false;
      return true;
    });
  }, [transactions, query, statusFilter, typeFilter, moyenFilter]);

  const peoplePage = usePagedList(
    filteredPeople,
    8,
    `${query}|${peopleFilter}|${typeFilter}|${moyenFilter}`
  );
  const txPage = usePagedList(
    filteredTx,
    8,
    `${query}|${statusFilter}|${typeFilter}|${moyenFilter}`
  );

  const paidCount = payers.filter((p) => p.aPaye).length;
  const waitingCount = payers.filter((p) => p.nbAttente > 0).length;
  const unpaidCount = payers.filter((p) => p.nbPaiements === 0).length;

  return (
    <View>
      <View style={styles.modeWrap}>
        <TabsSelector
          tabs={[
            { id: 'PERSONNES', label: 'Personnes', count: payers.length },
            { id: 'VERSEMENTS', label: 'Versements', count: transactions.length },
          ]}
          activeTab={mode}
          onChangeTab={setMode}
          variant="segmented"
        />
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={
            mode === 'PERSONNES'
              ? 'Nom, téléphone, email, matricule…'
              : 'Donateur, titre, référence…'
          }
        />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>{payers.length} inscrits</Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.stat}>{paidCount} ont payé</Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.stat}>{unpaidCount} sans versement</Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.stat}>{waitingCount} en attente</Text>
      </View>

      {mode === 'PERSONNES' ? (
        <View style={styles.filters}>
          <FilterChips
            value={peopleFilter}
            onChange={setPeopleFilter}
            options={[
              { id: 'TOUS', label: 'Tous', count: payers.length },
              { id: 'PAYE', label: 'Ont payé', count: paidCount },
              { id: 'NON_PAYE', label: 'Pas encore', count: unpaidCount },
              { id: 'ATTENTE', label: 'En attente', count: waitingCount },
              { id: 'REJETE', label: 'Rejetés' },
            ]}
          />
          <FilterChips value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
          <FilterChips value={moyenFilter} onChange={setMoyenFilter} options={MOYEN_OPTIONS} />
        </View>
      ) : (
        <View style={styles.filters}>
          <FilterChips
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: 'TOUS', label: 'Tous statuts', count: transactions.length },
              { id: 'VALIDE', label: 'Validés' },
              { id: 'EN_ATTENTE', label: 'En attente' },
              { id: 'REJETE', label: 'Rejetés' },
              { id: 'ANNULE', label: 'Annulés' },
            ]}
          />
          <FilterChips value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
          <FilterChips value={moyenFilter} onChange={setMoyenFilter} options={MOYEN_OPTIONS} />
        </View>
      )}

      {mode === 'PERSONNES' ? (
        <>
          {peoplePage.pageItems.length === 0 ? (
            <Text style={styles.empty}>Aucune personne ne correspond à la recherche.</Text>
          ) : (
            peoplePage.pageItems.map((p) => (
              <PayerCard
                key={p.key}
                payer={p}
                expanded={expanded === p.key}
                onToggle={() => setExpanded(expanded === p.key ? null : p.key)}
              />
            ))
          )}
          <PaginationBar
            page={peoplePage.page}
            totalPages={peoplePage.totalPages}
            total={peoplePage.total}
            from={peoplePage.from}
            to={peoplePage.to}
            onPageChange={peoplePage.setPage}
            label="personnes"
          />
        </>
      ) : (
        <>
          {txPage.pageItems.length === 0 ? (
            <Text style={styles.empty}>Aucun versement ne correspond aux filtres.</Text>
          ) : (
            txPage.pageItems.map((tx) => <TxCard key={tx.id} tx={tx} />)
          )}
          <PaginationBar
            page={txPage.page}
            totalPages={txPage.totalPages}
            total={txPage.total}
            from={txPage.from}
            to={txPage.to}
            onPageChange={txPage.setPage}
            label="versements"
          />
        </>
      )}
    </View>
  );
}

function PayerCard({
  payer,
  expanded,
  onToggle,
}: {
  payer: PayerSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status =
    payer.aPaye
      ? 'A payé'
      : payer.nbAttente > 0
        ? 'En attente'
        : payer.nbPaiements > 0
          ? 'À revoir'
          : 'Pas encore';
  const variant =
    payer.aPaye ? 'success' : payer.nbAttente > 0 ? 'warning' : payer.nbPaiements > 0 ? 'neutral' : 'neutral';

  return (
    <Card style={styles.payerCard} variant="elevated">
      <TouchableOpacity style={styles.payerHeader} onPress={onToggle} activeOpacity={0.85}>
        <View style={styles.payerAvatar}>
          <Ionicons name="person" size={18} color={AppColors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.payerName}>{payer.nom}</Text>
          <Text style={styles.payerMeta}>
            {payer.telephone}
            {payer.matricule ? ` • ${payer.matricule}` : ''}
          </Text>
          <Text style={styles.payerLast}>
            {payer.role ? `${ROLE_LABELS[payer.role]} • ` : ''}
            {payer.dernierPaiement}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={styles.payerTotal}>{payer.totalPaye.toLocaleString('fr-FR')} F</Text>
          <Badge label={status} variant={variant} size="sm" />
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.payerHistory}>
          {payer.transactions.length === 0 ? (
            <Text style={styles.emptySmall}>Aucun versement enregistré pour cette personne.</Text>
          ) : (
            payer.transactions.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))
          )}
        </View>
      ) : null}
    </Card>
  );
}

function TxCard({ tx }: { tx: Transaction }) {
  return (
    <Card style={styles.payerCard} variant="elevated">
      <TxRow tx={tx} showDonor />
    </Card>
  );
}

function TxRow({ tx, showDonor = false }: { tx: Transaction; showDonor?: boolean }) {
  return (
    <TouchableOpacity
      style={styles.payerTxRow}
      onPress={() => router.push(`/recu/${tx.id}`)}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        {showDonor ? <Text style={styles.payerName}>{tx.donateurNom}</Text> : null}
        <Text style={styles.payerTxTitle}>{tx.titre}</Text>
        <Text style={styles.payerTxDate}>
          {tx.date} • {tx.heure} • {tx.type} • {tx.moyenPaiement.replace('_', ' ')}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.payerTxAmount}>{tx.montant.toLocaleString('fr-FR')} F</Text>
        <Badge
          label={STATUS_LABEL[tx.statut]}
          variant={
            tx.statut === 'VALIDE' ? 'success' : tx.statut === 'EN_ATTENTE' ? 'warning' : 'neutral'
          }
          size="sm"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modeWrap: { marginBottom: 12 },
  searchWrap: { marginBottom: 10 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  stat: { fontSize: 12, fontWeight: '700', color: AppColors.textSecondary },
  statDot: { color: AppColors.textMuted },
  filters: { gap: 8, marginBottom: 12 },
  empty: {
    textAlign: 'center',
    color: AppColors.textMuted,
    fontSize: 13,
    paddingVertical: 24,
  },
  emptySmall: {
    fontSize: 12,
    color: AppColors.textMuted,
    paddingVertical: 8,
  },
  payerCard: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  payerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payerName: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  payerMeta: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  payerLast: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  payerTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.primary,
  },
  payerHistory: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
    paddingTop: 8,
    gap: 6,
  },
  payerTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  payerTxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  payerTxDate: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  payerTxAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 4,
  },
});
