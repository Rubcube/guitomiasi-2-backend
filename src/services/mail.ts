import { createTransport } from "nodemailer";
import { signJWT } from "./jwt";

/**
 * Transport mailer criado pelo `nodemailer` para envio de emails.
 *
 * Utiliza um ambiente de teste, nenhum email é de fato enviado.
 */
export const mailerTransport = createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "942a2e305aa22f",
    pass: "a9635a98d35a66",
  },
});

/**
 * Envia um email a partir do endereço "noreply@rubbank.com" para
 * um determinado email.
 * @param to Email de destino
 * @param subject Assunto do email
 * @param message Texto do email
 */
export function sendMail(to: string, subject: string, message: string) {
  mailerTransport.sendMail({
    from: "noreply@rubbank.com",
    to,
    subject,
    text: message,
  });
}

/**
 * Envia um email de **verificação** para um determinado email.
 *
 * Lida com a geração do JWT utilizado
 * @param emailTo Email de destino
 */
export function sendVerificationMail(emailTo: string) {
  const emailedJWT = signJWT({ email: emailTo }, 86400);

  sendMail(
    emailTo,
    "Please verify your email",
    `0.0.0.0:3344/verify/${emailedJWT}`,
  );
}
