// Plain .mjs so tsc (tsconfig includes only .ts/.tsx/.mts) does not require
// `allowImportingTsExtensions`; Node 24 strips the types of the imported .ts.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ApiError,
  friendlyError,
  RATE_MESSAGE,
  SERVER_MESSAGE,
  SESSION_MESSAGE,
  serverText,
  TIMEOUT_MESSAGE,
} from "../lib/api.ts";

describe("friendlyError status → kind", () => {
  const cases = [
    [401, "auth"],
    [429, "rate"],
    [408, "timeout"],
    [504, "timeout"],
    [500, "server"],
    [502, "server"],
    [503, "server"],
    [400, "client"],
    [403, "client"],
    [404, "client"],
  ];
  for (const [status, kind] of cases)
    it(`${status} → ${kind}`, () => {
      const error = friendlyError(status, "Mensaje del servidor.");
      assert.ok(error instanceof ApiError);
      assert.equal(error.kind, kind);
      assert.equal(error.status, status);
    });

  it("uses fixed copy for rate limits and timeouts", () => {
    assert.equal(friendlyError(429, "x").message, RATE_MESSAGE);
    assert.equal(friendlyError(504, "Gemini tardó.").message, TIMEOUT_MESSAGE);
  });

  it("never exposes a raw 500 message", () => {
    assert.equal(
      friendlyError(500, "Error interno detallado.").message,
      SERVER_MESSAGE,
    );
  });
});

describe("401 auth-path rule", () => {
  it("keeps the server copy on /auth/ paths (wrong credentials)", () => {
    const error = friendlyError(
      401,
      "Correo o contraseña incorrectos.",
      "/auth/login",
    );
    assert.equal(error.message, "Correo o contraseña incorrectos.");
    assert.equal(error.kind, "auth");
  });

  it("reports an expired session elsewhere", () => {
    const error = friendlyError(
      401,
      "Inicie sesión para continuar.",
      "/equipment",
    );
    assert.equal(error.message, SESSION_MESSAGE);
  });

  it("ignores English framework defaults even on /auth/", () => {
    assert.equal(
      friendlyError(401, "Unauthorized", "/auth/login").message,
      SESSION_MESSAGE,
    );
  });
});

describe("operator-copy filtering", () => {
  it("rewrites quota/configuration copy on 503", () => {
    const error = friendlyError(
      503,
      "Gemini no está disponible. Revise cuota y configuración del servidor. No se generó un resultado.",
    );
    assert.equal(error.message, SERVER_MESSAGE);
    assert.doesNotMatch(error.message, /cuota/);
  });

  it("rewrites 'clave en el servidor' copy", () => {
    assert.equal(
      friendlyError(503, "Configure la clave en el servidor.").message,
      SERVER_MESSAGE,
    );
  });

  it("keeps actionable Spanish 4xx copy", () => {
    assert.equal(
      friendlyError(404, "Consulta no encontrada.").message,
      "Consulta no encontrada.",
    );
  });

  it("falls back to generic client copy for empty or English messages", () => {
    assert.match(friendlyError(400, undefined).message, /Revise los datos/);
    assert.match(friendlyError(400, "Bad Request").message, /Revise los datos/);
  });
});

describe("Nest array messages", () => {
  it("joins string arrays with '. '", () => {
    assert.equal(
      serverText(["La marca es obligatoria.", "El modelo es obligatorio"]),
      "La marca es obligatoria. El modelo es obligatorio.",
    );
  });

  it("drops non-strings and blanks", () => {
    assert.equal(serverText(["  ", 3, "Dato inválido"]), "Dato inválido.");
    assert.equal(serverText([]), "");
  });

  it("is used by friendlyError", () => {
    assert.equal(
      friendlyError(400, ["Categoría inválida", "Referencia muy larga"])
        .message,
      "Categoría inválida. Referencia muy larga.",
    );
  });
});
