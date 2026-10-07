import { RoleUtilisateur } from '@/types';

export const ROLE_LABELS: Record<RoleUtilisateur, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMINISTRATEUR: 'Administrateur',
  TRESORIER: 'Trésorier',
  RESPONSABLE: 'Responsable',
  MEMBRE: 'Membre',
};

export const ASSIGNABLE_ROLES: { id: RoleUtilisateur; label: string; hint: string }[] = [
  { id: 'MEMBRE', label: 'Membre', hint: 'Déclare ses versements et consulte ses reçus' },
  { id: 'TRESORIER', label: 'Trésorier', hint: 'Confirme l argent, ouvre les caisses et les projets' },
  { id: 'ADMINISTRATEUR', label: 'Administrateur', hint: 'Crée les comptes, projets, caisses et attribue les rôles' },
];

export function canManagePeople(role?: RoleUtilisateur | null) {
  return role === 'ADMINISTRATEUR' || role === 'SUPER_ADMIN';
}

export function canManageMoney(role?: RoleUtilisateur | null) {
  return role === 'TRESORIER' || role === 'SUPER_ADMIN';
}

/** Consultation des versements en attente (super admin, admin, trésorier). */
export function canViewPendingPayments(role?: RoleUtilisateur | null) {
  return (
    role === 'SUPER_ADMIN' ||
    role === 'ADMINISTRATEUR' ||
    role === 'TRESORIER'
  );
}

export function isStaff(role?: RoleUtilisateur | null) {
  return canManagePeople(role) || canManageMoney(role);
}

export function canManageCampaigns(role?: RoleUtilisateur | null) {
  return isStaff(role);
}
