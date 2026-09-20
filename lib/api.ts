export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = await res
    .json()
    .catch(() => ({ message: "No se pudo conectar con el servidor." }));
  if (!res.ok)
    throw new Error(
      typeof body.message === "string"
        ? body.message
        : "Ocurrió un error. Intente nuevamente.",
    );
  return body;
}
