import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { SearchBar } from '@/components/common/SearchBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { TabsSelector } from '@/components/common/TabsSelector';
import { usePagedList } from '@/hooks/usePagedList';
import { PayerSummary, useFinanceStore } from '@/store/financeStore';
import { StatutPaiement, Transaction } from '@/types';
import { ROLE_LABELS } from '@/constants/roles';

type ViewMode = 'PERSONNES' | 'VERSEMENTS';

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
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredPeople = useMemo(() => {
    return payers.filter((p) => {
      const q = query.trim();
      return (
        !q ||
        matchesQuery(p.nom, q) ||
        matchesQuery(p.telephone, q) ||
        matchesQuery(p.email || '', q) ||
        matchesQuery(p.matricule || '', q)
      );
    });
  }, [payers, query]);

  const filteredTx = useMemo(() => {
    return transactions.filter((t) => {
      const q = query.trim();
      return (
        !q ||
        matchesQuery(t.donateurNom, q) ||
        matchesQuery(t.donateurTelephone, q) ||
        matchesQuery(t.titre, q) ||
        matchesQuery(t.reference, q)
      );
    });
  }, [transactions, query]);

  const peoplePage = usePagedList(filteredPeople, 8, query);
  const txPage = usePagedList(filteredTx, 8, query);

  return (
    <View>
      <View style={styles.modeWrap}>
        <TabsSelector
          tabs={[
            { id: 'PERSONNES', label: 'Fidèles', count: payers.length },
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
              ? 'Nom, téléphone, matricule…'
              : 'Nom, titre, référence…'
          }
        />
      </View>

      <Text style={styles.statLine}>{payers.length} fidèles dans l’assemblée</Text>

      {mode === 'PERSONNES' ? (
        <>
          {peoplePage.pageItems.length === 0 ? (
            <Text style={styles.empty}>Aucun fidèle ne correspond à la recherche.</Text>
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
            label="fidèles"
          />
        </>
      ) : (
        <>
          {txPage.pageItems.length === 0 ? (
            <Text style={styles.empty}>Aucun versement pour le moment.</Text>
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
      ? 'A versé'
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
  statLine: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textSecondary,
    marginBottom: 12,
  },
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
