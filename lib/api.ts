export type ApiErrorKind =
  "network" | "timeout" | "auth" | "rate" | "server" | "client";

/** Error thrown by `api()`. `message` is always actionable Spanish copy. */
export class ApiError extends Error {
  // Explicit fields instead of parameter properties: Node's type stripping
  // (used by the test runner) only supports erasable TypeScript syntax.
  readonly kind: ApiErrorKind;
  readonly status: number;
  constructor(message: string, kind: ApiErrorKind, status = 0) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

export const NETWORK_MESSAGE =
  "No pudimos conectar con CompatiPC. Revise su conexión a internet e intente de nuevo en unos segundos.";
export const TIMEOUT_MESSAGE =
  "El servidor tardó demasiado en responder. Intente de nuevo; si el problema continúa, espere unos minutos o use el modo de demostración.";
export const SESSION_MESSAGE =
  "Su sesión expiró o no ha iniciado sesión. Ingrese de nuevo para continuar.";
export const RATE_MESSAGE =
  "Ha realizado demasiadas solicitudes en poco tiempo. Espere un minuto e intente de nuevo.";
export const SERVER_MESSAGE =
  "El servicio no está disponible en este momento. Sus datos están a salvo; intente de nuevo en unos minutos.";
const CLIENT_MESSAGE =
  "No pudimos completar la solicitud. Revise los datos e intente de nuevo.";

/** Server copy that is meant for operators, not for technicians. */
const operatorCopy =
  /cuota|configuraci[oó]n del servidor|clave en el servidor/i;

/** Nest sends validation errors as `message: string[]`; join them. */
export function serverText(message: unknown): string {
  if (Array.isArray(message)) {
    const parts = message
      .filter((m): m is string => typeof m === "string" && m.trim() !== "")
      .map((m) => m.trim().replace(/\.+$/, ""));
    return parts.length ? `${parts.join(". ")}.` : "";
  }
  return typeof message === "string" ? message.trim() : "";
}

/** Maps an HTTP status and the server message to technician-friendly copy. */
export function friendlyError(
  status: number,
  serverMessage: unknown,
  path = "",
): ApiError {
  const raw = serverText(serverMessage);
  const usable = raw && !operatorCopy.test(raw) && !/^[A-Za-z ]+$/.test(raw);
  if (status === 401)
    // Wrong credentials on login keep the server copy; elsewhere the session expired.
    return new ApiError(
      path.startsWith("/auth/") && usable ? raw : SESSION_MESSAGE,
      "auth",
      status,
    );
  if (status === 429) return new ApiError(RATE_MESSAGE, "rate", status);
  if (status === 504 || status === 408)
    return new ApiError(TIMEOUT_MESSAGE, "timeout", status);
  if (status >= 500)
    return new ApiError(
      usable && status !== 500 ? raw : SERVER_MESSAGE,
      "server",
      status,
    );
  return new ApiError(usable ? raw : CLIENT_MESSAGE, "client", status);
}

type ApiOptions = RequestInit & { timeoutMs?: number };

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { timeoutMs = 30000, signal, ...init } = options;
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw timedOut
      ? new ApiError(TIMEOUT_MESSAGE, "timeout")
      : new ApiError(NETWORK_MESSAGE, "network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // A proxy answering without JSON usually means the API process is down.
    if (body === null && res.status >= 500)
      throw new ApiError(SERVER_MESSAGE, "server", res.status);
    throw friendlyError(res.status, body?.message, path);
  }
  return body as T;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado.";
