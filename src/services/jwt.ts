import { JWTConfig } from "config/jwt";
import { INTERNAL_ERROR, RubError } from "handlers/errors/RubError";
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";

/**
 * Assina um *JSON Web Token* para uso futuro
 * @param obj Objeto contido no JWT
 * @param seconds Duração do JWT até o mesmo expirar
 * @returns *JSON Web Token*
 */
export function signJWT(obj: object, seconds?: number) {
  seconds = seconds ? seconds : JWTConfig.DEFAULT_EXPIRATION_TIME;

  return sign(obj, JWTConfig.SECRET_KEY, {
    expiresIn: seconds,
  });
}

/**
 * Realiza o *parse* de um *JSON Web Token*.
 *
 * A partir do genérico `T` é possível assegurar que o JWT
 * contém ou não determinadas propriedades.
 *
 * @example parseJWT<{ email: string }> // Contém email!
 * @example parseJWT<{}> // Não verifica nenhum campo
 * @param jwt *JSON Web Token*
 * @throws Caso falhe o *parse*
 * @throws Caso falte um atributo
 * @throws Caso o JWT esteja expirado
 * @returns *Payload* do JWT e objeto contido dentro do mesmo
 */
export function parseJWT<T>(jwt: string) {
  try {
    const parsed = verify(jwt, JWTConfig.SECRET_KEY);
    if (typeof parsed === "string") {
      throw new JsonWebTokenError("JWT could not be parsed");
    } else {
      try {
        const token = parsed as T & typeof parsed;
        return token;
      } catch (error) {
        throw new JsonWebTokenError("JWT does not have the desired properties");
      }
    }
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      throw new RubError(
        403,
        "JWT could not be validated, as it is expired",
        "JWT-EXPIRED",
      );
    } else if (e instanceof JsonWebTokenError) {
      throw new RubError(403, "JWT parsing failed", "JWT-ERROR");
    } else {
      throw INTERNAL_ERROR;
    }
  }
}
