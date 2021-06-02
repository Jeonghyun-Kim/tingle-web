export default function isOneOf<T extends readonly any[]>(
  val: any,
  targets: T,
): val is T[number] {
  return targets.indexOf(val) > -1;
}
