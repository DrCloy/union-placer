import { create } from "zustand";
import type {
  InnerRegionCellSetting,
  OuterRegionCellSetting,
  Priority,
  RegionCellSetting,
  RegionStat,
  ValidationResult,
} from "@/types/placement";
import { INNER_REGIONS, OUTER_REGIONS } from "@/constants/board";
import { DEFAULT_PRIORITY } from "@/constants/presets";

const INITIAL_REGION_SETTINGS: RegionCellSetting[] = [
  ...OUTER_REGIONS.map(
    (r): OuterRegionCellSetting => ({
      region: r.stat,
      targetCells: 0,
      maxCells: 40,
      isOuter: true,
    }),
  ),
  ...INNER_REGIONS.map(
    (r): InnerRegionCellSetting => ({
      region: r.stat,
      targetCells: 0,
      maxCells: 15,
      isOuter: false,
    }),
  ),
];

interface SettingsState {
  regionSettings: RegionCellSetting[];
  priority: Priority;
  validationResult: ValidationResult | null;
}

interface SettingsActions {
  setRegionCells: (region: RegionStat, cells: number) => void;
  setPriority: (priority: Priority) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  reset: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const INITIAL_STATE: SettingsState = {
  regionSettings: INITIAL_REGION_SETTINGS,
  priority: DEFAULT_PRIORITY,
  validationResult: null,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...INITIAL_STATE,

  setRegionCells: (region, cells) =>
    set((state) => ({
      regionSettings: state.regionSettings.map((s) =>
        s.region === region ? { ...s, targetCells: cells } : s,
      ),
      validationResult: null,
    })),

  setPriority: (priority) => set({ priority, validationResult: null }),

  setValidationResult: (result) => set({ validationResult: result }),

  reset: () => set(INITIAL_STATE),
}));
