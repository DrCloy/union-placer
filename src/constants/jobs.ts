import type { InnerStat } from "@/types/board";
import type { JobGroup } from "@/types/block";

export const JOB_GROUP_BY_JOB_NAME: Readonly<Record<string, JobGroup>> = {
  Hero: "warrior",
  Paladin: "warrior",
  DarkKnight: "warrior",
  Mihile: "warrior",
  Blaster: "warrior",
  DemonSlayer: "warrior",
  DemonAvenger: "warrior",
  Aran: "warrior",
  Kaiser: "warrior",
  Adele: "warrior",
  Zero: "warrior",
  SoulMaster: "warrior",

  ArchMageFirePoison: "mage",
  ArchMageIceLightning: "mage",
  Bishop: "mage",
  BattleMage: "mage",
  Evan: "mage",
  Luminous: "mage",
  Illium: "mage",
  Lara: "mage",
  Kinesis: "mage",
  FlameWizard: "mage",

  BowMaster: "archer",
  Marksman: "archer",
  Pathfinder: "archer",
  WindBreaker: "archer",
  WildHunter: "archer",
  Mercedes: "archer",
  Kain: "archer",

  NightLord: "thief",
  Shadower: "thief",
  DualBlade: "thief",
  NightWalker: "thief",
  Xenon: "xenon",
  Phantom: "thief",
  Cadena: "thief",
  Khali: "thief",
  Hoyoung: "thief",

  Buccaneer: "pirate",
  Corsair: "pirate",
  Cannoneer: "pirate",
  ThunderBreaker: "pirate",
  Mechanic: "pirate",
  AngelicBuster: "pirate",
  Ark: "pirate",
  Shade: "pirate",
  Captain: "pirate",
} as const;

export const JOB_GROUP_EFFECTIVE_STATS: Readonly<Record<JobGroup, readonly InnerStat[]>> = {
  warrior: ["atk", "str", "dex"],
  mage: ["matk", "int", "luk"],
  archer: ["atk", "dex", "str"],
  thief: ["atk", "luk", "dex"],
  pirate: ["atk", "str", "dex"],
  xenon: ["atk", "str", "dex", "luk"],
} as const;

export const EFFECTIVE_STATS_BY_JOB_NAME: Readonly<Record<string, readonly InnerStat[]>> = {
  DemonAvenger: ["atk", "hp", "str"],
  Xenon: ["atk", "str", "dex", "luk"],
  DualBlade: ["atk", "luk", "str", "dex"],
  Shadower: ["atk", "luk", "str", "dex"],
  Cadena: ["atk", "luk", "str", "dex"],
} as const;
