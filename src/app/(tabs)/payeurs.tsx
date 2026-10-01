'use no memo';

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { PayersDirectory } from '@/components/finance/PayersDirectory';
import { TabsSelector } from '@/components/common/TabsSelector';
import { AccountCreatedModal, CreatedAccount } from '@/components/finance/AccountCreatedModal';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { ASSIGNABLE_ROLES, ROLE_LABELS, canManagePeople, isStaff } from '@/constants/roles';
import { RoleUtilisateur } from '@/types';
import { ListSkeleton } from '@/components/motion/Skeleton';
import { useScreenReady } from '@/hooks/useScreenReady';

type PayeursSection = 'MEMBRES' | 'HISTORIQUE';

export default function PayeursScreen() {
  const user = useAuthStore((s) => s.user);
  const addFidele = useFinanceStore((s) => s.addFidele);
  const transactions = useFinanceStore((s) => s.transactions);
  const utilisateurs = useFinanceStore((s) => s.utilisateurs);
  const dernierAjoutId = useFinanceStore((s) => s.dernierAjoutId);
  const ready = useScreenReady(420);
  const [section, setSection] = useState<PayeursSection>('MEMBRES');
  const [open, setOpen] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('+225 ');
  const [role, setRole] = useState<RoleUtilisateur>('MEMBRE');
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  const canCreateMember = canManagePeople(user?.role);

  if (!canManagePeople(user?.role)) {
    return <Redirect href="/(tabs)" />;
  }

  const resetForm = () => {
    setPrenom('');
    setNom('');
    setTelephone('+225 ');
    setRole('MEMBRE');
  };

  const close = () => setOpen(false);

  const save = async () => {
    if (!canCreateMember) {
      Alert.alert('Action non autorisée', 'Les trésoriers ne peuvent pas créer de membre.');
      return;
    }
    if (!prenom.trim() || !nom.trim() || telephone.trim().length < 8) {
      Alert.alert('Champs requis', 'Indiquez le prénom, le nom et le numéro de téléphone.');
      return;
    }
    try {
      const created = await addFidele({ prenom, nom, telephone, role });
      const assignedRole = ROLE_LABELS[created.role] ?? ROLE_LABELS[role];
      resetForm();
      setOpen(false);
      setSection('MEMBRES');
      setCreatedAccount({
        prenom: created.prenom,
        nom: created.nom,
        telephone: created.telephone,
        roleLabel: assignedRole,
        motDePasseTemporaire: created.motDePasseTemporaire,
      });
    } catch (error) {
      Alert.alert('Ajout impossible', error instanceof Error ? error.message : 'Réessayez.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Membres"
        subtitle={section === 'MEMBRES' ? 'Annuaire de l’assemblée' : 'Historique des transactions'}
        showBack
        onBack={() => router.replace('/(tabs)')}
        variant="curved"
        rightAction={
          canCreateMember ? (
            <TouchableOpacity style={styles.headerAdd} onPress={() => setOpen(true)} activeOpacity={0.85}>
              <Ionicons name="person-add" size={20} color={AppColors.white} />
            </TouchableOpacity>
          ) : undefined
        }
      />
      {!ready ? (
        <ListSkeleton count={5} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.sectionTabs}>
            <TabsSelector
              tabs={[
                { id: 'MEMBRES', label: 'Membres', count: utilisateurs.length },
                {
                  id: 'HISTORIQUE',
                  label: 'Historique',
                  count: transactions.filter((t) => t.statut !== 'EN_ATTENTE').length,
                },
              ]}
              activeTab={section}
              onChangeTab={setSection}
              variant="segmented"
            />
          </View>
          {section === 'MEMBRES' && canCreateMember && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setOpen(true)} activeOpacity={0.85}>
              <Ionicons name="add-circle" size={20} color={AppColors.white} />
              <Text style={styles.addBtnText}>Ajouter un membre</Text>
            </TouchableOpacity>
          )}
          <PayersDirectory
            key={`${section}-${dernierAjoutId ?? ''}-${utilisateurs.length}`}
            variant={section === 'MEMBRES' ? 'members' : 'history'}
            canEditRole={canCreateMember}
          />
        </ScrollView>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <Card style={styles.sheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContent}
            >
              <Text style={styles.sheetTitle}>Ajouter un membre</Text>
              <Text style={styles.sheetSub}>
                Choisissez son rôle. Après connexion, il voit uniquement ce que ce rôle autorise.
              </Text>
              <Input label="Prénom" value={prenom} onChangeText={setPrenom} placeholder="ex: Amina" />
              <Input label="Nom" value={nom} onChangeText={setNom} placeholder="ex: Yao" />
              <Input
                label="Téléphone"
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
                placeholder="+225 07 00 00 00 00"
              />
              <Text style={styles.roleLabel}>Rôle</Text>
              {ASSIGNABLE_ROLES.map((item) => {
                const selected = role === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.rolePick, selected && styles.rolePickActive]}
                    onPress={() => setRole(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.rolePickTitle, selected && styles.rolePickTitleActive]}>{item.label}</Text>
                    <Text style={styles.rolePickHint}>{item.hint}</Text>
                  </TouchableOpacity>
                );
              })}
              <Button title="Ajouter" onPress={save} size="lg" />
              <TouchableOpacity onPress={close} style={styles.cancel}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </Card>
        </View>
      </Modal>
      <AccountCreatedModal account={createdAccount} onClose={() => setCreatedAccount(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 130 },
  sectionTabs: { marginBottom: 14 },
  headerAdd: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  addBtnText: {
    color: AppColors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: { padding: 0, borderRadius: 20, maxHeight: '88%' },
  sheetContent: { padding: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: AppColors.textPrimary },
  sheetSub: { fontSize: 13, color: AppColors.textSecondary, marginTop: 4, marginBottom: 12, lineHeight: 18 },
  roleLabel: { fontSize: 13, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 8 },
  rolePick: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: AppColors.borderLight,
  },
  rolePickActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryMuted,
  },
  rolePickTitle: { fontSize: 14, fontWeight: '700', color: AppColors.textPrimary },
  rolePickTitleActive: { color: AppColors.primary },
  rolePickHint: { fontSize: 12, color: AppColors.textSecondary, marginTop: 3, lineHeight: 16 },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: AppColors.textSecondary, fontWeight: '700' },
});
