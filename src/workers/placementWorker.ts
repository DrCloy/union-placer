/// <reference lib="webworker" />

import type { BlockShape } from "@/types/block";
import type { SearchError } from "@/types/error";
import type { PlacementResult, Priority, RegionCellSetting } from "@/types/placement";
import { findOptimalPlacement } from "@/lib/algorithm";

// ---------------------------------------------------------------------------
// Message contracts
// ---------------------------------------------------------------------------

type WorkerInboundMessage =
  | { type: "start"; blocks: BlockShape[]; regionSettings: RegionCellSetting[]; priority: Priority }
  | { type: "cancel" };

type WorkerOutboundMessage =
  | { type: "progress"; progress: number }
  | { type: "best"; result: PlacementResult }
  | { type: "complete"; result: PlacementResult | null }
  | { type: "error"; error: SearchError }
  | { type: "cancelled" };

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let isCancelled = false;

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const message = event.data;

  if (message.type === "cancel") {
    isCancelled = true;
    return;
  }

  if (message.type === "start") {
    isCancelled = false;

    const { blocks, regionSettings, priority } = message;
    let betterResultCount = 0;

    try {
      const result = findOptimalPlacement(blocks, regionSettings, priority, {
        shouldAbort: () => isCancelled,
        onBetterResult: (betterResult: PlacementResult) => {
          const progress = betterResultCount === 0 ? 20 : Math.min(20 + betterResultCount * 5, 90);
          betterResultCount += 1;

          const progressMessage: WorkerOutboundMessage = { type: "progress", progress };
          self.postMessage(progressMessage);

          const bestMessage: WorkerOutboundMessage = { type: "best", result: betterResult };
          self.postMessage(bestMessage);
        },
      });

      if (isCancelled) {
        const cancelledMessage: WorkerOutboundMessage = { type: "cancelled" };
        self.postMessage(cancelledMessage);
      } else {
        const completeMessage: WorkerOutboundMessage = { type: "complete", result };
        self.postMessage(completeMessage);
      }
    } catch (error) {
      const message_ = error instanceof Error ? error.message : String(error);
      const errorMessage: WorkerOutboundMessage = {
        type: "error",
        error: { kind: "search", message: message_ },
      };
      self.postMessage(errorMessage);
    }
  }
};
