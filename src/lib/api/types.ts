export interface NexonOpenApiError {
  name: string;
  message: string;
}

export interface NexonUnionApiError {
  error: NexonOpenApiError;
}

/**
 * Shared coordinate type used for both control points and positions
 */
export interface NexonCoordinate {
  x: number;
  y: number;
}

export interface NexonCharacterInfo {
  ocid: string;
  character_name: string;
  world_name: string;
  character_class: string;
  character_level: number;
}

export interface NexonAccountInfo {
  account_id: string;
  character_list: NexonCharacterInfo[];
}

export interface NexonCharacterListResponse {
  account_list: NexonAccountInfo[];
}

export interface NexonCharacterIdResponse {
  ocid: string;
}

export interface NexonUnionResponse {
  date: string;
  union_level: number;
  union_grade: string;
  union_artifact_level: number;
  union_artifact_exp: number;
  union_artifact_point: number;
}

export interface NexonUnionInnerStat {
  stat_field_id: string;
  stat_field_effect: string;
}

/**
 * Control point coordinate for a union block
 */
export type NexonBlockControlPoint = NexonCoordinate;

/**
 * Position coordinate(s) for a union block
 */
export type NexonBlockPosition = NexonCoordinate;

export interface NexonUnionBlock {
  block_type: string;
  block_class: string;
  block_level: string;
  block_control_point: NexonBlockControlPoint;
  block_position: NexonBlockPosition[] | null;
}

export interface NexonUnionRaiderPreset {
  union_raider_stat: string[];
  union_occupied_stat: string[];
  union_inner_stat: NexonUnionInnerStat[];
  union_block: NexonUnionBlock[];
}

export interface NexonUnionRaiderResponse {
  date: string;
  union_raider_stat: string[];
  union_occupied_stat: string[];
  union_inner_stat: NexonUnionInnerStat[];
  union_block: NexonUnionBlock[];
  use_preset_no: number;
  union_raider_preset_1: NexonUnionRaiderPreset;
  union_raider_preset_2: NexonUnionRaiderPreset;
  union_raider_preset_3: NexonUnionRaiderPreset;
  union_raider_preset_4: NexonUnionRaiderPreset;
  union_raider_preset_5: NexonUnionRaiderPreset;
}

export interface NexonUnionInfoResponse {
  union: NexonUnionResponse;
  raider: NexonUnionRaiderResponse;
}
