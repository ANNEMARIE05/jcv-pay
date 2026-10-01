import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { PayerSummary, useFinanceStore } from '@/store/financeStore';
import { ASSIGNABLE_ROLES, ROLE_LABELS } from '@/constants/roles';
import { RoleUtilisateur } from '@/types';
import { AccountCreatedModal, CreatedAccount } from '@/components/finance/AccountCreatedModal';

type MemberDetailModalProps = {
  member: PayerSummary | null;
  canEditRole?: boolean;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value?.trim()) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function MemberDetailModal({ member, canEditRole = false, onClose }: MemberDetailModalProps) {
  const updateUserRole = useFinanceStore((s) => s.updateUserRole);
  const resendMemberAccess = useFinanceStore((s) => s.resendMemberAccess);
  const getMembreTrace = useFinanceStore((s) => s.getMembreTrace);

  const [resending, setResending] = useState(false);
  const [accessModal, setAccessModal] = useState<CreatedAccount | null>(null);

  if (!member) {
    return null;
  }

  const trace = member.userId ? getMembreTrace(member.userId) : undefined;
  const createdDate = member.creeLe || member.dateAdhesion || trace?.date || '—';
  const createdTime = member.creeA || trace?.heure || '—';

  const handleChangeRole = () => {
    if (!member.userId || !canEditRole) return;
    const options = ASSIGNABLE_ROLES.map((r) => ({
      text: r.label,
      onPress: () => {
        updateUserRole(member.userId!, r.id as RoleUtilisateur).catch((error) =>
          Alert.alert('Rôle non modifié', error instanceof Error ? error.message : 'Réessayez.')
        );
      },
    }));
    Alert.alert(`Rôle de ${member.nom}`, 'Choisissez le nouveau rôle.', [...options, { text: 'Annuler', style: 'cancel' }]);
  };

  const handleResendAccess = async () => {
    if (!member.userId) {
      Alert.alert('Accès indisponibles', 'Ce profil n’est pas lié à un compte applicatif.');
      return;
    }
    setResending(true);
    try {
      const password = await resendMemberAccess(member.userId);
      if (!password) {
        Alert.alert(
          'Mot de passe indisponible',
          'Le serveur n’a pas renvoyé de mot de passe temporaire. Vérifiez que l’endpoint « renvoyer accès » est actif ou recréez le compte.'
        );
        return;
      }
      setAccessModal({
        prenom: member.prenom || member.nom.split(' ')[0] || '',
        nom: member.nomFamille || member.nom.split(' ').slice(1).join(' ') || member.nom,
        telephone: member.telephone,
        roleLabel: member.role ? ROLE_LABELS[member.role] : 'Membre',
        motDePasseTemporaire: password,
      });
    } catch (error) {
      Alert.alert(
        'Renvoi impossible',
        error instanceof Error ? error.message : 'Réessayez ou recréez le mot de passe côté serveur.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Modal visible={!!member} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <Card style={styles.sheet}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={26} color={AppColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{member.nom}</Text>
                {member.role ? (
                  <Badge
                    label={ROLE_LABELS[member.role]}
                    variant={member.role === 'MEMBRE' ? 'neutral' : 'accent'}
                    size="sm"
                  />
                ) : null}
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityLabel="Fermer">
                <Ionicons name="close" size={24} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
              <Text style={styles.sectionTitle}>Coordonnées</Text>
              <DetailRow label="Téléphone" value={member.telephone} />
              <DetailRow label="E-mail" value={member.email || '—'} />
              <DetailRow label="Matricule" value={member.matricule || '—'} />
              <DetailRow label="Paroisse" value={member.paroisse || '—'} />
              {member.departement ? <DetailRow label="Département" value={member.departement} /> : null}

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Traçabilité</Text>
              <DetailRow label="Compte créé le" value={createdDate} />
              <DetailRow label="Heure de création" value={createdTime} />
              {member.dateAdhesion && member.dateAdhesion !== createdDate ? (
                <DetailRow label="Date d’adhésion" value={member.dateAdhesion} />
              ) : null}

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Versements</Text>
              <DetailRow
                label="Total validé"
                value={`${member.totalPaye.toLocaleString('fr-FR')} FCFA`}
              />
              <DetailRow label="Dernière opération" value={member.dernierPaiement} />
              <DetailRow label="Nombre d’opérations" value={String(member.nbPaiements)} />

              {canEditRole && member.userId ? (
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleChangeRole} activeOpacity={0.85}>
                  <Ionicons name="shield-outline" size={18} color={AppColors.primary} />
                  <Text style={styles.secondaryBtnText}>Modifier le rôle</Text>
                </TouchableOpacity>
              ) : null}

              {member.userId ? (
                <Button
                  title={resending ? 'Préparation…' : 'Renvoyer les accès'}
                  onPress={handleResendAccess}
                  size="lg"
                  disabled={resending}
                  style={styles.primaryBtn}
                />
              ) : null}
              {resending ? <ActivityIndicator color={AppColors.primary} style={{ marginTop: 8 }} /> : null}
            </ScrollView>
          </Card>
        </View>
      </Modal>
      <AccountCreatedModal
        account={accessModal}
        onClose={() => setAccessModal(null)}
        title="Accès du membre"
        intro="Voici les identifiants à transmettre. Vous pouvez les envoyer par WhatsApp."
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  body: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  rowLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: AppColors.primaryMuted,
  },
  secondaryBtnText: {
    color: AppColors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  primaryBtn: {
    marginTop: 12,
  },
});
