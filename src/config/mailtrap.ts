/**
 * Configurações relacionadas ao serviço do MailTrap.
 * Utilizado para simular envio e recebimento de emails.
 * Usuário e Senha são carregados de um arquivo de ambiente por
 * uma questão de segurança, para não expor essas credenciais.
 */
export const MailTrapConfig = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  user: process.env.MAILTRAP_USERNAME as string,
  pass: process.env.MAILTRAP_PASSWORD as string,
  rubMail: "noreply@rubbank.com",
};
