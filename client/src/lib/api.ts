const API_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  errors?: Array<{ field: string; message: string }>;
  code?: string;
  data?: unknown;
  payload?: unknown;

  constructor(message: string, errors?: Array<{ field: string; message: string }>, code?: string, data?: unknown, payload?: unknown) {
    super(message);
    this.errors = errors;
    this.code = code;
    this.data = data;
    this.payload = payload;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("carbontwin_token");
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (response.status === 401) localStorage.removeItem("carbontwin_token");
  if (!response.ok) throw new ApiError(data.message ?? "Request failed", data.errors, data.code, data.data, data);
  return data;
}
