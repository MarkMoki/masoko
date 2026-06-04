export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
  }
}

function apiUrl(path: string) {
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (typeof window !== "undefined" && !base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(apiUrl(url), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      (data as { error?: string }).error ?? "Request failed",
      res.status
    );
  }

  return data as T;
}
