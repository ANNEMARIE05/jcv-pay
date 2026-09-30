import { create } from 'zustand';

export const CAISSE_PRINCIPALE_ID = 'principale';

interface CaisseDeskState {
  deltas: Record<string, number>;
  removed: string[];
  move: (fromId: string, toId: string, montant: number) => void;
  remove: (caisseId: string) => void;
}

export const useCaisseDeskStore = create<CaisseDeskState>((set) => ({
  deltas: {},
  removed: [],
  move: (fromId, toId, montant) =>
    set((state) => ({
      deltas: {
        ...state.deltas,
        [fromId]: (state.deltas[fromId] || 0) - montant,
        [toId]: (state.deltas[toId] || 0) + montant,
      },
    })),
  remove: (caisseId) =>
    set((state) => ({
      removed: state.removed.includes(caisseId) ? state.removed : [...state.removed, caisseId],
    })),
}));
