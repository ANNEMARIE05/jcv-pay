import { create } from 'zustand';

export interface DisplayPrefs {
  adminSolde: boolean;
  adminQuickActions: boolean;
  adminValidations: boolean;
  adminCampagnes: boolean;
  adminMembres: boolean;
}

const DEFAULT_PREFS: DisplayPrefs = {
  adminSolde: true,
  adminQuickActions: true,
  adminValidations: true,
  adminCampagnes: true,
  adminMembres: true,
};

interface DisplayPrefsState extends DisplayPrefs {
  toggle: (key: keyof DisplayPrefs) => void;
  reset: () => void;
}

export const useDisplayPrefsStore = create<DisplayPrefsState>((set) => ({
  ...DEFAULT_PREFS,
  toggle: (key) => set((state) => ({ [key]: !state[key] })),
  reset: () => set({ ...DEFAULT_PREFS }),
}));

export const DISPLAY_PREF_ITEMS: { key: keyof DisplayPrefs; title: string; hint: string; area: 'Accueil' | 'Administration' }[] = [
  { key: 'adminSolde', title: 'Solde de l église', hint: 'Montant disponible en haut du tableau de bord', area: 'Administration' },
  { key: 'adminQuickActions', title: 'Actions rapides', hint: 'Nouveau compte et versement espèces', area: 'Administration' },
  { key: 'adminValidations', title: 'Versements à confirmer', hint: 'Liste des déclarations en attente', area: 'Administration' },
  { key: 'adminCampagnes', title: 'Projets, événements, cotisations', hint: 'Onglets de suivi des campagnes', area: 'Administration' },
  { key: 'adminMembres', title: 'Comptes & rôles', hint: 'Liste des utilisateurs', area: 'Administration' },
];
