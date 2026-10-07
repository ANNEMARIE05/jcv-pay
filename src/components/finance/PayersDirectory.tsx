import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { SearchBar } from '@/components/common/SearchBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { usePagedList } from '@/hooks/usePagedList';
import { PayerSummary, useFinanceStore } from '@/store/financeStore';
import { StatutPaiement, Transaction } from '@/types';
import { ROLE_LABELS } from '@/constants/roles';
import { formatMoyenPaiementLabel } from '@/constants/versement';
import { MemberDetailModal } from '@/components/finance/MemberDetailModal';

export type PayersDirectoryVariant = 'members' | 'history';

const STATUS_LABEL: Record<StatutPaiement, string> = {
  VALIDE: 'Validé',
  EN_ATTENTE: 'Attente',
  REJETE: 'Rejeté',
  ANNULE: 'Échec',
  ECHEC: 'Échec',
};

function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
}

function statusBadgeLabel(statut: StatutPaiement) {
  if (statut === 'EN_ATTENTE') return 'En cours';
  return STATUS_LABEL[statut];
}

type PayersDirectoryProps = {
  variant: PayersDirectoryVariant;
  canEditRole?: boolean;
};

export function PayersDirectory({ variant, canEditRole = false }: PayersDirectoryProps) {
  const transactions = useFinanceStore((s) => s.transactions);
  const utilisateurs = useFinanceStore((s) => s.utilisateurs);
  const dernierAjoutId = useFinanceStore((s) => s.dernierAjoutId);
  const getPayersSummary = useFinanceStore((s) => s.getPayersSummary);
  const payers = useMemo(
    () => getPayersSummary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- réabonnement aux données du store
    [getPayersSummary, transactions, utilisateurs, dernierAjoutId]
  );

  const [query, setQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<PayerSummary | null>(null);

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
      if (t.statut === 'EN_ATTENTE') return false;
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

  const peoplePage = usePagedList(filteredPeople, 8, `${query}:${dernierAjoutId ?? ''}:${utilisateurs.length}`);
  const txPage = usePagedList(filteredTx, 8, query);

  if (variant === 'history') {
    return (
      <View>
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChange={setQuery} placeholder="Nom, titre, référence…" />
        </View>
        <Text style={styles.statLine}>{filteredTx.length} opération(s) enregistrée(s)</Text>
        {txPage.pageItems.length === 0 ? (
          <Text style={styles.empty}>Aucune transaction pour le moment.</Text>
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
          label="transactions"
        />
      </View>
    );
  }

  return (
    <View>
      <Card style={styles.membersStatCard} variant="elevated">
        <View style={styles.membersStatRow}>
          <View style={styles.membersStatIcon}>
            <Ionicons name="people" size={24} color={AppColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.membersStatLabel}>Total membres</Text>
            <Text style={styles.membersStatValue}>{payers.length.toLocaleString('fr-FR')}</Text>
            <Text style={styles.membersStatHint}>
              {query.trim()
                ? `${filteredPeople.length} résultat${filteredPeople.length > 1 ? 's' : ''} pour la recherche`
                : 'Annuaire de l’assemblée'}
            </Text>
          </View>
        </View>
      </Card>
      <View style={styles.searchWrap}>
        <SearchBar value={query} onChange={setQuery} placeholder="Nom, téléphone, matricule…" />
      </View>
      {peoplePage.pageItems.length === 0 ? (
        <Text style={styles.empty}>Aucun membre ne correspond à la recherche.</Text>
      ) : (
        peoplePage.pageItems.map((p) => (
          <MemberCard
            key={p.key}
            payer={p}
            onPress={() => setSelectedMember(p)}
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
        label="membres"
      />
      <MemberDetailModal
        member={selectedMember}
        canEditRole={canEditRole}
        onClose={() => setSelectedMember(null)}
      />
    </View>
  );
}

function MemberCard({ payer, onPress }: { payer: PayerSummary; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
      <Card style={styles.payerCard} variant="elevated">
        <View style={styles.payerHeader}>
          <View style={styles.payerAvatar}>
            <Ionicons name="person" size={18} color={AppColors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.payerName}>{payer.nom}</Text>
            <Text style={styles.payerMeta}>
              {payer.telephone}
              {payer.matricule ? ` • ${payer.matricule}` : ''}
            </Text>
            {payer.creeLe ? (
              <Text style={styles.payerLast}>
                Créé le {payer.creeLe}
                {payer.creeA ? ` à ${payer.creeA}` : ''}
              </Text>
            ) : payer.dateAdhesion ? (
              <Text style={styles.payerLast}>Adhésion : {payer.dateAdhesion}</Text>
            ) : null}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            {payer.role ? (
              <Badge
                label={ROLE_LABELS[payer.role]}
                variant={payer.role === 'MEMBRE' ? 'neutral' : 'accent'}
                size="sm"
              />
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
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
          {tx.date} • {tx.heure} • {tx.type} • {formatMoyenPaiementLabel(tx.moyenPaiement)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.payerTxAmount}>{tx.montant.toLocaleString('fr-FR')} F</Text>
        <Badge
          label={statusBadgeLabel(tx.statut)}
          variant={tx.statut === 'VALIDE' ? 'success' : 'danger'}
          size="sm"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  membersStatCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  membersStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  membersStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membersStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  membersStatValue: {
    fontSize: 28,
    fontWeight: '900',
    color: AppColors.primary,
    marginTop: 2,
  },
  membersStatHint: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 4,
  },
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
