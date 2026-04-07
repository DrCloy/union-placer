import type { CustomPriority, OuterRegionCellSetting, OuterStat, PresetType, Priority } from "@/types/placement";

const OUTER_MAX_CELLS = 40;

function createOuterRegionCellSetting(region: OuterStat, targetCells: number): OuterRegionCellSetting {
  return {
    region,
    targetCells,
    maxCells: OUTER_MAX_CELLS,
    isOuter: true,
  };
}

const HUNTING_CUSTOM_PRIORITY: CustomPriority = {
  required: [createOuterRegionCellSetting("exp", 40)],
  priorities: [[createOuterRegionCellSetting("critDamage", 40)], [createOuterRegionCellSetting("normalDamage", 40)]],
};

const BOSS_CUSTOM_PRIORITY: CustomPriority = {
  required: [createOuterRegionCellSetting("critDamage", 40)],
  priorities: [[createOuterRegionCellSetting("bossDamage", 40)], [createOuterRegionCellSetting("ignoreDefense", 40)]],
};

export const PRESET_PRIORITY: Readonly<Record<PresetType, Priority>> = {
  hunting: {
    type: "preset",
    preset: "hunting",
  },
  boss: {
    type: "preset",
    preset: "boss",
  },
} as const;

export const PRESET_CUSTOM_PRIORITY: Readonly<Record<PresetType, CustomPriority>> = {
  hunting: HUNTING_CUSTOM_PRIORITY,
  boss: BOSS_CUSTOM_PRIORITY,
} as const;

export const DEFAULT_PRIORITY: Priority = PRESET_PRIORITY.hunting;
