export default function checkUndefined(...args: any): boolean {
  for (const arg of args) {
    if (arg === undefined) return false;
  }

  return true;
}
