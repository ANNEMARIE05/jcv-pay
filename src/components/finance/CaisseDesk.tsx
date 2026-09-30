'use no memo';

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useFinanceStore } from '@/store/financeStore';
import { CAISSE_PRINCIPALE_ID, useCaisseDeskStore } from '@/store/caisseDeskStore';
import { CaisseProjet } from '@/types';

type Cible = { id: string; nom: string; solde: number; principale?: boolean };

export function CaisseDesk({ allowContribute = false }: { allowContribute?: boolean }) {
  const caisses = useFinanceStore((s) => s.caissesProjet);
  const soldeEglise = useFinanceStore((s) => s.tresorerieGlobale.soldeTotal);
  const deltas = useCaisseDeskStore((s) => s.deltas);
  const removed = useCaisseDeskStore((s) => s.removed);
  const move = useCaisseDeskStore((s) => s.move);
  const remove = useCaisseDeskStore((s) => s.remove);

  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState<string | null>(null);
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');

  const solde = (id: string, base: number) => base + (deltas[id] || 0);

  const autres = useMemo(
    () => caisses.filter((c) => !removed.includes(c.id)),
    [caisses, removed]
  );

  const cibles: Cible[] = [
    {
      id: CAISSE_PRINCIPALE_ID,
      nom: 'Caisse principale',
      solde: solde(CAISSE_PRINCIPALE_ID, soldeEglise),
      principale: true,
    },
    ...autres.map((c) => ({
      id: c.id,
      nom: c.nom,
      solde: solde(c.id, c.montantCollecte),
    })),
  ];

  const ouverte = fromId != null;
  const source = cibles.find((c) => c.id === fromId);

  const openTransfer = (id: string) => {
    if (id === CAISSE_PRINCIPALE_ID) return;
    const destinations = cibles.filter((c) => c.id !== id);
    if (destinations.length === 0) {
      Alert.alert('Une seule caisse', 'Créez une autre caisse pour pouvoir transférer.');
      return;
    }
    const versPrincipale = destinations.find((c) => c.principale) ?? destinations[0];
    setFromId(id);
    setToId(versPrincipale.id);
    setMontant('');
    setMotif('');
  };

  const closeTransfer = () => setFromId(null);

  const confirmTransfer = () => {
    if (!fromId || !toId || fromId === toId || fromId === CAISSE_PRINCIPALE_ID) {
      Alert.alert(
        'Transfert',
        'Choisissez une autre caisse. La caisse principale reçoit, elle n’envoie pas.'
      );
      return;
    }
    const amount = parseInt(montant.replace(/\D/g, ''), 10) || 0;
    const from = cibles.find((c) => c.id === fromId);
    if (!from || amount <= 0) {
      Alert.alert('Montant', 'Indiquez une somme supérieure à 0.');
      return;
    }
    if (amount > from.solde) {
      Alert.alert('Solde insuffisant', 'Cette caisse n’a pas assez d’argent pour ce transfert.');
      return;
    }
    if (!motif.trim()) {
      Alert.alert('Motif', 'Indiquez pourquoi l’argent change de caisse.');
      return;
    }
    move(fromId, toId, amount);
    closeTransfer();
  };

  const confirmDelete = (caisse: CaisseProjet) => {
    const reste = solde(caisse.id, caisse.montantCollecte);
    if (reste > 0) {
      Alert.alert(
        'Transférez d’abord',
        `« ${caisse.nom} » contient encore ${reste.toLocaleString('fr-FR')} FCFA. Envoyez cette somme vers la caisse principale, puis supprimez la caisse.`
      );
      return;
    }
    Alert.alert(
      'Supprimer cette caisse ?',
      `« ${caisse.nom} » sera retirée. La caisse principale, elle, reste.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => remove(caisse.id) },
      ]
    );
  };

  return (
    <View>
      <Card style={styles.mainCard} variant="elevated">
        <View style={styles.mainTop}>
          <View style={styles.mainIcon}>
            <Ionicons name="lock-closed" size={18} color={AppColors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Toujours là</Text>
            <Text style={styles.mainTitle}>Caisse principale</Text>
          </View>
        </View>
        <Text style={styles.mainAmount}>
          {cibles[0].solde.toLocaleString('fr-FR')} FCFA
        </Text>
        <Text style={styles.mainHint}>
          L’argent de l’église arrive ici. Cette caisse ne se supprime pas et n’envoie rien. Les autres caisses peuvent lui transférer.
        </Text>
      </Card>

      <Text style={styles.sectionLabel}>Autres caisses</Text>
      {autres.length === 0 ? (
        <Text style={styles.empty}>
          Aucune autre caisse. Créez-en une pour un projet : elle pourra transférer vers la caisse principale, ou vers une autre caisse.
        </Text>
      ) : (
        autres.map((caisse) => {
          const reste = solde(caisse.id, caisse.montantCollecte);
          return (
            <Card key={caisse.id} style={styles.card} variant="elevated">
              <Text style={styles.cardTitle}>{caisse.nom}</Text>
              {caisse.description ? <Text style={styles.cardDesc}>{caisse.description}</Text> : null}
              <Text style={styles.cardAmount}>{reste.toLocaleString('fr-FR')} FCFA</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.transferBtn} onPress={() => openTransfer(caisse.id)} activeOpacity={0.85}>
                  <Ionicons name="swap-horizontal" size={16} color={AppColors.primary} />
                  <Text style={styles.transferBtnText}>Transférer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(caisse)} activeOpacity={0.85}>
                  <Ionicons name="trash-outline" size={16} color={AppColors.danger} />
                  <Text style={styles.deleteBtnText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
              {allowContribute && caisse.statut === 'OUVERTE' ? (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/contribution/nouvelle',
                      params: { type: 'PROJET', titre: caisse.nom, projetId: caisse.projetId || '' },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.contribute}>Contribuer à cette caisse</Text>
                </TouchableOpacity>
              ) : null}
            </Card>
          );
        })
      )}

      <Modal visible={ouverte} transparent animationType="fade" onRequestClose={closeTransfer}>
        <View style={styles.backdrop}>
          <Card style={styles.sheet}>
            <Text style={styles.sheetTitle}>Caisse vers caisse</Text>
            <Text style={styles.sheetSub}>
              Depuis {source?.nom}. Solde : {(source?.solde || 0).toLocaleString('fr-FR')} FCFA
            </Text>
            <Text style={styles.fieldLabel}>Vers</Text>
            <View style={styles.pills}>
              {cibles
                .filter((c) => c.id !== fromId)
                .map((c) => {
                  const active = toId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.pill, active && styles.pillOn]}
                      onPress={() => setToId(c.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextOn]}>{c.nom}</Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
            <Input
              label="Montant (FCFA)"
              value={montant}
              onChangeText={setMontant}
              keyboardType="numeric"
              placeholder="ex: 50000"
            />
            <Input
              label="Motif"
              value={motif}
              onChangeText={setMotif}
              placeholder="ex: Avance pour le chantier"
            />
            <Button title="Transférer" onPress={confirmTransfer} size="lg" />
            <TouchableOpacity onPress={closeTransfer} style={styles.cancel}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    marginBottom: 16,
  },
  mainTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mainIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: { color: AppColors.accent, fontSize: 11, fontWeight: '700' },
  mainTitle: { color: AppColors.white, fontSize: 18, fontWeight: '800' },
  mainAmount: {
    color: AppColors.white,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 14,
  },
  mainHint: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  empty: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  card: { padding: 14, borderRadius: 18, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: AppColors.textPrimary },
  cardDesc: { fontSize: 13, color: AppColors.textSecondary, marginTop: 4, lineHeight: 18 },
  cardAmount: { fontSize: 18, fontWeight: '800', color: AppColors.primary, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  transferBtnText: { color: AppColors.primary, fontWeight: '700', fontSize: 13 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: AppColors.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deleteBtnText: { color: AppColors.danger, fontWeight: '700', fontSize: 13 },
  contribute: {
    marginTop: 10,
    color: AppColors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: { padding: 16, borderRadius: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: AppColors.textPrimary },
  sheetSub: { fontSize: 13, color: AppColors.textSecondary, marginTop: 4, marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: AppColors.primaryMuted,
  },
  pillOn: { backgroundColor: AppColors.primary },
  pillText: { fontSize: 12, fontWeight: '700', color: AppColors.primary },
  pillTextOn: { color: AppColors.white },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: AppColors.textSecondary, fontWeight: '700' },
});
