import { useEffect, useRef } from "react";
import type { PlacementResult } from "@/types/placement";
import type { SearchError } from "@/types/error";
import { useBlockStore } from "@/store/blockStore";
import { useResultStore } from "@/store/resultStore";
import { useSettingsStore } from "@/store/settingsStore";
import { expandBlockSummary } from "@/lib/blocks";

// ---------------------------------------------------------------------------
// Worker message types (local — workers/ import 금지)
// ---------------------------------------------------------------------------

type WorkerOutboundMessage =
  | { type: "progress"; progress: number }
  | { type: "best"; result: PlacementResult }
  | { type: "complete"; result: PlacementResult | null }
  | { type: "error"; error: SearchError }
  | { type: "cancelled" };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePlacementWorker(): {
  startSearch: () => void;
  stopSearch: () => void;
} {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/placementWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const msg = event.data;
      const { setSearchProgress, setResult, setError, stopSearch } = useResultStore.getState();

      switch (msg.type) {
        case "progress":
          setSearchProgress(msg.progress);
          break;
        case "best":
          setResult(msg.result);
          break;
        case "complete":
          if (msg.result !== null) {
            setResult(msg.result);
          } else {
            setError({ kind: "search", message: "배치 결과를 찾지 못했습니다." });
          }
          break;
        case "error":
          setError(msg.error);
          break;
        case "cancelled":
          stopSearch();
          break;
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      useResultStore.getState().setError({ kind: "search", message: event.message });
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const startSearch = () => {
    const worker = workerRef.current;
    if (worker === null) return;

    const blockSummary = useBlockStore.getState().blockSummary;
    const blocks = expandBlockSummary(blockSummary);
    const { regionSettings, priority } = useSettingsStore.getState();

    useResultStore.getState().startSearch();

    worker.postMessage({ type: "start", blocks, regionSettings, priority });
  };

  const stopSearch = () => {
    const worker = workerRef.current;
    if (worker === null) return;

    worker.postMessage({ type: "cancel" });
  };

  return { startSearch, stopSearch };
}
