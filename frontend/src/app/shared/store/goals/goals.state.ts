import { Goal } from '../../models/goal.model';

export interface GoalsState {
  activeGoals: Goal[];
  archivedGoals: Goal[];
  isLoading: boolean;
  isArchivedLoading: boolean;
  error: string | null;
}

export const initialGoalsState: GoalsState = {
  activeGoals: [],
  archivedGoals: [],
  isLoading: false,
  isArchivedLoading: false,
  error: null,
};
