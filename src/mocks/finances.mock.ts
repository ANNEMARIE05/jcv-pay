import { Transaction, ResumeFinancier, CotisationStatutaire, MouvementCaisse } from '@/types';

export const mockResumeFinancier: ResumeFinancier = {
  totalContribue: 0,
  resteAPayer: 0,
  enAttente: 0,
  epargneSolde: 0,
  projetsActifsCount: 0,
  derniereContributionDate: '',
};

export const mockCotisations: CotisationStatutaire[] = [];

export const mockTransactions: Transaction[] = [];

export const mockMouvementsCaisse: MouvementCaisse[] = [];
