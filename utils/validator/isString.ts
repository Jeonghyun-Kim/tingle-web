export default function isString(val: any): val is string {
  return typeof val === 'string';
}
