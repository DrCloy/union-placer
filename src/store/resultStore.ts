import { create } from "zustand";
import type { AppError } from "@/types/error";
import type { PlacementResult } from "@/types/placement";

interface ResultState {
  isSearching: boolean;
  searchProgress: number;
  result: PlacementResult | null;
  error: AppError | null;
}

interface ResultActions {
  startSearch: () => void;
  stopSearch: () => void;
  setSearchProgress: (progress: number) => void;
  setResult: (result: PlacementResult) => void;
  setError: (error: AppError) => void;
  clearError: () => void;
  reset: () => void;
}

type ResultStore = ResultState & ResultActions;

const INITIAL_STATE: ResultState = {
  isSearching: false,
  searchProgress: 0,
  result: null,
  error: null,
};

export const useResultStore = create<ResultStore>((set) => ({
  ...INITIAL_STATE,

  startSearch: () => set({ isSearching: true, searchProgress: 0, result: null, error: null }),

  stopSearch: () => set({ isSearching: false }),

  setSearchProgress: (progress) => set({ searchProgress: progress }),

  setResult: (result) => set({ result, isSearching: false }),

  setError: (error) => set({ error, isSearching: false }),

  clearError: () => set({ error: null }),

  reset: () => set(INITIAL_STATE),
}));
