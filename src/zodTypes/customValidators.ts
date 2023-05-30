import { z } from "zod";

export function validateCPF(docString: string) {
  const digits = docString.split("").map(value => parseInt(value));
  // If all digits are the same, invalidate
  if (digits.every(value => value === digits[0])) return false;

  const firstNine = digits.slice(0, 9);
  const firstSum = firstNine.reduce(
    (previous, current, index) => (10 - index) * current + previous,
    0,
  );
  const firstRemainder = firstSum % 11;
  const firstVerifierDigit = firstRemainder < 2 ? 0 : 11 - firstRemainder;

  const firstTen = firstNine.concat(firstVerifierDigit);
  const secondSum = firstTen.reduce(
    (previous, current, index) => (11 - index) * current + previous,
    0,
  );
  const secondRemainder = secondSum % 11;
  const secondVerifierDigit = secondRemainder < 2 ? 0 : 11 - secondRemainder;

  return digits[9] === firstVerifierDigit && digits[10] === secondVerifierDigit;
}

export function validateCNPJ(docString: string) {
  const digits = docString.split("").map(value => parseInt(value));
  // If all digits are the same, invalidate
  if (digits.every(value => value === digits[0])) return false;

  const firstTwelve = digits.slice(0, 12);
  const multipliersTwelve = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const firstSum = firstTwelve.reduce(
    (previous, current, index) => multipliersTwelve[index] * current + previous,
    0,
  );
  const firstRemainder = firstSum % 11;
  const firstVerifierDigit = firstRemainder < 2 ? 0 : 11 - firstRemainder;

  const firstThirteen = firstTwelve.concat(firstVerifierDigit);
  const multipliersThirteen = [6, ...multipliersTwelve];
  const secondSum = firstThirteen.reduce(
    (previous, current, index) =>
      multipliersThirteen[index] * current + previous,
    0,
  );
  const secondRemainder = secondSum % 11;
  const secondVerifierDigit = secondRemainder < 2 ? 0 : 11 - secondRemainder;

  return (
    digits[12] === firstVerifierDigit && digits[13] === secondVerifierDigit
  );
}

/**
 * Valida que objeto contém pelo menos um campo definido.
 */
export function validateNotEmpty(obj: object, ctx: Zod.RefinementCtx) {
  const atLeastOneDefined = Object.values(obj).some(v => v !== undefined);

  if (atLeastOneDefined) {
    return obj;
  } else {
    ctx.addIssue({
      code: "invalid_type",
      path: ["any"],
      expected: "object",
      received: "undefined",
    });
  }
}

/**
 * Valida que objeto contém old_password e new_password diferentes entre si.
 */
export function validatePasswordNotEqual(
  obj: { old_password: string; new_password: string },
  ctx: Zod.RefinementCtx,
) {
  const { old_password, new_password } = obj;
  const isEqual = old_password == new_password;

  if (isEqual) {
    ctx.addIssue({
      code: "custom",
      path: ["old_password", "new_password"],
    });
    return z.NEVER;
  } else {
    return obj;
  }
}
