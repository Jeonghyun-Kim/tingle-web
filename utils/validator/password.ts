import isString from './isString';

export function isValidPassword(password: any): password is string {
  if (!isString(password))
    throw new Error(
      `Type Error. expected: string, received: ${typeof password}`,
    );
  const { length } = password;
  if (length > 50 || length < 10)
    throw new Error(`Unacceptable password length: ${length}. (needed 10-50)`);

  return true;
}
