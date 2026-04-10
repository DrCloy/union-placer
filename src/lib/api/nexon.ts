import type { NexonUnionInfoResponse } from "@/types/nexon";

export class NexonApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "NexonApiError";
    this.status = status;
    this.code = code;
  }
}

function parseApiError(status: number, body: unknown): NexonApiError {
  if (typeof body === "object" && body !== null && "error" in body) {
    const apiError = (body as { error: unknown }).error;
    if (typeof apiError === "object" && apiError !== null) {
      const code = "name" in apiError && typeof apiError.name === "string" ? apiError.name : "";
      const message =
        "message" in apiError && typeof apiError.message === "string" ? apiError.message : "";

      if (code.length > 0 || message.length > 0) {
        const detail =
          code.length > 0 && message.length > 0
            ? `${code}: ${message}`
            : code.length > 0
              ? code
              : message;
        return new NexonApiError(status, code, detail);
      }
    }

    if (typeof apiError === "string" && apiError.length > 0) {
      return new NexonApiError(status, "", apiError);
    }
  }

  return new NexonApiError(status, "", `API request failed (${status})`);
}

export async function fetchUnionInfo(
  nickname: string,
  apiKey?: string,
): Promise<NexonUnionInfoResponse> {
  const trimmedNickname = nickname.trim();
  const trimmedApiKey = apiKey?.trim();

  if (trimmedNickname.length === 0) {
    throw new NexonApiError(0, "", "Nickname is required");
  }

  const params = new URLSearchParams({ nickname: trimmedNickname });
  const requestHeaders = new Headers();

  // Avoid exposing credentials in query strings.
  if (trimmedApiKey !== undefined && trimmedApiKey.length > 0) {
    requestHeaders.set("x-api-key", trimmedApiKey);
  }

  const response = await fetch(`/api/nexon/union?${params.toString()}`, {
    headers: requestHeaders,
  });
  if (!response.ok) {
    const responseBody = (await response.json().catch(() => null)) as unknown;
    throw parseApiError(response.status, responseBody);
  }

  try {
    return (await response.json()) as NexonUnionInfoResponse;
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : String(parseError);
    throw new NexonApiError(response.status, "", `Failed to parse JSON response: ${message}`);
  }
}
