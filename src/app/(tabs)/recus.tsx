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
import { AppColors, Shadows } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Badge } from '@/components/common/Badge';
import { TabsSelector } from '@/components/common/TabsSelector';
import { useFinanceStore } from '@/store/financeStore';

export default function RecusScreen() {
  const recus = useFinanceStore((s) => s.recus);

  const [activeTab, setActiveTab] = useState<'TOUS' | 'VALIDE' | 'EN_ATTENTE'>('TOUS');

  const filteredRecus = useMemo(() => {
    if (activeTab === 'TOUS') return recus;
    return recus.filter((r) => r.statut === activeTab);
  }, [recus, activeTab]);

  return (
    <View style={styles.container}>
      {/* Deep Teal Header (Screen 13 style) */}
      <Header
        title="Mes Reçus & Billets"
        subtitle="Quittances et justificatifs de paiement"
        showBack
        onBack={() => router.replace('/(tabs)')}
        variant="curved"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented Filter Bar (Screen 13 tabs: Ongoing, Completed, Canceled) */}
        <View style={styles.tabsContainer}>
          <TabsSelector
            tabs={[
              { id: 'TOUS', label: 'Tous', count: recus.length },
              {
                id: 'VALIDE',
                label: 'Validés',
                count: recus.filter((r) => r.statut === 'VALIDE').length,
              },
              {
                id: 'EN_ATTENTE',
                label: 'En attente',
                count: recus.filter((r) => r.statut === 'EN_ATTENTE').length,
              },
            ]}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            variant="segmented"
          />
        </View>

        {/* List of Ticket Cards (Authentic train ticket style from Screen 13) */}
        <View style={styles.ticketsList}>
          {filteredRecus.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={AppColors.textMuted} />
              <Text style={styles.emptyTitle}>Aucun reçu trouvé</Text>
              <Text style={styles.emptySubtitle}>
                Vos futurs paiements et cotisations apparaîtront ici.
              </Text>
            </View>
          ) : (
            filteredRecus.map((recu) => {
              const isValid = recu.statut === 'VALIDE';

              return (
                <TouchableOpacity
                  key={recu.id}
                  style={styles.ticketCard}
                  onPress={() => router.push(`/recu/${recu.id}`)}
                  activeOpacity={0.85}
                >
                  {/* Ticket Header */}
                  <View style={styles.ticketHeader}>
                    <View style={styles.churchInfoRow}>
                      <View style={styles.churchIconCircle}>
                        <Ionicons name="book-outline" size={16} color={AppColors.primary} />
                      </View>
                      <View>
                        <Text style={styles.churchName}>{recu.egliseNom}</Text>
                        <Text style={styles.receiptNum}>N° {recu.numeroRecu}</Text>
                      </View>
                    </View>
                    <Badge
                      label={isValid ? 'Validé' : 'En attente'}
                      variant={isValid ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>

                  {/* Perforated Divider (Notched look) */}
                  <View style={styles.perforatedRow}>
                    <View style={[styles.notch, styles.notchLeft]} />
                    <View style={styles.dashedLine} />
                    <View style={[styles.notch, styles.notchRight]} />
                  </View>

                  {/* Ticket Body */}
                  <View style={styles.ticketBody}>
                    <Text style={styles.contributionTitle}>{recu.titre}</Text>

                    <View style={styles.infoGrid}>
                      <View style={styles.infoCol}>
                        <Text style={styles.label}>Date & Heure</Text>
                        <Text style={styles.val}>
                          {recu.date} • {recu.heure}
                        </Text>
                      </View>
                      <View style={styles.infoColRight}>
                        <Text style={styles.label}>Règlement</Text>
                        <Text style={styles.val}>{recu.moyenPaiement.replace('_', ' ')}</Text>
                      </View>
                    </View>

                    <View style={styles.ticketFooter}>
                      <View>
                        <Text style={styles.amountLabel}>Montant versé</Text>
                        <Text style={styles.amountValue}>
                          {recu.montant.toLocaleString('fr-FR')} FCFA
                        </Text>
                      </View>

                      <View style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>Voir le billet</Text>
                        <Ionicons name="barcode-outline" size={18} color={AppColors.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
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
    paddingBottom: 130,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  ticketsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  ticketCard: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    ...Shadows.ticket,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  churchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  churchIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  churchName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  receiptNum: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontFamily: 'monospace',
  },
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  notch: {
    width: 16,
    height: 20,
    backgroundColor: AppColors.background,
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  notchLeft: {
    left: -8,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: AppColors.borderLight,
  },
  notchRight: {
    right: -8,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: AppColors.borderLight,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: AppColors.border,
    marginHorizontal: 16,
  },
  ticketBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contributionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoColRight: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 10,
    color: AppColors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  val: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  amountLabel: {
    fontSize: 10,
    color: AppColors.textSecondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.primary,
    marginTop: 1,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
