export const jsonFetch = async <T>(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<T> => {
  const response = await fetch(input, { credentials: 'include', ...init });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || (data && !response.ok)) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return (data.data ?? data) as T;
};

export const jsonRequest = async <T>(
  input: RequestInfo,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data: unknown = {},
): Promise<T> => {
  return jsonFetch<T>(input, {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    method,
  });
};
