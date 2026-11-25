"use client";
import { createAuthClient } from "better-auth/react";
/** Cliente de auth del navegador. El login pasa por /api/auth/sign-in/email, que tiene límite de intentos. */
export const authClient = createAuthClient();
