import { MailTrapConfig } from "config/mailtrap";
import { PathConfig } from "config/path";
import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { createTransport } from "nodemailer";
import { resolve } from "path";
import { signJWT } from "./jwt";

const templateFile = readFileSync(
  resolve(__dirname, "..", "templates", "mailTemplate.handlebars"),
  "utf-8",
);
const emailTemplate = Handlebars.compile(templateFile);
interface EmailTemplateContext {
  title: string;
  main_message: string;
  button_href?: string;
  button_text?: string;
  code_text?: string;
}

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
 * @param text Texto do email
 */
export function sendMail(
  to: string,
  subject: string,
  content: { text?: string; html?: string },
) {
  mailerTransport.sendMail({
    from: "noreply@rubbank.com",
    to,
    subject,
    text: content.text,
    html: content.html,
  });
}

/**
 * Envia um email a partir do endereço "noreply@rubbank.com" para
 * um determinado email, utilizando o template handlebars.
 * @param emailTo Email de destino
 * @param subject Assunto do email
 * @param context Contexto do template
 */
export function sendMailTemplate(
  emailTo: string,
  subject: string,
  context: EmailTemplateContext,
) {
  sendMail(emailTo, subject, { html: emailTemplate(context) });
}

/**
 * Envia um email de **verificação** para um determinado email.
 *
 * Lida com a geração do JWT utilizado
 * @param emailTo Email de destino
 */
export function sendVerificationMail(emailTo: string) {
  const emailedJWT = signJWT({ email: emailTo }, 86400);

  sendMailTemplate(emailTo, "Verifique seu email", {
    title: "Bem-vindo ao RubBank!",
    main_message:
      "Clique no botão abaixo para verificar seu email e começar a usar sua conta",
    button_href: `${PathConfig.BASE_PATH}/user/verify/${emailedJWT}`,
    button_text: "Verificar email",
  });
}

/**
 * Envia um email de **reset** de senha para um determinado email.
 * @param emailTo Email do usuário a ter sua senha resetada
 * @param resetPasswordToken Token de reset de senha, com 12 caracteres
 */
export function sendResetPasswordMail(
  emailTo: string,
  resetPasswordToken: string,
) {
  sendMailTemplate(emailTo, "Password change requested", {
    title: "Solicitação de troca de senha",
    main_message:
      "Uma solicitação de troca de senha foi enviada ao nosso serviço. Se você não realizou essa solicitação, ignore essa mensagem de email. Para prosseguir, insira o código abaixo no aplicativo:",
    code_text: resetPasswordToken,
  });
}
