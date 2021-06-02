export default function isString(
  val: any,
  options?: { minLength?: number; maxLength?: number },
): val is string {
  if (typeof val !== 'string') return false;

  if (options) {
    const { minLength, maxLength } = options;

    if (minLength !== undefined) {
      if (minLength < 0)
        throw new Error('[isString] options.minLength cannot be negative.');

      if (val.length < minLength) return false;
    }

    if (maxLength !== undefined) {
      if (maxLength < 0)
        throw new Error('[isString] options.maxLength cannot be negative.');

      if (val.length > maxLength) return false;
    }
  }

  return true;
}
