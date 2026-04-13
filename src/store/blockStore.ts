import { create } from "zustand";
import type { BlockCount, BlockSummary, Character } from "@/types/character";
import { fetchBlockSummaryFromCharacters, fetchBlockSummaryFromManualBlocks } from "@/lib/blocks";

const EMPTY_BLOCK_SUMMARY: BlockSummary = {
  blocks: [],
  totalBlocks: 0,
  totalCells: 0,
};

interface BlockState {
  inputMethod: "nickname" | "manual";
  apiKey: string | null;
  characters: Character[];
  selectedCharacterIds: Set<string>;
  manualBlocks: BlockCount[];
  blockSummary: BlockSummary;
}

interface BlockActions {
  setInputMethod: (method: "nickname" | "manual") => void;
  setApiKey: (key: string | null) => void;
  setCharacters: (characters: Character[]) => void;
  toggleCharacter: (characterId: string) => void;
  setManualBlocks: (blocks: BlockCount[]) => void;
  reset: () => void;
}

type BlockStore = BlockState & BlockActions;

function computeBlockSummary(
  inputMethod: "nickname" | "manual",
  characters: Character[],
  selectedCharacterIds: Set<string>,
  manualBlocks: BlockCount[],
): BlockSummary {
  if (inputMethod === "nickname") {
    return fetchBlockSummaryFromCharacters(
      characters.filter((character) => selectedCharacterIds.has(character.id)),
    );
  }
  return fetchBlockSummaryFromManualBlocks(manualBlocks);
}

const INITIAL_STATE: BlockState = {
  inputMethod: "nickname",
  apiKey: null,
  characters: [],
  selectedCharacterIds: new Set(),
  manualBlocks: [],
  blockSummary: EMPTY_BLOCK_SUMMARY,
};

export const useBlockStore = create<BlockStore>((set) => ({
  ...INITIAL_STATE,

  setInputMethod: (method) =>
    set((state) => ({
      inputMethod: method,
      blockSummary: computeBlockSummary(
        method,
        state.characters,
        state.selectedCharacterIds,
        state.manualBlocks,
      ),
    })),

  setApiKey: (key) => set({ apiKey: key }),

  setCharacters: (characters) => {
    const selectedCharacterIds = new Set(characters.map((character) => character.id));
    set((state) => ({
      characters,
      selectedCharacterIds,
      blockSummary: computeBlockSummary(
        state.inputMethod,
        characters,
        selectedCharacterIds,
        state.manualBlocks,
      ),
    }));
  },

  toggleCharacter: (characterId) =>
    set((state) => {
      const next = new Set(state.selectedCharacterIds);
      if (next.has(characterId)) {
        next.delete(characterId);
      } else {
        next.add(characterId);
      }
      return {
        selectedCharacterIds: next,
        blockSummary: computeBlockSummary(
          state.inputMethod,
          state.characters,
          next,
          state.manualBlocks,
        ),
      };
    }),

  setManualBlocks: (blocks) =>
    set((state) => ({
      manualBlocks: blocks,
      blockSummary: computeBlockSummary(
        state.inputMethod,
        state.characters,
        state.selectedCharacterIds,
        blocks,
      ),
    })),

  reset: () => set({ ...INITIAL_STATE, selectedCharacterIds: new Set() }),
}));
