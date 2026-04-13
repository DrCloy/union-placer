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
    (outerRegion): OuterRegionCellSetting => ({
      region: outerRegion.stat,
      targetCells: 0,
      maxCells: outerRegion.maxCells,
      isOuter: true,
    }),
  ),
  ...INNER_REGIONS.map(
    (innerRegion): InnerRegionCellSetting => ({
      region: innerRegion.stat,
      targetCells: 0,
      maxCells: innerRegion.maxCells,
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
      regionSettings: state.regionSettings.map((setting) => {
        if (setting.region !== region) return setting;
        const safeCells = Number.isFinite(cells) ? Math.floor(cells) : 0;
        return { ...setting, targetCells: Math.max(0, Math.min(safeCells, setting.maxCells)) };
      }),
      validationResult: null,
    })),

  setPriority: (priority) => set({ priority, validationResult: null }),

  setValidationResult: (result) => set({ validationResult: result }),

  reset: () => set(INITIAL_STATE),
}));
