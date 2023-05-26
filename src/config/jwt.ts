/**
 * Configurações relacionadas à geração de *JSON Web Tokens*
 * utilizados no projeto
 */
export const JWTConfig = {
  DEFAULT_EXPIRATION_TIME: 3600,
  SECRET_KEY: process.env.SECRET_JWT as string,
};
