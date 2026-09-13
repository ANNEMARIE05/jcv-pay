import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { TabsSelector } from '@/components/common/TabsSelector';
import { useFinanceStore } from '@/store/financeStore';
import { TypeContribution, StatutPaiement } from '@/types';

const CATEGORY_FILTERS = [
  { id: 'TOUS', label: 'Toutes les opérations' },
  { id: 'DIME', label: 'Dîmes' },
  { id: 'OFFRANDE', label: 'Offrandes' },
  { id: 'COTISATION', label: 'Cotisations' },
  { id: 'PROJET', label: 'Projets' },
  { id: 'EVENEMENT', label: 'Événements' },
  { id: 'EPARGNE', label: 'Épargne' },
];

const STATUS_FILTERS = [
  { id: 'TOUS', label: 'Tous les statuts' },
  { id: 'VALIDE', label: 'Validés' },
  { id: 'EN_ATTENTE', label: 'En attente' },
];

export default function HistoriqueScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 12
    : Math.max(insets.bottom, 16) + 8;

  const transactions = useFinanceStore((s) => s.transactions);
  const resume = useFinanceStore((s) => s.resume);

  const [activeCategory, setActiveCategory] = useState<string>('TOUS');
  const [activeStatus, setActiveStatus] = useState<string>('TOUS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchCategory =
        activeCategory === 'TOUS' || t.type === activeCategory;
      const matchStatus =
        activeStatus === 'TOUS' || t.statut === activeStatus;
      const matchQuery =
        t.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.donateurNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.recuNumero && t.recuNumero.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchStatus && matchQuery;
    });
  }, [transactions, activeCategory, activeStatus, searchQuery]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.statut === 'VALIDE')
      .reduce((sum, t) => sum + t.montant, 0);
  }, [filteredTransactions]);

  const getPaymentMethodLabel = (moyen: string) => {
    switch (moyen) {
      case 'WAVE':
        return { name: 'Wave Mobile Money', icon: 'water-outline', color: '#1DA1F2' };
      case 'ORANGE_MONEY':
        return { name: 'Orange Money', icon: 'phone-portrait-outline', color: '#FF7900' };
      case 'MTN_MOMO':
        return { name: 'MTN Mobile Money', icon: 'flash-outline', color: '#FFCC00' };
      case 'MOOV_MONEY':
        return { name: 'Moov Money', icon: 'cellular-outline', color: '#006699' };
      case 'CARTE_BANCAIRE':
        return { name: 'Carte Bancaire', icon: 'card-outline', color: '#4A5568' };
      case 'ESPECES':
        return { name: 'Espèces au Guichet', icon: 'cash-outline', color: '#10B981' };
      case 'VIREMENT':
        return { name: 'Virement Bancaire', icon: 'business-outline', color: AppColors.primary };
      default:
        return { name: moyen, icon: 'wallet-outline', color: AppColors.primary };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Historique des versements"
        subtitle="Suivi complet & Quittances officielles"
        showBack
        variant="curved"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard} variant="elevated">
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryLabel}>Total validé (2026)</Text>
                <Text style={styles.summaryAmount}>
                  {resume.totalContribue.toLocaleString('fr-FR')} <Text style={styles.currency}>FCFA</Text>
                </Text>
              </View>
              <View style={styles.summaryBadge}>
                <Ionicons name="shield-checkmark" size={16} color={AppColors.accent} />
                <Text style={styles.summaryBadgeText}>100% Certifié</Text>
              </View>
            </View>

            <View style={styles.summaryStatsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Opérations</Text>
                <Text style={styles.statVal}>{transactions.length}</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Validées</Text>
                <Text style={[styles.statVal, { color: AppColors.success }]}>
                  {transactions.filter((t) => t.statut === 'VALIDE').length}
                </Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>En attente</Text>
                <Text style={[styles.statVal, { color: AppColors.warning }]}>
                  {transactions.filter((t) => t.statut === 'EN_ATTENTE').length}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={AppColors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par libellé, référence, N° reçu..."
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

        {/* Filter Tabs by Category */}
        <View style={styles.categoryFilters}>
          <TabsSelector
            tabs={CATEGORY_FILTERS}
            activeTab={activeCategory}
            onChangeTab={setActiveCategory}
            scrollable
          />
        </View>

        {/* Status Filters Pill Row */}
        <View style={styles.statusRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusRowContent}
          >
            {STATUS_FILTERS.map((st) => {
              const isSel = activeStatus === st.id;
              return (
                <TouchableOpacity
                  key={st.id}
                  style={[styles.statusPill, isSel && styles.statusPillActive]}
                  onPress={() => setActiveStatus(st.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.statusPillText, isSel && styles.statusPillTextActive]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List of Transactions */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>
              {filteredTransactions.length} opération{filteredTransactions.length > 1 ? 's' : ''}
            </Text>
            {totalFilteredAmount > 0 && (
              <Text style={styles.listTotal}>
                Sous-total : {totalFilteredAmount.toLocaleString('fr-FR')} FCFA
              </Text>
            )}
          </View>

          {filteredTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={48} color={AppColors.textMuted} />
              <Text style={styles.emptyTitle}>Aucune transaction trouvée</Text>
              <Text style={styles.emptySub}>
                Modifiez vos critères de recherche ou de filtre.
              </Text>
            </Card>
          ) : (
            filteredTransactions.map((tx) => {
              const method = getPaymentMethodLabel(tx.moyenPaiement);
              const isValid = tx.statut === 'VALIDE';

              return (
                <Card key={tx.id} style={styles.txCard} variant="elevated">
                  <View style={styles.txTopRow}>
                    <View style={styles.txTypeTag}>
                      <Text style={styles.txTypeTagText}>{tx.type}</Text>
                    </View>
                    <Badge
                      label={isValid ? 'Validé' : 'En attente'}
                      variant={isValid ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>

                  <Text style={styles.txTitle}>{tx.titre}</Text>

                  {/* Payment Info */}
                  <View style={styles.txMetaRow}>
                    <View style={styles.txMethodBox}>
                      <Ionicons name={method.icon as any} size={15} color={method.color} />
                      <Text style={styles.txMethodText}>{method.name}</Text>
                    </View>
                    <Text style={styles.txDate}>
                      {tx.date} à {tx.heure}
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={styles.txDivider} />

                  {/* Bottom Row with Amount and Action Button */}
                  <View style={styles.txBottomRow}>
                    <View>
                      <Text style={styles.amountLabel}>Montant versé</Text>
                      <Text style={styles.amountValue}>
                        {tx.montant.toLocaleString('fr-FR')} FCFA
                      </Text>
                    </View>

                    {tx.recuNumero && (
                      <TouchableOpacity
                        style={styles.viewReceiptBtn}
                        onPress={() => router.push(`/recu/${tx.id}`)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="barcode-outline" size={16} color={AppColors.primary} />
                        <Text style={styles.viewReceiptText}>Billet & Reçu</Text>
                        <Ionicons name="chevron-forward" size={14} color={AppColors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })
          )}
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
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  summaryCard: {
    padding: 18,
    borderRadius: 22,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.accentDark,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: 24,
    backgroundColor: AppColors.borderLight,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: AppColors.textPrimary,
  },
  categoryFilters: {
    marginBottom: 12,
  },
  statusRow: {
    paddingBottom: 2,
    marginBottom: 16,
  },
  statusRowContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  statusPillActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  statusPillTextActive: {
    color: AppColors.white,
    fontWeight: '700',
  },
  listSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  listTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.primary,
  },
  txCard: {
    padding: 16,
    borderRadius: 18,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  txTypeTag: {
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  txTypeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.primary,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  txMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txMethodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  txMethodText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  txDate: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  txDivider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginVertical: 12,
  },
  txBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10,
    color: AppColors.textMuted,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
  },
  viewReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  viewReceiptText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
