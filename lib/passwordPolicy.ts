export const PASSWORD_REQUIREMENT_MESSAGE =
  "A senha deve ter no mínimo 8 caracteres, uma letra e um número.";

export const NEW_PASSWORD_REQUIREMENT_MESSAGE =
  "A nova senha deve ter no mínimo 8 caracteres, uma letra e um número.";

export function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Za-zÀ-ÿ]/.test(password) &&
    /\d/.test(password)
  );
}
