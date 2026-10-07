import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { AppColors } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export interface CreatedAccount {
  prenom: string;
  nom: string;
  telephone: string;
  roleLabel: string;
  motDePasseTemporaire?: string;
}

export function AccountCreatedModal({
  account,
  onClose,
  title = 'Compte créé',
  intro,
}: {
  account: CreatedAccount | null;
  onClose: () => void;
  title?: string;
  intro?: string;
}) {
  const password = account?.motDePasseTemporaire?.trim() ?? '';
  const copyScopeKey = `${account?.telephone ?? ''}:${password}`;
  const [copiedScopeKey, setCopiedScopeKey] = useState<string | null>(null);
  const copied = copiedScopeKey === copyScopeKey && copyScopeKey.length > 0;

  const copyPassword = async () => {
    if (!password) return;
    try {
      const ok = await Clipboard.setStringAsync(password);
      if (!ok) {
        Alert.alert('Copie impossible', 'Sélectionnez le mot de passe et copiez-le manuellement.');
        return;
      }
      setCopiedScopeKey(copyScopeKey);
    } catch (error) {
      Alert.alert('Copie impossible', error instanceof Error ? error.message : 'Réessayez.');
    }
  };

  const sendWhatsApp = async () => {
    if (!account) return;
    const cleanPhone = account.telephone.replace(/[^0-9]/g, '');
    const fullName = `${account.prenom} ${account.nom}`.trim();
    const message = [
      `Bonjour *${fullName}*,`,
      ``,
      `Votre compte sur l'application *JCV Pay* (Église Jésus Christ Victoire) a été créé avec succès.`,
      ``,
      `Voici vos identifiants pour vous connecter :`,
      `📱 *Téléphone :* ${account.telephone}`,
      password ? `🔑 *Mot de passe temporaire :* ${password}` : null,
      `👤 *Rôle :* ${account.roleLabel}`,
      ``,
      `Veuillez vous connecter à JCV Pay et modifier votre mot de passe dès votre première connexion.`,
      ``,
      `Que Dieu vous bénisse !`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Share.share({ message });
      }
    } catch {
      try {
        await Share.share({ message });
      } catch {
        Alert.alert('Envoi impossible', 'Impossible d’ouvrir WhatsApp. Vous pouvez copier les informations manuellement.');
      }
    }
  };

  return (
    <Modal visible={!!account} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>
            {intro ??
              (account
                ? `${account.prenom} ${account.nom}`.trim() +
                  ` est en haut de la liste des membres, en ${account.roleLabel}.`
                : '')}
          </Text>
          <Text style={styles.meta}>Connexion avec {account?.telephone}</Text>
          {password ? (
            <View style={styles.passwordBox}>
              <Text style={styles.passwordLabel}>Mot de passe temporaire</Text>
              <Text style={styles.passwordValue} selectable>
                {password}
              </Text>
              <TouchableOpacity style={styles.copyBtn} onPress={copyPassword} activeOpacity={0.85}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={AppColors.primary} />
                <Text style={styles.copyText}>{copied ? 'Copié' : 'Copier le mot de passe'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity style={styles.whatsappBtn} onPress={sendWhatsApp} activeOpacity={0.85}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.whatsappText}>Envoyer par WhatsApp</Text>
          </TouchableOpacity>

          <Button title="Fermer" onPress={onClose} size="lg" variant="outline" />
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: { padding: 18, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: '800', color: AppColors.textPrimary },
  sub: { fontSize: 14, color: AppColors.textSecondary, marginTop: 6, lineHeight: 20 },
  meta: { fontSize: 13, color: AppColors.textPrimary, fontWeight: '600', marginTop: 10 },
  passwordBox: {
    marginTop: 14,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    padding: 12,
  },
  passwordLabel: { fontSize: 12, color: AppColors.textSecondary, fontWeight: '700' },
  passwordValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textPrimary,
    letterSpacing: 0.4,
  },
  copyBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: AppColors.primaryMuted,
  },
  copyText: { color: AppColors.primary, fontWeight: '800', fontSize: 14 },
  whatsappBtn: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#25D366',
    elevation: 2,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  whatsappText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

