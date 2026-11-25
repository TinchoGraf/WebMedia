/** Errores que se pueden mostrar al usuario tal cual (los demás se registran y se muestra un mensaje genérico). */
export class ErrorVisible extends Error {
  constructor(message: string, public campos?: Record<string, string>) {
    super(message);
    this.name = "ErrorVisible";
  }
}
export class ErrorPermiso extends ErrorVisible {
  constructor(message = "No tenés permiso para hacer esto.") {
    super(message);
    this.name = "ErrorPermiso";
  }
}
export class ErrorSesion extends ErrorVisible {
  constructor() {
    super("Tu sesión venció. Volvé a entrar.");
    this.name = "ErrorSesion";
  }
}

export type Resultado<T = unknown> =
  | { ok: true; datos?: T; mensaje?: string }
  | { ok: false; error: string; campos?: Record<string, string> };
