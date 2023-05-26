import { MailTrapConfig } from "config/mailtrap";
import { createTransport } from "nodemailer";
import { signJWT } from "./jwt";

/**
 * Transport mailer criado pelo `nodemailer` para envio de emails.
 *
 * Utiliza um ambiente de teste, nenhum email é de fato enviado.
 */
export const mailerTransport = createTransport({
  host: MailTrapConfig.host,
  port: MailTrapConfig.port,
  auth: {
    user: MailTrapConfig.user,
    pass: MailTrapConfig.pass,
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
    `0.0.0.0:3344/user/verify/${emailedJWT}`,
  );
}

export function sendResetPasswordMail(id: string, emailTo: string) {
  const emailedJWT = signJWT({ id }, 3600);

  sendMail(
    emailTo,
    "Password change requested",
    `0.0.0.0:3344/user/password/new/${emailedJWT}`,
  );
}
