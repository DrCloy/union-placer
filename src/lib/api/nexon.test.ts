import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NexonUnionInfoResponse } from "@/types/nexon";
import { fetchUnionInfo, NexonApiError } from "@/lib/api/nexon";

const SUCCESS_RESPONSE = {
  union: {
    date: "2026-01-01",
    union_level: 1,
    union_grade: "B",
    union_artifact_level: 1,
    union_artifact_exp: 0,
    union_artifact_point: 0,
  },
  raider: {
    date: "2026-01-01",
    union_raider_stat: [],
    union_occupied_stat: [],
    union_inner_stat: [],
    union_block: [],
    use_preset_no: 1,
    union_raider_preset_1: {
      union_raider_stat: [],
      union_occupied_stat: [],
      union_inner_stat: [],
      union_block: [],
    },
    union_raider_preset_2: {
      union_raider_stat: [],
      union_occupied_stat: [],
      union_inner_stat: [],
      union_block: [],
    },
    union_raider_preset_3: {
      union_raider_stat: [],
      union_occupied_stat: [],
      union_inner_stat: [],
      union_block: [],
    },
    union_raider_preset_4: {
      union_raider_stat: [],
      union_occupied_stat: [],
      union_inner_stat: [],
      union_block: [],
    },
    union_raider_preset_5: {
      union_raider_stat: [],
      union_occupied_stat: [],
      union_inner_stat: [],
      union_block: [],
    },
  },
} as NexonUnionInfoResponse;

function fetchHeaderValue(headers: HeadersInit | undefined, key: string): string | null {
  if (headers === undefined) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(key);
  }

  if (Array.isArray(headers)) {
    const loweredKey = key.toLowerCase();
    const matched = headers.find(([name]) => name.toLowerCase() === loweredKey);
    return matched?.[1] ?? null;
  }

  const loweredKey = key.toLowerCase();
  const matched = Object.entries(headers).find(([name]) => name.toLowerCase() === loweredKey);
  return matched?.[1] ?? null;
}

describe("fetchUnionInfo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("throws when nickname is empty after trim", async () => {
    await expect(fetchUnionInfo("   ")).rejects.toThrow(NexonApiError);
    await expect(fetchUnionInfo("   ")).rejects.toThrow("Nickname is required");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("trims nickname and api key before request", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(SUCCESS_RESPONSE),
    } as unknown as Response);

    await fetchUnionInfo("  Maple Hero  ", "  test-key  ");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    const requestUrl = new URL(url, "https://example.test");
    expect(requestUrl.pathname).toBe("/api/nexon/union");
    expect(requestUrl.searchParams.get("nickname")).toBe("Maple Hero");

    expect(fetchHeaderValue(options.headers, "x-api-key")).toBe("test-key");
  });

  it("does not set x-api-key header when api key trims to empty string", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(SUCCESS_RESPONSE),
    } as unknown as Response);

    await fetchUnionInfo("  Maple Hero  ", "   ");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    const requestUrl = new URL(url, "https://example.test");
    expect(requestUrl.searchParams.get("nickname")).toBe("Maple Hero");

    expect(fetchHeaderValue(options.headers, "x-api-key")).toBeNull();
  });

  it("returns API object error message on non-ok response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        error: {
          name: "OPENAPI0001",
          message: "invalid request",
        },
      }),
    } as unknown as Response);

    const error = await fetchUnionInfo("maple").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NexonApiError);
    expect((error as NexonApiError).status).toBe(400);
    expect((error as NexonApiError).code).toBe("OPENAPI0001");
    expect((error as NexonApiError).message).toBe("OPENAPI0001: invalid request");
  });

  it("returns API string error message on non-ok response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockResolvedValue({
        error: "temporary unavailable",
      }),
    } as unknown as Response);

    await expect(fetchUnionInfo("maple")).rejects.toThrow("temporary unavailable");
  });

  it("falls back to status-based message when error body is missing", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue(null),
    } as unknown as Response);

    await expect(fetchUnionInfo("maple")).rejects.toThrow("API request failed (500)");
  });

  it("returns parsed response for successful request", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(SUCCESS_RESPONSE),
    } as unknown as Response);

    await expect(fetchUnionInfo("maple")).resolves.toEqual(SUCCESS_RESPONSE);
  });

  it("throws controlled error when success response JSON parsing fails", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new Error("invalid json")),
    } as unknown as Response);

    await expect(fetchUnionInfo("maple")).rejects.toThrow(
      "Failed to parse JSON response: invalid json",
    );
  });

  it("falls back to status-based message when non-ok response JSON rejects", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: vi.fn().mockRejectedValue(new Error("body parse failed")),
    } as unknown as Response);

    await expect(fetchUnionInfo("maple")).rejects.toThrow("API request failed (502)");
  });

  it("propagates fetch reject error for network failures", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValue(new Error("network unavailable"));

    await expect(fetchUnionInfo("maple")).rejects.toThrow("network unavailable");
  });

  it("falls back to status message when error.name and error.message are non-string", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        error: {
          name: 123,
          message: { detail: "invalid" },
        },
      }),
    } as unknown as Response);

    await expect(fetchUnionInfo("maple")).rejects.toThrow("API request failed (400)");
  });

  it("falls back to status message when error field is unsupported type", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({
        error: 12345,
      }),
    } as unknown as Response);

    await expect(fetchUnionInfo("maple")).rejects.toThrow("API request failed (422)");
  });
});
