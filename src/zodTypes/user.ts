import { z } from 'zod';

export const userName = z
    .string()
    .max(200, "Nome completo do usuário excede 200 caracteres.");
export const userEmail = z
    .string()
    .email("Endereço de e-mail não obedece o formato especificado.")
    .max(320, "Endereço de e-mail excede 320 caracteres.");
export const userPhone = z
    .string()
    .regex(/\d+/, "Número de telefone contém caracteres não-numéricos")
    .max(13, "Número de telefone excede 13 dígitos");
export const userDocument = z
    .string()
    .min(11, "Documento não contém mínimo de 11 dígitos")
    .max(14, "Documento excede 14 dígitos");
export const userPassword = z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/);
