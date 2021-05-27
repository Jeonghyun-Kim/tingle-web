import isString from './isString';
import isEmail from 'validator/lib/isEmail';

export function isValidEmail(email: any): email is string {
  if (!isString(email))
    throw new Error(`Type error. expected: string, received: ${typeof email}`);
  if (!isEmail(email))
    throw new Error(`Invalid format of email. received: ${email}`);

  return true;
}
