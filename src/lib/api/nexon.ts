import type { NexonUnionInfoResponse } from "@/types/nexon";

function createApiErrorMessage(status: number, body: unknown): string {
  if (typeof body === "object" && body !== null && "error" in body) {
    const apiError = (body as { error: unknown }).error;
    if (typeof apiError === "object" && apiError !== null) {
      const errorName = "name" in apiError ? apiError.name : "";
      const errorMessage = "message" in apiError ? apiError.message : "";

      if (typeof errorMessage === "string" && errorMessage.length > 0) {
        if (typeof errorName === "string" && errorName.length > 0) {
          return `${errorName}: ${errorMessage}`;
        }

        return errorMessage;
      }
    }

    if (typeof apiError === "string" && apiError.length > 0) {
      return apiError;
    }
  }

  return `API request failed (${status})`;
}

export async function fetchUnionInfo(
  nickname: string,
  apiKey?: string,
): Promise<NexonUnionInfoResponse> {
  const trimmedNickname = nickname.trim();

  if (trimmedNickname.length === 0) {
    throw new Error("Nickname is required");
  }

  const params = new URLSearchParams({ nickname: trimmedNickname });
  if (apiKey !== undefined && apiKey.trim().length > 0) {
    params.append("apiKey", apiKey.trim());
  }

  const response = await fetch(`/api/nexon/union?${params.toString()}`);
  if (!response.ok) {
    const responseBody = (await response.json().catch(() => null)) as unknown;
    throw new Error(createApiErrorMessage(response.status, responseBody));
  }

  try {
    return (await response.json()) as NexonUnionInfoResponse;
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : String(parseError);
    throw new Error(`Failed to parse JSON response: ${message}`);
  }
}
