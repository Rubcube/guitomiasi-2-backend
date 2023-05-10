import { z } from 'zod';
import { validateCNPJ, validateCPF } from './customValidators';
import { numericString } from '.';

export const userName = z
    .string()
    .max(200, "Nome completo do usuário excede 200 caracteres.");
export const userEmail = z
    .string()
    .email("Endereço de e-mail não obedece o formato especificado.")
    .max(320, "Endereço de e-mail excede 320 caracteres.");
export const userPhone = numericString("Número de telefone contém caracteres não-numéricos")
    .max(13, "Número de telefone excede 13 dígitos");
const userCPF = numericString("CPF contém caracteres não-numéricos")
    .length(11)
    .refine(validateCPF, "CPF inserido não é válido");
const userCNPJ = numericString("CNPJ contém caracteres não-numéricos")
    .length(14)
    .refine(validateCNPJ, "CNPJ inserido não é válido");
export const userDocument = userCPF.or(userCNPJ);
export const userPassword = z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, "Senha deve conter letras, números e caracteres especiais");
