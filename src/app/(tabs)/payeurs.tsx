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
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { isStaff } from '@/constants/roles';
import { ListSkeleton } from '@/components/motion/Skeleton';
import { useScreenReady } from '@/hooks/useScreenReady';

export default function PayeursScreen() {
  const user = useAuthStore((s) => s.user);
  const addFidele = useFinanceStore((s) => s.addFidele);
  const ready = useScreenReady(420);
  const [open, setOpen] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('+225 ');

  if (!isStaff(user?.role)) {
    return <Redirect href="/(tabs)" />;
  }

  const close = () => setOpen(false);

  const save = async () => {
    if (!prenom.trim() || !nom.trim() || telephone.trim().length < 8) {
      Alert.alert('Champs requis', 'Indiquez le prénom, le nom et le numéro de téléphone.');
      return;
    }
    try {
      const created = await addFidele({ prenom, nom, telephone });
      setPrenom('');
      setNom('');
      setTelephone('+225 ');
      setOpen(false);
      Alert.alert(
        'Fidèle ajouté',
        created.motDePasseTemporaire
          ? `Le compte est créé. Mot de passe temporaire : ${created.motDePasseTemporaire}. La connexion se fait avec le numéro de téléphone.`
          : 'Le fidèle est enregistré.'
      );
    } catch (error) {
      Alert.alert('Ajout impossible', error instanceof Error ? error.message : 'Réessayez.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Fidèles"
        subtitle="Annuaire de l’assemblée"
        showBack
        onBack={() => router.replace('/(tabs)')}
        variant="curved"
        rightAction={
          <TouchableOpacity style={styles.headerAdd} onPress={() => setOpen(true)} activeOpacity={0.85}>
            <Ionicons name="person-add" size={20} color={AppColors.white} />
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.addBtn} onPress={() => setOpen(true)} activeOpacity={0.85}>
            <Ionicons name="add-circle" size={20} color={AppColors.white} />
            <Text style={styles.addBtnText}>Ajouter un fidèle</Text>
          </TouchableOpacity>
          <PayersDirectory />
        </ScrollView>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <Card style={styles.sheet}>
            <Text style={styles.sheetTitle}>Nouveau fidèle</Text>
            <Text style={styles.sheetSub}>Il apparaîtra dans l’annuaire de l’assemblée.</Text>
            <Input label="Prénom" value={prenom} onChangeText={setPrenom} placeholder="ex: Amina" />
            <Input label="Nom" value={nom} onChangeText={setNom} placeholder="ex: Yao" />
            <Input
              label="Téléphone"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              placeholder="+225 07 00 00 00 00"
            />
            <Button title="Ajouter" onPress={save} size="lg" />
            <TouchableOpacity onPress={close} style={styles.cancel}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 130 },
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
  sheet: { padding: 16, borderRadius: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: AppColors.textPrimary },
  sheetSub: { fontSize: 13, color: AppColors.textSecondary, marginTop: 4, marginBottom: 12 },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: AppColors.textSecondary, fontWeight: '700' },
});
