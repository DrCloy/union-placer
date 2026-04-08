import type { InnerStat } from "@/types/board";
import type { JobGroup } from "@/types/block";

// 키: Nexon Open API character_class 반환값 (한글)
export const JOB_GROUP_BY_JOB_NAME: Readonly<Record<string, JobGroup>> = {
  히어로: "warrior",
  팔라딘: "warrior",
  다크나이트: "warrior",
  미하일: "warrior",
  소울마스터: "warrior",
  블래스터: "warrior",
  데몬슬레이어: "warrior",
  데몬어벤져: "warrior",
  아란: "warrior",
  카이저: "warrior",
  아델: "warrior",
  제로: "warrior",
  렌: "warrior",

  "아크메이지(불,독)": "mage",
  "아크메이지(썬,콜)": "mage",
  비숍: "mage",
  플레임위자드: "mage",
  배틀메이지: "mage",
  에반: "mage",
  루미너스: "mage",
  일리움: "mage",
  라라: "mage",
  키네시스: "mage",

  보우마스터: "archer",
  신궁: "archer",
  패스파인더: "archer",
  윈드브레이커: "archer",
  와일드헌터: "archer",
  메르세데스: "archer",
  카인: "archer",

  나이트로드: "thief",
  섀도어: "thief",
  듀얼블레이더: "thief",
  나이트워커: "thief",
  제논: "xenon",
  팬텀: "thief",
  카데나: "thief",
  칼리: "thief",
  호영: "thief",

  바이퍼: "pirate",
  캡틴: "pirate",
  캐논마스터: "pirate",
  스트라이커: "pirate",
  메카닉: "pirate",
  은월: "pirate",
  엔젤릭버스터: "pirate",
  아크: "pirate",
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
  데몬어벤져: ["atk", "hp", "str"],
  제논: ["atk", "str", "dex", "luk"],
  듀얼블레이더: ["atk", "luk", "str", "dex"],
  섀도어: ["atk", "luk", "str", "dex"],
  카데나: ["atk", "luk", "str", "dex"],
} as const;
